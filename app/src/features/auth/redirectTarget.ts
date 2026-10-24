// A dónde volver después de ingresar: al destino que `RequireAuth` guardó al
// rebotar la visita, o al inicio. Se descartan las propias pantallas de sesión
// para no caer en un ida y vuelta login → login.
export function redirectTarget(state: unknown): string {
    const from = (state as { from?: { pathname?: string } } | null)?.from?.pathname;
    if (!from || from.startsWith("/login") || from.startsWith("/registro")) return "/";
    return from;
}
