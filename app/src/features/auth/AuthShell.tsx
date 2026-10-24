import type { ReactNode } from 'react';
import { HexarioMark } from '../../design-system';

type AuthShellProps = {
    /** Micro-etiqueta en mayúsculas sobre el título (ej. "Crear cuenta"). */
    eyebrow: string;
    title: string;
    subtitle?: string;
    children: ReactNode;
};

// Login y registro comparten la misma estructura (marca + introducción +
// formulario): cada pantalla sólo aporta su formulario por `children`.
export function AuthShell({ eyebrow, title, subtitle, children }: AuthShellProps) {
    return (
        <div className="hx-auth">
            <div className="hx-auth__brand">
                <HexarioMark size={26} />
                <span>Hexario</span>
            </div>

            <main className="hx-auth__main">
                <header className="hx-auth__intro">
                    <span className="hx-label">{eyebrow}</span>
                    <h1 className="hx-title">{title}</h1>
                    {subtitle ? <p className="hx-caption">{subtitle}</p> : null}
                </header>
                {children}
            </main>
        </div>
    );
}
