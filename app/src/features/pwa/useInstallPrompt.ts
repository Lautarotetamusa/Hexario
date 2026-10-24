import { useCallback, useEffect, useState } from "react";

// `beforeinstallprompt` es una extensión de Chromium: no existe en la lib DOM
// de TypeScript, así que su forma se declara acá. Es el borde con el navegador.
interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

// Safari en iOS expone `standalone` fuera del estándar para saber si la app se
// abrió desde el ícono de inicio.
type IosNavigator = Navigator & { standalone?: boolean };

function isRunningStandalone(): boolean {
    return window.matchMedia("(display-mode: standalone)").matches || (navigator as IosNavigator).standalone === true;
}

export type InstallPrompt = {
    /** El navegador ofreció el prompt nativo y todavía no se consumió. */
    canInstall: boolean;
    /** La app ya corre desde el ícono, o se instaló en esta sesión. */
    isInstalled: boolean;
    /** Abre el prompt nativo. Sin efecto si `canInstall` es false. */
    install: () => void;
};

// El navegador dispara `beforeinstallprompt` una sola vez y después exige un
// gesto de la persona para mostrar el diálogo: por eso el evento se guarda y
// recién se pide en `install()`, no apenas llega.
export function useInstallPrompt(): InstallPrompt {
    const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
    const [isInstalled, setIsInstalled] = useState(isRunningStandalone);

    useEffect(() => {
        const handlePrompt = (event: Event) => {
            // Sin `preventDefault` el navegador muestra su propio cartel y el
            // evento se pierde: acá se controla desde la UI.
            event.preventDefault();
            setDeferred(event as BeforeInstallPromptEvent);
        };
        const handleInstalled = () => {
            setDeferred(null);
            setIsInstalled(true);
        };

        window.addEventListener("beforeinstallprompt", handlePrompt);
        window.addEventListener("appinstalled", handleInstalled);
        return () => {
            window.removeEventListener("beforeinstallprompt", handlePrompt);
            window.removeEventListener("appinstalled", handleInstalled);
        };
    }, []);

    const install = useCallback(() => {
        if (!deferred) return;
        void deferred.prompt();
        // Se descarta igual: el prompt nativo se puede pedir una sola vez.
        setDeferred(null);
    }, [deferred]);

    return { canInstall: deferred !== null, isInstalled, install };
}
