import { Badge, Button, Card, Icon } from "../../design-system";
import { isIos, isSafariDesktop } from "./platform";
import { useInstallPrompt } from "./useInstallPrompt";

const BENEFITS: Array<{ icon: string; text: string }> = [
    { icon: "layout-dashboard", text: "Abre a pantalla completa desde el ícono, sin la barra del navegador." },
    { icon: "circle-check", text: "Arranca aunque no tengas conexión: el shell de la app queda guardado en el dispositivo." },
    { icon: "download", text: "Se instala en el momento, sin pasar por una tienda de aplicaciones." }
];

// Instrucciones manuales para los navegadores que no ofrecen `beforeinstallprompt`
// (Safari de iOS y de escritorio). Cada variante es el camino real de ese navegador.
function manualSteps(): string[] {
    if (isIos()) {
        return [
            "Abrí esta pantalla en Safari.",
            "Tocá el botón Compartir de la barra inferior.",
            "Elegí «Agregar a pantalla de inicio» y confirmá con «Agregar»."
        ];
    }
    if (isSafariDesktop()) {
        return [
            "Con esta pantalla abierta, entrá al menú Archivo.",
            "Elegí «Agregar al Dock» y confirmá con «Agregar»."
        ];
    }
    return [
        "Abrí esta pantalla en Chrome o Edge, en el teléfono o en la computadora.",
        "Tocá el ícono de instalar de la barra de direcciones, o el menú del navegador.",
        "Confirmá con «Instalar»: el ícono queda en tu inicio o escritorio."
    ];
}

function BenefitList() {
    return (
        <ul
            style={{
                margin: 0,
                padding: 0,
                listStyle: "none",
                display: "flex",
                flexDirection: "column",
                gap: "var(--space-3)"
            }}
        >
            {BENEFITS.map((benefit) => (
                <li key={benefit.icon} style={{ display: "flex", alignItems: "flex-start", gap: "var(--space-3)" }}>
                    <Icon name={benefit.icon} size={18} color="var(--pino-600)" style={{ marginTop: 1 }} />
                    <span style={{ fontSize: "var(--text-sm)", textWrap: "pretty" }}>{benefit.text}</span>
                </li>
            ))}
        </ul>
    );
}

function InstallSteps() {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            <p style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", textWrap: "pretty" }}>
                Este navegador no ofrece el botón de instalación. Se puede instalar igual, en dos pasos:
            </p>
            <ol
                style={{
                    margin: 0,
                    paddingLeft: "var(--space-5)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "var(--space-2)",
                    fontSize: "var(--text-sm)"
                }}
            >
                {manualSteps().map((step) => (
                    <li key={step} style={{ textWrap: "pretty" }}>
                        {step}
                    </li>
                ))}
            </ol>
        </div>
    );
}

// Pantalla dedicada a la instalación: explica qué gana la persona y ofrece el
// prompt nativo cuando el navegador lo permite. Es la versión extensa de lo que
// el aviso del inicio ofrece en una línea.
export function InstallAppPage() {
    const { canInstall, isInstalled, install } = useInstallPrompt();

    return (
        <div className="page-stack">
            <header className="page-heading">
                <span className="eyebrow">Aplicación</span>
                <h1>Instalar app</h1>
                <p>Instalada se abre como una app, no como una pestaña del navegador.</p>
            </header>

            <div style={{ width: "100%", maxWidth: 640 }}>
                <Card
                    title="Hexario en tu dispositivo"
                    subtitle="Acceso directo, pantalla completa y shell offline."
                    actions={isInstalled ? <Badge tone="success" dot>Instalada</Badge> : null}
                >
                    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
                        <BenefitList />
                        {isInstalled ? (
                            <p style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", textWrap: "pretty" }}>
                                Ya la estás usando desde el ícono de este dispositivo y no hace falta hacer nada más.
                            </p>
                        ) : canInstall ? (
                            <div>
                                <Button iconStart="download" onClick={install}>
                                    Instalar Hexario
                                </Button>
                            </div>
                        ) : (
                            <InstallSteps />
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
}
