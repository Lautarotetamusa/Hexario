import { useCallback, useEffect, useState } from "react";
import { listBusinesses, listPromotions, type Business, type Promotion } from "../../api/businesses";

type CatalogState<T> = {
    data: T[] | null;
    loading: boolean;
    error: Error | null;
    refresh: () => void;
};

// Hook mínimo para los dos catálogos públicos. No hay librería de data
// fetching en la app: alcanza con estado + cancelación lógica al desmontar.
function useCatalog<T>(load: () => Promise<T[]>, errorMessage: string): CatalogState<T> {
    const [data, setData] = useState<T[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);

    const refresh = useCallback(() => {
        setLoading(true);
        setRefreshKey((value) => value + 1);
    }, []);

    useEffect(() => {
        let cancelled = false;

        load()
            .then((items) => {
                if (cancelled) return;
                setData(items);
                setError(null);
            })
            .catch((err: unknown) => {
                if (cancelled) return;
                setError(err instanceof Error ? err : new Error(errorMessage));
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [load, errorMessage, refreshKey]);

    return { data, loading, error, refresh };
}

export function useBusinesses(): CatalogState<Business> {
    return useCatalog(listBusinesses, "No pudimos cargar los comercios");
}

export function usePromotions(): CatalogState<Promotion> {
    return useCatalog(listPromotions, "No pudimos cargar las promociones");
}
