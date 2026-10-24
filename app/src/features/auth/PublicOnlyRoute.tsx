import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { FullscreenSpinner } from "../../components/FullscreenSpinner";

// Espejo de RequireAuth: con la sesión ya abierta, login y registro no tienen
// nada que ofrecer, así que quien caiga ahí va derecho al inicio.
export function PublicOnlyRoute() {
    const { user, loading } = useAuth();

    if (loading) return <FullscreenSpinner />;
    if (user) return <Navigate to="/" replace />;

    return <Outlet />;
}
