import { Button, EmptyState } from "../../design-system";
import { useInstallPrompt } from "./useInstallPrompt";

// Pantalla completa: sin conexión no hay datos que mostrar, así que se explica
// qué pasa y se ofrece reintentar sin sacar a la persona de la app.
export function OfflineScreen() {
    const { canInstall, install } = useInstallPrompt();

    return (
        <main className="hx-offline">
            <EmptyState
                title="Sin conexión"
                body="No pudimos llegar al servidor. Cuando vuelvas a tener red, tocá Reintentar: no hace falta cerrar la app."
            />

            <div className="hx-section">
                <Button onClick={() => window.location.reload()}>Reintentar</Button>

                {canInstall ? (
                    <>
                        <Button variant="secondary" onClick={install}>
                            Instalar Hexario
                        </Button>
                        <p className="hx-caption" style={{ textAlign: "center" }}>
                            Instalala ahora y la próxima vez abre desde el ícono.
                        </p>
                    </>
                ) : null}
            </div>
        </main>
    );
}
