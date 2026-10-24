import { useState } from "react";
import { Button, Card, Icon, IconButton } from "../../design-system";
import { useInstallPrompt } from "./useInstallPrompt";

// Oferta de instalación en una línea, arriba del contenido. Sólo aparece cuando el
// navegador ya avisó que la app se puede instalar (Chromium de escritorio y
// Android): donde no hay prompt nativo no se muestra, para no ofrecer algo que
// después requiere instrucciones a mano.
export function InstallAppBanner() {
    const { canInstall, install } = useInstallPrompt();
    const [dismissed, setDismissed] = useState(false);

    if (!canInstall || dismissed) return null;

    return (
        <Card>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
                <Icon name="download" size={20} color="var(--pino-600)" />
                <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)" }}>
                        Instalá Hexario en este dispositivo
                    </p>
                    <p style={{ margin: 0, fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
                        Abre desde el ícono y arranca aunque no tengas conexión.
                    </p>
                </div>
                <Button size="sm" onClick={install}>
                    Instalar
                </Button>
                <IconButton icon="x" label="Descartar" size="sm" onClick={() => setDismissed(true)} />
            </div>
        </Card>
    );
}
