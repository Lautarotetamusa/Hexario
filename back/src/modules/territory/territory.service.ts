import { cellToBoundary, cellToLatLng, latLngToCell, polygonToCells } from "h3-js";
import { ApiError } from "../../lib/http/errors";
import { TerritoryRepository } from "./territory.repository";
import { BoundingBox, ClaimInput } from "./territory.validator";

export const GRID_RESOLUTION = 10;

// La zona del prototipo es una cobertura aproximada y versionable de Rosario.
// Antes de un piloto debe reemplazarse por un límite municipal validado.
export const ROSARIO_BOUNDS: BoundingBox = {
    south: -33.055,
    west: -60.81,
    north: -32.84,
    east: -60.61
};

const MAX_VISIBLE_CELLS = 1200;
const MAX_LOCATION_AGE_MS = 30_000;
const MAX_LOCATION_ACCURACY_METERS = 50;

type Owned = Awaited<ReturnType<TerritoryRepository["findOwned"]>>[number] | null;

const publicTerritory = (id: string, owned: Owned) => ({
    id,
    boundary: cellToBoundary(id),
    owner: owned ? { username: owned.ownerName } : null,
    claimedAt: owned?.claimedAt.toISOString() ?? null
});

const insideRosario = (latitude: number, longitude: number) =>
    latitude >= ROSARIO_BOUNDS.south && latitude <= ROSARIO_BOUNDS.north &&
    longitude >= ROSARIO_BOUNDS.west && longitude <= ROSARIO_BOUNDS.east;

const intersection = (box: BoundingBox): BoundingBox => ({
    south: Math.max(box.south, ROSARIO_BOUNDS.south),
    west: Math.max(box.west, ROSARIO_BOUNDS.west),
    north: Math.min(box.north, ROSARIO_BOUNDS.north),
    east: Math.min(box.east, ROSARIO_BOUNDS.east)
});

const cellsIn = (box: BoundingBox): string[] => {
    if (box.south >= box.north || box.west >= box.east) return [];
    const polygon = [
        [box.south, box.west],
        [box.south, box.east],
        [box.north, box.east],
        [box.north, box.west]
    ];
    return polygonToCells(polygon, GRID_RESOLUTION);
};

export function createTerritoryService({ repository }: { repository: TerritoryRepository }) {
    const listVisible = async (box: BoundingBox) => {
        const ids = cellsIn(intersection(box));
        if (ids.length > MAX_VISIBLE_CELLS) {
            throw new ApiError(400, "Acercá el mapa para ver los hexágonos", "MAP_AREA_TOO_LARGE");
        }

        const owned = await repository.findOwned(ids);
        const ownedById = new Map<string, Owned>(owned.map((cell) => [cell.id, cell]));
        return {
            resolution: GRID_RESOLUTION,
            bounds: ROSARIO_BOUNDS,
            serverTime: new Date().toISOString(),
            cells: ids.map((id) => publicTerritory(id, ownedById.get(id) ?? null))
        };
    };

    const claim = async (userId: number, input: ClaimInput) => {
        const capturedAt = Date.parse(input.recordedAt);
        const age = Date.now() - capturedAt;
        if (age < -5_000 || age > MAX_LOCATION_AGE_MS) {
            throw new ApiError(400, "La ubicación ya no es reciente", "LOCATION_STALE");
        }
        if (input.accuracy > MAX_LOCATION_ACCURACY_METERS) {
            throw new ApiError(400, "La ubicación no es suficientemente precisa", "LOCATION_INACCURATE");
        }
        if (!insideRosario(input.latitude, input.longitude)) {
            throw new ApiError(400, "Estás fuera del área de juego", "OUTSIDE_GAME_AREA");
        }

        const id = latLngToCell(input.latitude, input.longitude, GRID_RESOLUTION);
        const [centerLatitude, centerLongitude] = cellToLatLng(id);
        if (!insideRosario(centerLatitude, centerLongitude)) {
            throw new ApiError(400, "Estás fuera del área de juego", "OUTSIDE_GAME_AREA");
        }
        const created = await repository.claimIfFree(id, userId);
        const owned = await repository.findOne(id);
        if (!owned) throw new Error("No se pudo leer el territorio reclamado");
        if (!created && owned.ownerId !== userId) {
            throw new ApiError(409, "Este hexágono ya tiene dueño", "TERRITORY_OWNED", {
                territory: publicTerritory(id, owned)
            });
        }

        return { claimed: created, territory: publicTerritory(id, owned) };
    };

    const countMine = repository.countByOwner;

    return { listVisible, claim, countMine };
}

export type TerritoryService = ReturnType<typeof createTerritoryService>;
