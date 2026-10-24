import { cellToLatLng } from "h3-js";
import {
    formatCountdown,
    formatKm,
    game,
    type HexCardState,
    type HexCell,
    type HexStatus,
    type PlayerColor,
} from "../../design-system";
import type { TerritoryCell, TerritoryMap } from "../../api/territories";

export const RIVAL_COLORS: PlayerColor[] = ["sky", "coral", "violet"];
export const BASE_RENT_PER_HOUR = 1;
const PROTECTION_MS = game.protectionHours * 60 * 60 * 1000;

/** Color estable por username: el mismo rival mantiene su color durante la sesión. */
export function colorForPlayer(username: string): PlayerColor {
    let hash = 0;
    for (const char of username) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
    return RIVAL_COLORS[hash % RIVAL_COLORS.length];
}

export type PlayerPosition = {
    latitude: number;
    longitude: number;
};

export type TerritoryDescriptor = {
    h3: string;
    ownerName?: string;
    ownerColor: PlayerColor;
    isMine: boolean;
    isFree: boolean;
    status?: HexStatus;
    protectionLeftMs: number;
    place: string;
    distanceM: number;
    rentPerHour: number;
    legendary: boolean;
};

export function protectionLeftMs(claimedAt: string | null, now = Date.now()): number {
    if (!claimedAt) return 0;
    const claimed = Date.parse(claimedAt);
    if (Number.isNaN(claimed)) return 0;
    return Math.max(0, claimed + PROTECTION_MS - now);
}

function distanceMeters(from: PlayerPosition, h3: string): number {
    const [lat, lng] = cellToLatLng(h3);
    const earthRadius = 6_371_000;
    const toRad = (value: number) => (value * Math.PI) / 180;
    const dLat = toRad(lat - from.latitude);
    const dLng = toRad(lng - from.longitude);
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(from.latitude)) * Math.cos(toRad(lat)) * Math.sin(dLng / 2) ** 2;
    return Math.round(2 * earthRadius * Math.asin(Math.sqrt(a)));
}

export function distanceLabel(meters: number): string {
    if (meters <= 0) return "Rosario";
    if (meters >= 1000) return `Rosario · a ${formatKm(meters)} km`;
    return `Rosario · a ${meters} m`;
}

export function describeTerritory(
    cell: TerritoryCell | null,
    h3: string,
    me: string | undefined,
    position: PlayerPosition | null,
    colorFor: (username: string) => PlayerColor,
): TerritoryDescriptor {
    if (!cell || !cell.owner) {
        const distance = position ? distanceMeters(position, h3) : 0;
        return {
            h3,
            ownerColor: "neutral",
            isMine: false,
            isFree: true,
            protectionLeftMs: 0,
            place: distanceLabel(distance),
            distanceM: distance,
            rentPerHour: BASE_RENT_PER_HOUR,
            legendary: false,
        };
    }

    const isMine = cell.owner.username === me;
    const left = protectionLeftMs(cell.claimedAt);
    const status: HexStatus = isMine ? "owned" : left > 0 ? "protected" : "stealable";
    const distance = position ? distanceMeters(position, h3) : 0;

    return {
        h3,
        ownerName: cell.owner.username,
        ownerColor: isMine ? "me" : colorFor(cell.owner.username),
        isMine,
        isFree: false,
        status,
        protectionLeftMs: left,
        place: distanceLabel(distance),
        distanceM: distance,
        rentPerHour: BASE_RENT_PER_HOUR,
        legendary: false,
    };
}

export function describeH3(
    data: TerritoryMap | null,
    h3: string,
    me: string | undefined,
    position: PlayerPosition | null,
    colorFor: (username: string) => PlayerColor,
): TerritoryDescriptor {
    const cell = data?.cells.find((entry) => entry.id === h3) ?? null;
    return describeTerritory(cell, h3, me, position, colorFor);
}

export function toHexCell(descriptor: TerritoryDescriptor, selected: boolean): HexCell {
    return {
        h3: descriptor.h3,
        owner: descriptor.isFree ? null : descriptor.isMine ? "me" : descriptor.ownerColor,
        status: descriptor.status,
        countdown:
            descriptor.status === "protected"
                ? formatCountdown(descriptor.protectionLeftMs, { alwaysHours: true })
                : undefined,
        selected,
    };
}

/** Versión liviana para pintar el mapa sin calcular distancias por celda. */
export function toHexCellFromTerritory(
    cell: TerritoryCell,
    me: string | undefined,
    colorFor: (username: string) => PlayerColor,
    selected: boolean,
): HexCell {
    if (!cell.owner) {
        return { h3: cell.id, owner: null, selected };
    }

    const isMine = cell.owner.username === me;
    const left = protectionLeftMs(cell.claimedAt);
    const status: HexStatus = isMine ? "owned" : left > 0 ? "protected" : "stealable";

    return {
        h3: cell.id,
        owner: isMine ? "me" : colorFor(cell.owner.username),
        status,
        countdown:
            status === "protected" ? formatCountdown(left, { alwaysHours: true }) : undefined,
        selected,
    };
}

export function hexCardState(descriptor: TerritoryDescriptor): HexCardState {
    if (descriptor.isFree) return "free";
    if (descriptor.isMine) return "mine";
    if (descriptor.status === "stealable") return "stealable";
    return "protected";
}
