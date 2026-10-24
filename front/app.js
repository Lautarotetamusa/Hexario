const API_URL = window.HEXARIO_API_URL || `${window.location.protocol}//${window.location.hostname}:3001`;
const TOKEN_KEY = "hexario-token";
const $ = (id) => document.getElementById(id);

const map = L.map("map", { zoomControl: false, minZoom: 11, maxZoom: 19 }).setView([-32.949, -60.698], 13);
L.control.zoom({ position: "bottomright" }).addTo(map);
L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

const hexLayer = L.layerGroup().addTo(map);
const positionLayer = L.layerGroup().addTo(map);
let currentUser = null;
let token = localStorage.getItem(TOKEN_KEY);
let watchId = null;
let lastPosition = null;
let lastAttemptedBoundary = null;
let selectedCellId = null;
let visibleCells = [];
let mapRequest = null;
let toastTimer = null;
let authMode = "login";
let claiming = false;

function showToast(message) {
    const toast = $("toast");
    toast.textContent = message;
    toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toast.hidden = true; }, 5000);
}

async function api(path, options = {}) {
    const headers = { ...(options.body ? { "Content-Type": "application/json" } : {}), ...(token ? { Authorization: `Bearer ${token}` } : {}) };
    const response = await fetch(`${API_URL}${path}`, { ...options, headers: { ...headers, ...options.headers } });
    const payload = await response.json();
    if (!response.ok) {
        const error = new Error(payload.errors?.[0]?.message || "No se pudo completar la operación");
        error.status = response.status;
        error.code = payload.errors?.[0]?.code;
        error.territory = payload.errors?.[0]?.territory;
        throw error;
    }
    return payload.data ?? payload;
}

function setAuthMode(mode) {
    authMode = mode;
    $("login-tab").classList.toggle("active", mode === "login");
    $("register-tab").classList.toggle("active", mode === "register");
    $("email").hidden = mode !== "register";
    $("email-label").hidden = mode !== "register";
    $("email").required = mode === "register";
    $("auth-submit").firstChild.textContent = mode === "register" ? "Crear cuenta " : "Entrar al juego ";
}

function renderAccount() {
    $("logged-out").hidden = Boolean(currentUser);
    $("logged-in").hidden = !currentUser;
    if (!currentUser) return;
    $("player-name").textContent = currentUser.username;
    $("avatar").textContent = currentUser.username[0].toUpperCase();
}

async function loadAccount() {
    if (!token) { currentUser = null; renderAccount(); return; }
    try {
        currentUser = await api("/user");
        renderAccount();
        await refreshCount();
        renderCells();
    } catch (error) {
        if (error.status === 401) logout();
        else showToast("No se pudo cargar tu perfil. Reintentá al actualizar.");
    }
}

function logout() {
    if (watchId !== null) stopLocation();
    token = null;
    currentUser = null;
    localStorage.removeItem(TOKEN_KEY);
    renderAccount();
    renderCells();
}

async function refreshCount() {
    if (!currentUser) return;
    try {
        const { count } = await api("/territories/mine");
        $("territory-count").textContent = count;
    } catch { showToast("No se pudo actualizar tu cantidad de hexágonos."); }
}

function cellStyle(cell) {
    const mine = currentUser && cell.owner?.username === currentUser.username;
    return {
        color: mine ? "#0f654d" : cell.owner ? "#aa583f" : "#8fb54e",
        weight: selectedCellId === cell.id ? 3 : 1.1,
        fillColor: mine ? "#28a475" : cell.owner ? "#ef8f63" : "#d7fd94",
        fillOpacity: mine ? 0.5 : cell.owner ? 0.43 : 0.31
    };
}

function selectCell(cell) {
    selectedCellId = cell.id;
    $("cell-detail").hidden = false;
    $("detail-id").textContent = cell.id;
    $("detail-status").textContent = cell.owner
        ? cell.owner.username === currentUser?.username ? "Este hexágono es tuyo" : `Conquistado por ${cell.owner.username}`
        : "Libre · entrá caminando para conquistarlo";
    renderCells();
}

function renderCells() {
    hexLayer.clearLayers();
    for (const cell of visibleCells) {
        L.polygon(cell.boundary, cellStyle(cell)).on("click", () => selectCell(cell)).addTo(hexLayer);
    }
}

async function refreshMap() {
    if (mapRequest) mapRequest.abort();
    mapRequest = new AbortController();
    const bounds = map.getBounds();
    const bbox = [bounds.getSouth(), bounds.getWest(), bounds.getNorth(), bounds.getEast()].join(",");
    try {
        const data = await api(`/territories?bbox=${encodeURIComponent(bbox)}`, { signal: mapRequest.signal });
        visibleCells = data.cells;
        $("map-hint").hidden = visibleCells.length > 0;
        if (!$("map-hint").hidden) $("map-hint").textContent = "Mové el mapa hacia Rosario";
        renderCells();
    } catch (error) {
        if (error.name === "AbortError") return;
        visibleCells = [];
        renderCells();
        $("map-hint").hidden = false;
        $("map-hint").textContent = error.code === "MAP_AREA_TOO_LARGE" ? "Acercá el mapa para ver las celdas" : "No se pudo cargar el mapa. Movelo para reintentar.";
    }
}

function pointInCell(latitude, longitude, boundary) {
    let inside = false;
    for (let i = 0, j = boundary.length - 1; i < boundary.length; j = i++) {
        const [latA, lngA] = boundary[i];
        const [latB, lngB] = boundary[j];
        if ((latA > latitude) !== (latB > latitude) &&
            longitude < ((lngB - lngA) * (latitude - latA)) / (latB - latA) + lngA) inside = !inside;
    }
    return inside;
}

async function claimAt(position) {
    if (claiming || !currentUser) return;
    const { latitude, longitude, accuracy } = position.coords;
    if (lastAttemptedBoundary && pointInCell(latitude, longitude, lastAttemptedBoundary)) return;
    if (accuracy > 50) {
        $("location-state").textContent = `Esperando mejor precisión (${Math.round(accuracy)} m)`;
        return;
    }
    claiming = true;
    try {
        const result = await api("/territories/claim", {
            method: "POST",
            body: JSON.stringify({ latitude, longitude, accuracy, recordedAt: new Date(position.timestamp).toISOString() })
        });
        lastAttemptedBoundary = result.territory.boundary;
        $("location-state").textContent = `Ubicación activa · precisión ${Math.round(accuracy)} m`;
        if (result.claimed) {
            showToast("¡Nuevo hexágono conquistado!");
            refreshCount();
            refreshMap();
        }
    } catch (error) {
        if (error.territory?.boundary) {
            lastAttemptedBoundary = error.territory.boundary;
            visibleCells = visibleCells.map((cell) => cell.id === error.territory.id ? error.territory : cell);
            renderCells();
        }
        if (error.status === 401) { logout(); showToast("Tu sesión venció. Volvé a ingresar."); }
        else if (error.code === "TERRITORY_OWNED") $("location-state").textContent = "Ubicación activa · este hexágono ya tiene dueño";
        else if (error.code === "OUTSIDE_GAME_AREA") $("location-state").textContent = "Fuera del área de juego";
        else $("location-state").textContent = error.message;
    } finally { claiming = false; }
}

function onPosition(position) {
    lastPosition = position;
    positionLayer.clearLayers();
    L.circleMarker([position.coords.latitude, position.coords.longitude], {
        radius: 7, color: "#ffffff", weight: 3, fillColor: "#155bce", fillOpacity: 1
    }).addTo(positionLayer);
    claimAt(position);
}

function stopLocation() {
    navigator.geolocation.clearWatch(watchId);
    watchId = null;
    lastAttemptedBoundary = null;
    positionLayer.clearLayers();
    $("location-button").classList.remove("active");
    $("location-button").innerHTML = '<span class="pulse-icon">◎</span> Activar ubicación';
    $("location-state").textContent = "Ubicación desactivada";
}

function startLocation() {
    if (!currentUser) { showToast("Ingresá o creá una cuenta para reclamar hexágonos."); return; }
    if (!navigator.geolocation) { showToast("Este navegador no tiene geolocalización."); return; }
    watchId = navigator.geolocation.watchPosition(onPosition, (error) => {
        $("location-state").textContent = error.code === 1 ? "Permiso de ubicación denegado" : "No se pudo obtener tu ubicación";
    }, { enableHighAccuracy: true, maximumAge: 0, timeout: 20000 });
    $("location-button").classList.add("active");
    $("location-button").innerHTML = '<span class="pulse-icon">◉</span> Detener ubicación';
    $("location-state").textContent = "Buscando tu ubicación…";
}

$("auth-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const button = $("auth-submit");
    button.disabled = true;
    const username = $("username").value.trim();
    const password = $("password").value;
    try {
        if (authMode === "register") {
            await api("/user/register", { method: "POST", body: JSON.stringify({ username, password, email: $("email").value.trim() }) });
        }
        const result = await api("/user/login", { method: "POST", body: JSON.stringify({ username, password }) });
        token = result.token;
        localStorage.setItem(TOKEN_KEY, token);
        await loadAccount();
        showToast(`¡Bienvenido a Hexario, ${username}!`);
    } catch (error) { showToast(error.message); }
    finally { button.disabled = false; }
});

$("login-tab").addEventListener("click", () => setAuthMode("login"));
$("register-tab").addEventListener("click", () => setAuthMode("register"));
$("logout").addEventListener("click", logout);
$("location-button").addEventListener("click", () => watchId === null ? startLocation() : stopLocation());
$("center-button").addEventListener("click", () => {
    if (!lastPosition) { showToast("Activá tu ubicación para centrar el mapa."); return; }
    map.setView([lastPosition.coords.latitude, lastPosition.coords.longitude], 16);
});
$("close-detail").addEventListener("click", () => { $("cell-detail").hidden = true; selectedCellId = null; renderCells(); });
map.on("moveend", refreshMap);
refreshMap();
loadAccount();
