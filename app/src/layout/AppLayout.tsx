import { NavLink, Outlet } from "react-router-dom";
import { Avatar, BrandLockup, Icon, IconButton } from "../design-system";
import { useAuth } from "../auth/AuthContext";
import { useToast } from "../notifications/ToastProvider";
import "./AppLayout.css";

const NAV_ITEMS = [
    { to: "/", label: "Inicio", icon: "layout-dashboard", end: true },
    { to: "/perfil", label: "Perfil", icon: "user-round" },
    { to: "/instalar", label: "Instalar", icon: "download" }
];

export function AppLayout() {
    const { user, logout } = useAuth();
    const { showToast } = useToast();

    // No hay `navigate` acá a propósito: al quedar `user` en null, RequireAuth
    // desmonta este layout y manda al login.
    const handleLogout = () => {
        logout();
        showToast("success", "Sesión cerrada.");
    };

    return (
        <div className="app-shell">
            <header className="app-header">
                <NavLink to="/" className="app-brand" aria-label="Hexario, ir al inicio">
                    <BrandLockup height={22} />
                </NavLink>

                <nav className="app-nav" aria-label="Navegación principal">
                    {NAV_ITEMS.map((item) => (
                        <NavLink key={item.to} to={item.to} end={item.end} className="app-nav__item">
                            <Icon name={item.icon} size={18} />
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="app-user">
                    <Avatar name={user?.username ?? ""} size="sm" />
                    <span className="app-user__name">{user?.username}</span>
                    <IconButton icon="log-out" label="Cerrar sesión" size="sm" onClick={handleLogout} />
                </div>
            </header>

            <main className="app-main">
                <Outlet />
            </main>
        </div>
    );
}
