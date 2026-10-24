import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { FullscreenSpinner } from "../../components/FullscreenSpinner";

// Puerta de las pantallas privadas. Mientras la sesión guardada se está
// leyendo no se puede decidir todavía, así que se muestra el spinner en vez de
// rebotar al login (lo que expulsaría a alguien que sí está logueado).
export function RequireAuth() {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) return <FullscreenSpinner />;
    // `from` viaja para que el login devuelva a la pantalla pedida, no siempre al inicio.
    if (!user) return <Navigate to="/login" replace state={{ from: location }} />;

    return <Outlet />;
}
