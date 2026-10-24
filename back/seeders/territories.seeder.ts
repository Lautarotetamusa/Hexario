import { gridDisk, latLngToCell } from "h3-js";
import { db } from "../src/db/client";
import { territoriesTable } from "../src/db/schema";
import type { User } from "../src/modules/user";

type SeedCluster = {
    owner: string;
    latitude: number;
    longitude: number;
    cells: number;
};

// Cada usuario recibe una mancha contigua de hexágonos alrededor de una zona
// de Rosario. Los centros están lejos de las coordenadas que usan los tests
// de territorio para que esas celdas sigan libres.
const CLUSTERS: SeedCluster[] = [
    { owner: "usuario_uno", latitude: -32.9472, longitude: -60.6392, cells: 14 },
    { owner: "usuario_dos", latitude: -32.9505, longitude: -60.6325, cells: 12 },
    { owner: "juli", latitude: -32.9535, longitude: -60.6485, cells: 13 },
    { owner: "tomi", latitude: -32.9410, longitude: -60.6430, cells: 12 },
    { owner: "agus", latitude: -32.9480, longitude: -60.6550, cells: 11 },
    { owner: "meli", latitude: -32.9650, longitude: -60.6600, cells: 10 },
    { owner: "nico", latitude: -32.9380, longitude: -60.6500, cells: 11 },
    { owner: "sofia", latitude: -32.9445, longitude: -60.6600, cells: 10 }
];

export async function seedTerritories(users: User[]): Promise<number> {
    const usersByName = new Map(users.map((user) => [user.username, user]));
    const now = Date.now();
    const byCell = new Map<string, { id: string; ownerId: number; claimedAt: Date }>();
    let claimed = 0;

    for (const cluster of CLUSTERS) {
        const owner = usersByName.get(cluster.owner);
        if (!owner) throw new Error(`No existe el usuario seed ${cluster.owner}`);

        const center = latLngToCell(cluster.latitude, cluster.longitude, 10);
        const candidates = gridDisk(center, 4);

        let added = 0;
        for (const id of candidates) {
            if (added >= cluster.cells) break;
            if (byCell.has(id)) continue;

            byCell.set(id, {
                id,
                ownerId: owner.id,
                claimedAt: new Date(now - claimed * 45 * 60 * 1000)
            });
            added += 1;
            claimed += 1;
        }
    }

    await db.insert(territoriesTable)
        .values([...byCell.values()])
        .onConflictDoNothing({ target: territoriesTable.id });

    return byCell.size;
}
