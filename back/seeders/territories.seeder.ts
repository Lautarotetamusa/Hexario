import { latLngToCell } from "h3-js";
import { db } from "../src/db/client";
import { territoriesTable } from "../src/db/schema";
import type { User } from "../src/modules/user";

type SeedClaim = {
    owner: string;
    latitude: number;
    longitude: number;
    hoursAgo: number;
};

// Celdas repartidas por zonas de Rosario. Evitan a propósito las coordenadas
// que usan los tests de territorio (-32.949,-60.698 y -32.96,-60.71) para que
// el test de "primer dueño" siga arrancando con la celda libre.
const CLAIMS: SeedClaim[] = [
    { owner: "usuario_uno", latitude: -32.9472, longitude: -60.6392, hoursAgo: 2 },
    { owner: "usuario_uno", latitude: -32.9440, longitude: -60.6360, hoursAgo: 3 },
    { owner: "juli", latitude: -32.9535, longitude: -60.6485, hoursAgo: 5 },
    { owner: "juli", latitude: -32.9560, longitude: -60.6535, hoursAgo: 8 },
    { owner: "tomi", latitude: -32.9410, longitude: -60.6430, hoursAgo: 12 },
    { owner: "tomi", latitude: -32.9380, longitude: -60.6500, hoursAgo: 14 },
    { owner: "agus", latitude: -32.9480, longitude: -60.6550, hoursAgo: 18 },
    { owner: "agus", latitude: -32.9600, longitude: -60.6450, hoursAgo: 20 },
    { owner: "meli", latitude: -32.9650, longitude: -60.6600, hoursAgo: 26 },
    { owner: "nico", latitude: -32.9520, longitude: -60.6300, hoursAgo: 30 },
    { owner: "sofia", latitude: -32.9445, longitude: -60.6600, hoursAgo: 36 },
    { owner: "usuario_dos", latitude: -32.9505, longitude: -60.6325, hoursAgo: 40 }
];

export async function seedTerritories(users: User[]): Promise<number> {
    const usersByName = new Map(users.map((user) => [user.username, user]));
    const now = Date.now();
    const byCell = new Map<string, { id: string; ownerId: number; claimedAt: Date }>();

    for (const claim of CLAIMS) {
        const owner = usersByName.get(claim.owner);
        if (!owner) throw new Error(`No existe el usuario seed ${claim.owner}`);

        const id = latLngToCell(claim.latitude, claim.longitude, 10);
        byCell.set(id, {
            id,
            ownerId: owner.id,
            claimedAt: new Date(now - claim.hoursAgo * 60 * 60 * 1000)
        });
    }

    await db.insert(territoriesTable)
        .values([...byCell.values()])
        .onConflictDoNothing({ target: territoriesTable.id });

    return byCell.size;
}
