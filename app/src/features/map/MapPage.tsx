import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { latLngToCell } from 'h3-js';
import {
  BottomSheet,
  Button,
  Chip,
  HEX_RESOLUTION,
  HeroNumber,
  HexarioMark,
  HexCard,
  IconButton,
  IconClose,
  IconLocate,
  IconPause,
  IconPlay,
  IconTicket,
  StatRow,
  formatPoints,
  useTheme,
  useToast,
  type HexCell,
  type SheetSnap,
} from '../../design-system';
import { ApiError } from '../../api/client';
import {
  apiErrorCode,
  claimTerritory,
  getMineCount,
  territoryFromError,
} from '../../api/territories';
import { useAuth } from '../../auth/AuthContext';
import { AppNav } from '../../layout/AppNav';
import { getErrorMessage } from '../../lib/errors';
import { useGeoLocation, type GeoPosition } from './useGeoLocation';
import { useTerritories } from './useTerritories';
import { useBusinesses, usePromotions } from '../businesses/useCatalog';
import { useHexarioMap, type MapBounds } from './useHexarioMap';
import {
  colorForPlayer,
  describeH3,
  hexCardState,
  protectionLeftMs,
  toHexCellFromTerritory,
} from './territoryMapping';

const SHEET_HEIGHTS: Record<SheetSnap, number> = { min: 88, mid: 300, full: 420 };

// La hoja suma, además del cuerpo, el agarre y la nav inferior. Se descuenta
// para que los controles flotantes queden siempre por encima del panel.
const SHEET_CHROME = 48;

const floatingControlBottom = (snap: SheetSnap) =>
  `calc(${SHEET_HEIGHTS[snap]}px + ${SHEET_CHROME}px + var(--hx-nav) + env(safe-area-inset-bottom) + 16px)`;

const ACTION_COOLDOWN_MS = 10_000;

const FIXED_ACTION_MESSAGE = {
  mine: 'Ya es tuyo. La renovación todavía no está disponible.',
  stealable: 'El robo todavía no está disponible.',
} as const;

export function MapPage() {
  const { theme } = useTheme();
  const toast = useToast();
  const { user, logout } = useAuth();
  const username = user?.username;
  const navigate = useNavigate();

  const mapContainer = useRef<HTMLDivElement>(null);
  const claimingRef = useRef(false);
  const lastClaimCellRef = useRef<string | null>(null);
  const pendingClaimRef = useRef<string | null>(null);
  const lastClaimAtRef = useRef(0);
  const hasCenteredRef = useRef(false);

  const [snap, setSnap] = useState<SheetSnap>(() => (window.innerHeight < 680 ? 'min' : 'mid'));
  const [selected, setSelected] = useState<string | null>(null);
  const [selectedBusinessId, setSelectedBusinessId] = useState<number | null>(null);
  const [mineCount, setMineCount] = useState(0);
  const [locationMessage, setLocationMessage] = useState<string | null>(null);

  const { data, loading, error: territoriesError, setBbox, refresh: refreshTerritories } = useTerritories();
  const { data: businesses } = useBusinesses();
  const { data: promotions } = usePromotions();
  const { position, status, error: geoError, active, start, stop } = useGeoLocation();

  const refreshMine = useCallback(async () => {
    try {
      setMineCount(await getMineCount());
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) logout();
    }
  }, [logout]);

  useEffect(() => {
    void refreshMine();
  }, [refreshMine]);

  const cells = useMemo(() => {
    const mapped: HexCell[] = (data?.cells ?? []).map((cell) =>
      toHexCellFromTerritory(cell, username, colorForPlayer, cell.id === selected),
    );
    if (selected && !mapped.some((cell) => cell.h3 === selected)) {
      mapped.push({ h3: selected, owner: null, selected: true });
    }
    return mapped;
  }, [data, username, selected]);

  const handleSelectHex = useCallback((h3: string | null) => {
    pendingClaimRef.current = null;
    setSelectedBusinessId(null);
    setSelected(h3);
    if (h3) setSnap((current) => (current === 'min' ? 'mid' : current));
  }, []);

  const handleSelectBusiness = useCallback((id: number) => {
    setSelectedBusinessId((current) => (current === id ? null : id));
    setSelected(null);
    pendingClaimRef.current = null;
    setSnap((current) => (current === 'min' ? 'mid' : current));
  }, []);

  const handleBoundsChange = useCallback(
    (bounds: MapBounds) => {
      setBbox(bounds);
    },
    [setBbox],
  );

  const businessMarkers = useMemo(() => businesses ?? [], [businesses]);
  const selectedBusiness = useMemo(
    () => businessMarkers.find((business) => business.id === selectedBusinessId) ?? null,
    [businessMarkers, selectedBusinessId],
  );
  const businessPromotions = useMemo(
    () => (promotions ?? []).filter((promotion) => promotion.business.id === selectedBusinessId),
    [promotions, selectedBusinessId],
  );

  const { centerOnLocation } = useHexarioMap({
    container: mapContainer,
    theme,
    cells,
    businesses: businessMarkers,
    selectedBusinessId,
    location: position,
    onSelectHex: handleSelectHex,
    onSelectBusiness: handleSelectBusiness,
    onBoundsChange: handleBoundsChange,
  });

  const selectedDescriptor = useMemo(
    () => (selected ? describeH3(data, selected, username, position, colorForPlayer) : null),
    [data, selected, username, position],
  );
  const selectedState = selectedDescriptor ? hexCardState(selectedDescriptor) : null;

  const visibleMine = useMemo(
    () => (data?.cells ?? []).filter((cell) => cell.owner?.username === username),
    [data, username],
  );
  const protectedCount = visibleMine.filter((cell) => protectionLeftMs(cell.claimedAt) > 0).length;
  const stealableCount = visibleMine.length - protectedCount;

  const attemptClaim = useCallback(
    async (current: GeoPosition) => {
      if (claimingRef.current) return;

      if (current.accuracy > 50) {
        setLocationMessage(`Esperando mejor precisión (${Math.round(current.accuracy)} m)`);
        return;
      }

      claimingRef.current = true;
      try {
        const result = await claimTerritory({
          latitude: current.latitude,
          longitude: current.longitude,
          accuracy: current.accuracy,
          recordedAt: new Date(current.timestamp || Date.now()).toISOString(),
        });

        setLocationMessage(null);
        if (result.claimed) {
          toast('¡Nuevo hexágono conquistado!');
          refreshTerritories();
          await refreshMine();
        }
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          logout();
          toast('Tu sesión venció. Volvé a ingresar.');
          return;
        }

        const code = apiErrorCode(err);
        if (code === 'TERRITORY_OWNED') {
          const territory = territoryFromError(err);
          if (territory) {
            setLocationMessage(`Ese hexágono es de ${territory.owner?.username ?? 'otro jugador'}`);
          }
          refreshTerritories();
          return;
        }
        if (code === 'LOCATION_STALE') {
          lastClaimCellRef.current = null;
          setLocationMessage('La ubicación se actualizó. Reintentando…');
          return;
        }
        if (code === 'LOCATION_INACCURATE') {
          setLocationMessage('Esperando mejor precisión…');
          return;
        }
        if (code === 'OUTSIDE_GAME_AREA') {
          setLocationMessage('Estás fuera del área de juego');
          return;
        }

        setLocationMessage(getErrorMessage(err));
      } finally {
        claimingRef.current = false;
      }
    },
    [logout, refreshMine, refreshTerritories, toast],
  );

  useEffect(() => {
    if (!active || !position || !username) return;
    if (position.accuracy > 50) return;

    const cell = latLngToCell(position.latitude, position.longitude, HEX_RESOLUTION);
    const pending = pendingClaimRef.current;

    // Si la persona tocó "Reclamar" sobre un hexágono, esperamos a que su
    // ubicación entre en esa celda y recién ahí disparamos el claim.
    if (pending) {
      if (cell !== pending) return;
      pendingClaimRef.current = null;
      if (claimingRef.current) return;
      lastClaimCellRef.current = cell;
      lastClaimAtRef.current = Date.now();
      void attemptClaim(position);
      return;
    }

    if (cell === lastClaimCellRef.current) return;
    if (Date.now() - lastClaimAtRef.current < ACTION_COOLDOWN_MS) return;

    lastClaimCellRef.current = cell;
    lastClaimAtRef.current = Date.now();
    void attemptClaim(position);
  }, [active, position, username, attemptClaim]);

  useEffect(() => {
    if (!position || hasCenteredRef.current) return;
    hasCenteredRef.current = true;
    centerOnLocation();
  }, [position, centerOnLocation]);

  const handleWalkToggle = () => {
    if (active) {
      stop();
      lastClaimCellRef.current = null;
      pendingClaimRef.current = null;
      setLocationMessage(null);
      toast('Caminata detenida');
      return;
    }

    hasCenteredRef.current = false;
    setLocationMessage(null);
    start();
    toast('Caminata iniciada');
  };

  const handleCenterOnLocation = () => {
    if (!position) {
      start();
      setLocationMessage('Activando ubicación…');
      return;
    }
    centerOnLocation();
  };

  const handleHexAction = () => {
    if (!selectedDescriptor || !selectedState) return;

    if (selectedState === 'free') {
      if (!position) {
        pendingClaimRef.current = selectedDescriptor.h3;
        start();
        setLocationMessage('Activando ubicación para reclamar…');
        return;
      }

      if (position.accuracy > 50) {
        pendingClaimRef.current = selectedDescriptor.h3;
        setLocationMessage(`Esperando mejor precisión (${Math.round(position.accuracy)} m)`);
        return;
      }

      const cell = latLngToCell(position.latitude, position.longitude, HEX_RESOLUTION);
      if (cell !== selectedDescriptor.h3) {
        pendingClaimRef.current = selectedDescriptor.h3;
        const distance = selectedDescriptor.distanceM;
        setLocationMessage(
          distance > 0
            ? `Estás a ${distance} m. Acercate al hexágono para reclamarlo.`
            : 'Acercate al hexágono para reclamarlo.',
        );
        toast('Acercate al hexágono seleccionado');
        return;
      }

      void attemptClaim(position);
      return;
    }

    if (selectedState === 'mine' || selectedState === 'stealable') {
      toast(FIXED_ACTION_MESSAGE[selectedState]);
    }
  };

  const accuracyMessage =
    active && position && position.accuracy > 50
      ? `Esperando mejor precisión (${Math.round(position.accuracy)} m)`
      : null;
  const statusMessage = geoError ?? accuracyMessage ?? locationMessage;
  const mapHint = useMemo(() => {
    if (territoriesError) {
      return apiErrorCode(territoriesError) === 'MAP_AREA_TOO_LARGE'
        ? 'Acercá el mapa para ver los hexágonos'
        : 'No pudimos cargar el mapa. Movelo para reintentar.';
    }
    if (loading && !data) return 'Cargando hexágonos…';
    if (data && data.cells.length === 0) return 'Movete dentro de Rosario para ver hexágonos';
    return null;
  }, [territoriesError, loading, data]);

  return (
    <div className="hx-map-screen">
      <div
        ref={mapContainer}
        className="hx-map-canvas"
        role="region"
        aria-label="Mapa de hexágonos de Rosario"
      />

      <div className="hx-map-top">
        <div className="hx-map-top__row">
          <span className="hx-float-pill">
            <HexarioMark size={20} />
            <span style={{ fontWeight: 600 }}>Centro</span>
            <span className="hx-caption">· Rosario</span>
          </span>
          {active && <Chip tone="ok">Caminando</Chip>}
        </div>
        {mapHint && (
          <div className="hx-map-hint" role="status">
            {mapHint}
          </div>
        )}
        {statusMessage && (
          <div className="hx-map-status" role="status">
            {statusMessage}
          </div>
        )}
      </div>

      {snap !== 'full' && (
        <>
          <div className="hx-map-attrib" style={{ bottom: floatingControlBottom(snap) }}>
            <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">
              © OpenStreetMap
            </a>
            <span aria-hidden="true">·</span>
            <a href="https://openfreemap.org" target="_blank" rel="noreferrer">
              OpenFreeMap
            </a>
          </div>

          <IconButton
            aria-label="Centrar en mi ubicación"
            className="hx-map-locate"
            style={{ bottom: floatingControlBottom(snap) }}
            onClick={handleCenterOnLocation}
          >
            <IconLocate size={22} />
          </IconButton>
        </>
      )}

      <BottomSheet
        label={selectedBusiness ? 'Local adherido' : selectedDescriptor ? 'Hexágono seleccionado' : 'Resumen de tus hexágonos'}
        snap={snap}
        onSnapChange={setSnap}
        heights={SHEET_HEIGHTS}
        footer={<AppNav fixed={false} />}
      >
        {selectedBusiness ? (
          <>
            <div className="hx-sheet__row" style={{ alignItems: 'center' }}>
              <span className="hx-label">Local adherido</span>
              <IconButton
                aria-label="Cerrar local"
                variant="subtle"
                onClick={() => setSelectedBusinessId(null)}
              >
                <IconClose size={18} />
              </IconButton>
            </div>
            <article className="hx-card hx-card--flat" aria-label={selectedBusiness.name}>
              <div className="hx-owner">
                <span className="hx-avatar hx-avatar--outline" aria-hidden="true">
                  <IconTicket size={18} />
                </span>
                <span className="hx-owner__text">
                  <span className="hx-owner__name">{selectedBusiness.name}</span>
                  <span className="hx-caption">
                    {selectedBusiness.neighborhood} · {selectedBusiness.address}
                  </span>
                </span>
                {businessPromotions.length > 0 && (
                  <Chip tone="ok" size="sm">
                    {businessPromotions.length} promos
                  </Chip>
                )}
              </div>
              <p className="hx-caption">{selectedBusiness.description}</p>
              {businessPromotions.length > 0 ? (
                <ul className="hx-business-promos">
                  {businessPromotions.slice(0, 3).map((promotion) => (
                    <li key={promotion.id} className="hx-business-promo">
                      <span>{promotion.title}</span>
                      <span>{formatPoints(promotion.costPoints)} pts</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="hx-caption">Sin promos disponibles por ahora.</p>
              )}
              <Button variant="secondary" onClick={() => navigate('/canjes')}>
                Ver todos los canjes
              </Button>
            </article>
          </>
        ) : selectedDescriptor && selectedState ? (
          <>
            <div className="hx-sheet__row" style={{ alignItems: 'center' }}>
              <span className="hx-label">Hexágono</span>
              <IconButton aria-label="Cerrar tarjeta" variant="subtle" onClick={() => handleSelectHex(null)}>
                <IconClose size={18} />
              </IconButton>
            </div>
            <HexCard
              state={selectedState}
              ownerName={selectedDescriptor.ownerName}
              ownerColor={selectedDescriptor.ownerColor}
              place={selectedDescriptor.place}
              rentPerHour={selectedDescriptor.rentPerHour}
              protectionLeftMs={selectedDescriptor.protectionLeftMs}
              legendary={selectedDescriptor.legendary}
              float={false}
              className="hx-card--flat"
              onAction={handleHexAction}
              onNotify={() => toast('Te avisamos cuando se libere')}
            />
          </>
        ) : (
          <>
            <div className="hx-sheet__row">
              <HeroNumber label="Tus hexágonos" value={formatPoints(mineCount)} unit="hx" />
              {status === 'active' && (
                <Chip tone="ok">
                  Ubicación activa
                </Chip>
              )}
            </div>
            <StatRow
              stats={[
                { label: 'En vista', value: visibleMine.length },
                { label: 'Protegidos', value: protectedCount },
                {
                  label: 'Robables',
                  value: stealableCount,
                  tone: stealableCount > 0 ? 'alert' : 'default',
                },
              ]}
            />
            <Button
              icon={active ? <IconPause size={20} strokeWidth={2} /> : <IconPlay size={20} strokeWidth={2} />}
              onClick={handleWalkToggle}
            >
              {active ? 'Detener caminata' : 'Empezar caminata'}
            </Button>
          </>
        )}
      </BottomSheet>
    </div>
  );
}
