import { useCallback, useEffect, useRef, useState } from "react";
import { listTerritories } from "../../api/territories";
import type { TerritoryBbox, TerritoryMap } from "../../api/territories";

type UseTerritoriesResult = {
    data: TerritoryMap | null;
    loading: boolean;
    error: Error | null;
    setBbox: (bbox: TerritoryBbox) => void;
    refresh: () => void;
};

const FETCH_DEBOUNCE_MS = 250;

function sameBbox(a: TerritoryBbox | null, b: TerritoryBbox): boolean {
    if (!a) return false;
    return (
        Math.abs(a.south - b.south) < 0.000001 &&
        Math.abs(a.west - b.west) < 0.000001 &&
        Math.abs(a.north - b.north) < 0.000001 &&
        Math.abs(a.east - b.east) < 0.000001
    );
}

export function useTerritories(): UseTerritoriesResult {
    const [bbox, setBboxState] = useState<TerritoryBbox | null>(null);
    const [data, setData] = useState<TerritoryMap | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);
    const requestId = useRef(0);

    const setBbox = useCallback((next: TerritoryBbox) => {
        setBboxState((current) => (sameBbox(current, next) ? current : next));
    }, []);

    const refresh = useCallback(() => {
        setRefreshKey((value) => value + 1);
    }, []);

    useEffect(() => {
        if (!bbox) return;

        const currentRequest = ++requestId.current;
        const timer = window.setTimeout(() => {
            setLoading(true);
            listTerritories(bbox)
                .then((next) => {
                    if (currentRequest !== requestId.current) return;
                    setData(next);
                    setError(null);
                })
                .catch((err: unknown) => {
                    if (currentRequest !== requestId.current) return;
                    setError(err instanceof Error ? err : new Error("No pudimos cargar el mapa"));
                })
                .finally(() => {
                    if (currentRequest === requestId.current) setLoading(false);
                });
        }, FETCH_DEBOUNCE_MS);

        return () => window.clearTimeout(timer);
    }, [bbox, refreshKey]);

    return { data, loading, error, setBbox, refresh };
}
