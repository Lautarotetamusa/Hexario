import type { ReactNode } from "react";
import { BrandLockup, Card } from "../../design-system";
import "./AuthShell.css";

type AuthShellProps = {
    /** Micro-etiqueta en mayúsculas sobre el título (ej. "Crear cuenta"). */
    eyebrow: string;
    title: string;
    subtitle?: string;
    children: ReactNode;
};

// Login y registro comparten exactamente la misma estructura (panel de marca +
// tarjeta con formulario): el único contenido propio de cada pantalla es el
// formulario, que entra por `children`.
export function AuthShell({ eyebrow, title, subtitle, children }: AuthShellProps) {
    return (
        <div className="auth-shell">
            <aside className="auth-shell__brand">
                <BrandLockup height={26} />
                <div className="auth-shell__claim-block">
                    <h2 className="auth-shell__claim">Tu producto empieza acá.</h2>
                    <p className="auth-shell__claim-text">
                        Creá tu cuenta una vez y volvé a entrar desde cualquier dispositivo, sin repetir el ingreso.
                    </p>
                </div>
            </aside>
            <main className="auth-shell__main">
                <Card className="auth-shell__card">
                    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
                        <header style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
                            <span className="eyebrow">{eyebrow}</span>
                            <h1 style={{ fontSize: "var(--text-2xl)" }}>{title}</h1>
                            {subtitle ? (
                                <p style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", textWrap: "pretty" }}>
                                    {subtitle}
                                </p>
                            ) : null}
                        </header>
                        {children}
                    </div>
                </Card>
            </main>
        </div>
    );
}
