import type { ReactNode } from "react";
import { OfflineScreen } from "./OfflineScreen";
import { useOnlineStatus } from "./useOnlineStatus";

// Un solo envoltorio para toda la app: cualquier pantalla queda detrás de la
// misma comprobación de conexión, sin que ninguna tenga que saber si hay red.
// Al volver la conexión, el estado cambia y las rutas se vuelven a renderizar
// tal cual estaban (mismo `location`, no se pierde dónde estaba la persona).
export function OfflineGate({ children }: { children: ReactNode }) {
    const online = useOnlineStatus();
    return online ? <>{children}</> : <OfflineScreen />;
}
