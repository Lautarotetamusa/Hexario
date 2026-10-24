import { Button, Card, EmptyState } from "../../design-system";
import { useInstallPrompt } from "./useInstallPrompt";

// Pantalla completa: sin conexión no hay datos que mostrar, así que se explica
// qué pasa y se ofrece reintentar sin sacar a la persona de la app. No lleva
// Topbar ni Sidebar a propósito — no hay nada navegable mientras dure el corte.
export function OfflineScreen() {
    const { canInstall, install } = useInstallPrompt();

    return (
        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "var(--gutter-page)",
                background: "var(--surface-page)"
            }}
        >
            <div style={{ width: "100%", maxWidth: 480 }}>
                <Card>
                    <EmptyState
                        icon="circle-alert"
                        title="Sin conexión"
                        description="No pudimos llegar al servidor. Cuando vuelvas a tener red, volvé a entrar: dejá la app abierta y no hace falta que la cierres."
                        action={<Button onClick={() => window.location.reload()}>Reintentar</Button>}
                    />
                </Card>

                {canInstall ? (
                    <div
                        style={{
                            marginTop: "var(--space-4)",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: "var(--space-2)"
                        }}
                    >
                        <Button variant="secondary" iconStart="download" onClick={install}>
                            Instalar Hexario
                        </Button>
                        <p
                            style={{
                                margin: 0,
                                maxWidth: "42ch",
                                textAlign: "center",
                                fontSize: "var(--text-xs)",
                                color: "var(--text-muted)",
                                textWrap: "pretty"
                            }}
                        >
                            Instalala ahora y la próxima vez abre desde el ícono, sin depender de la conexión.
                        </p>
                    </div>
                ) : null}
            </div>
        </div>
    );
}
