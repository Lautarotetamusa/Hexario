import { ApiError, api } from "./client";

export type TerritoryOwner = {
    username: string;
};

export type TerritoryCell = {
    id: string;
    /** Pares [latitud, longitud] del borde H3. */
    boundary: [number, number][];
    owner: TerritoryOwner | null;
    claimedAt: string | null;
};

export type TerritoryBounds = {
    south: number;
    west: number;
    north: number;
    east: number;
};

export type TerritoryMap = {
    resolution: number;
    bounds: TerritoryBounds;
    serverTime: string;
    cells: TerritoryCell[];
};

export type TerritoryBbox = {
    south: number;
    west: number;
    north: number;
    east: number;
};

export type ClaimInput = {
    latitude: number;
    longitude: number;
    accuracy: number;
    recordedAt: string;
};

export type ClaimResult = {
    claimed: boolean;
    territory: TerritoryCell;
};

type Envelope<T> = {
    success: true;
    message?: string;
    data: T;
};

export async function listTerritories(bbox: TerritoryBbox): Promise<TerritoryMap> {
    const query = [bbox.south, bbox.west, bbox.north, bbox.east].join(",");
    const response = await api.get<Envelope<TerritoryMap>>(`/territories?bbox=${encodeURIComponent(query)}`);
    return response.data;
}

export async function getMineCount(): Promise<number> {
    const response = await api.get<Envelope<{ count: number }>>("/territories/mine");
    return response.data.count;
}

export async function claimTerritory(input: ClaimInput): Promise<ClaimResult> {
    const response = await api.post<Envelope<ClaimResult>>("/territories/claim", input);
    return response.data;
}

export function apiErrorCode(error: unknown): string | null {
    if (!(error instanceof ApiError)) return null;
    return error.errors[0]?.code ?? null;
}

export function territoryFromError(error: unknown): TerritoryCell | null {
    if (!(error instanceof ApiError)) return null;
    const candidate = error.errors[0]?.territory;
    if (!candidate || typeof candidate !== "object") return null;
    return candidate as TerritoryCell;
}
