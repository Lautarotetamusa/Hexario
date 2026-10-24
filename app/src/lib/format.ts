// Formato único de fecha/hora del proyecto (dd/mm/yyyy HH:mm, hora local):
// si otra pantalla muestra una fecha, reusa esto en vez de repetir Intl.
export function formatDateTime(iso: string): string {
    return new Intl.DateTimeFormat("es-AR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    }).format(new Date(iso));
}

// Fecha sola (dd/mm/yyyy), para los casos en que la hora no aporta (un registro
// de la semana pasada). Comparte el mismo formato que formatDateTime.
export function formatDate(iso: string): string {
    return new Intl.DateTimeFormat("es-AR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    }).format(new Date(iso));
}

const RELATIVE = new Intl.RelativeTimeFormat("es-AR", { numeric: "auto" });

// "Hace cuánto" de un instante pasado, en castellano rioplatense ("hace 5
// minutos", "ayer"). Pasada una semana la distancia pierde precisión útil, así
// que cae a la fecha exacta en vez de seguir contando "hace 23 días".
export function formatRelativeTime(iso: string, now: Date = new Date()): string {
    const seconds = Math.round((new Date(iso).getTime() - now.getTime()) / 1000);
    const absSeconds = Math.abs(seconds);

    if (absSeconds < 60) return seconds > 0 ? "en un momento" : "hace un momento";

    const minutes = Math.round(seconds / 60);
    if (Math.abs(minutes) < 60) return RELATIVE.format(minutes, "minute");

    const hours = Math.round(minutes / 60);
    if (Math.abs(hours) < 24) return RELATIVE.format(hours, "hour");

    const days = Math.round(hours / 24);
    if (Math.abs(days) < 7) return RELATIVE.format(days, "day");

    return formatDate(iso);
}

// Cifras es-AR con separador de miles: 1.842, 12.500. Los contadores de la UI
// (me gusta) la usan para no repetir toLocaleString en cada pantalla.
export function formatCount(value: number): string {
    return value.toLocaleString("es-AR");
}
