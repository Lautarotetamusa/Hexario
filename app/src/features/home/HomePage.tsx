import { useNavigate } from "react-router-dom";
import { Badge, Button, Card, Icon } from "../../design-system";
import { useAuth } from "../../auth/AuthContext";
import { InstallAppBanner } from "../pwa/InstallAppBanner";

const NEXT_STEPS = [
    "Reemplazá el home por la pantalla principal de tu producto.",
    "Agregá un módulo nuevo en back/ y su API en src/api/.",
    "Usá los componentes de src/design-system/ antes de crear UI nueva."
];

export function HomePage() {
    const { user } = useAuth();
    const navigate = useNavigate();

    return (
        <div className="page-stack">
            <header className="page-heading">
                <span className="eyebrow">Inicio</span>
                <h1>Hola, {user?.username}</h1>
                <p>
                    Esta es la base PWA de Hexario: sesión contra el backend, instalación en el dispositivo y
                    navegación lista para que empieces a construir.
                </p>
            </header>

            <InstallAppBanner />

            <div className="card-grid">
                <Card
                    title="Tu cuenta"
                    subtitle="La sesión ya está activa."
                    actions={<Badge tone="success" dot>Sesión activa</Badge>}
                >
                    <div className="card-body">
                        <p className="muted">
                            Estás dentro como <strong>{user?.username}</strong>. Desde el perfil podés ver tu email y
                            actualizarlo.
                        </p>
                        <Button variant="secondary" iconStart="user-round" onClick={() => navigate("/perfil")}>
                            Ver perfil
                        </Button>
                    </div>
                </Card>

                <Card title="Instalá la app" subtitle="Abre desde el ícono, sin la barra del navegador.">
                    <div className="card-body">
                        <p className="muted">
                            La PWA ya tiene manifest, service worker y pantalla offline. En Chrome o Edge vas a ver el
                            prompt nativo de instalación.
                        </p>
                        <Button iconStart="download" onClick={() => navigate("/instalar")}>
                            Cómo instalarla
                        </Button>
                    </div>
                </Card>
            </div>

            <Card title="Siguientes pasos" subtitle="Lo que dejamos preparado para el equipo.">
                <ul className="next-steps">
                    {NEXT_STEPS.map((step) => (
                        <li key={step}>
                            <Icon name="circle-check" size={17} color="var(--pino-600)" />
                            <span>{step}</span>
                        </li>
                    ))}
                </ul>
            </Card>
        </div>
    );
}
