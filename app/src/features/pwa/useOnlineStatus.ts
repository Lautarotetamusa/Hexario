import { useEffect, useState } from "react";

// `navigator.onLine` sólo distingue "hay interfaz de red" de "no la hay": no
// detecta un wifi conectado sin internet. Es la única señal sincrónica
// disponible sin golpear al backend, así que se usa como aproximación y se
// mantiene al día con los eventos online/offline (sin polling).
export function useOnlineStatus(): boolean {
    const [online, setOnline] = useState(() => navigator.onLine);

    useEffect(() => {
        const goOnline = () => setOnline(true);
        const goOffline = () => setOnline(false);

        window.addEventListener("online", goOnline);
        window.addEventListener("offline", goOffline);
        return () => {
            window.removeEventListener("online", goOnline);
            window.removeEventListener("offline", goOffline);
        };
    }, []);

    return online;
}
