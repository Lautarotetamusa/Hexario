import { useCallback, useEffect, useRef, useState } from "react";

export type GeoPosition = {
    latitude: number;
    longitude: number;
    accuracy: number;
    timestamp: number;
};

export type GeoStatus = "idle" | "requesting" | "active" | "denied" | "unavailable" | "error";

type GeoState = {
    position: GeoPosition | null;
    status: GeoStatus;
    error: string | null;
    active: boolean;
    start: () => void;
    stop: () => void;
};

const GEO_OPTIONS: PositionOptions = {
    enableHighAccuracy: true,
    maximumAge: 0,
    timeout: 20_000,
};

function messageForError(error: GeolocationPositionError): { status: GeoStatus; message: string } {
    if (error.code === error.PERMISSION_DENIED) {
        return { status: "denied", message: "Permiso de ubicación denegado. Habilitalo para reclamar hexágonos." };
    }
    if (error.code === error.POSITION_UNAVAILABLE) {
        return { status: "error", message: "No pudimos obtener tu ubicación. Probá de nuevo." };
    }
    return { status: "error", message: "La ubicación tardó demasiado. Probá de nuevo." };
}

export function useGeoLocation(): GeoState {
    const [position, setPosition] = useState<GeoPosition | null>(null);
    const [status, setStatus] = useState<GeoStatus>("idle");
    const [error, setError] = useState<string | null>(null);
    const watchRef = useRef<number | null>(null);

    const stop = useCallback(() => {
        if (watchRef.current !== null) {
            navigator.geolocation.clearWatch(watchRef.current);
            watchRef.current = null;
        }
        setStatus("idle");
    }, []);

    const start = useCallback(() => {
        if (!("geolocation" in navigator)) {
            setStatus("unavailable");
            setError("Este navegador no tiene geolocalización.");
            return;
        }
        if (watchRef.current !== null) return;

        setStatus("requesting");
        setError(null);

        try {
            watchRef.current = navigator.geolocation.watchPosition(
                (next) => {
                    setPosition({
                        latitude: next.coords.latitude,
                        longitude: next.coords.longitude,
                        accuracy: next.coords.accuracy,
                        timestamp: next.timestamp || Date.now(),
                    });
                    setStatus("active");
                    setError(null);
                },
                (geoError) => {
                    const next = messageForError(geoError);
                    setStatus(next.status);
                    setError(next.message);
                    if (next.status === "denied" && watchRef.current !== null) {
                        navigator.geolocation.clearWatch(watchRef.current);
                        watchRef.current = null;
                    }
                },
                GEO_OPTIONS,
            );
        } catch {
            setStatus("error");
            setError("No pudimos activar la ubicación.");
        }
    }, []);

    useEffect(() => () => stop(), [stop]);

    return {
        position,
        status,
        error,
        active: status === "requesting" || status === "active",
        start,
        stop,
    };
}
