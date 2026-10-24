import { eq, inArray, sql } from "drizzle-orm";
import { Database } from "../../db/client";
import { territoriesTable } from "./territory.schema";
import { usersTable } from "../user/user.schema";

export function createTerritoryRepository({ db }: { db: Database }) {
    const selectOwnership = () => db.select({
        id: territoriesTable.id,
        ownerId: territoriesTable.ownerId,
        ownerName: usersTable.username,
        claimedAt: territoriesTable.claimedAt
    }).from(territoriesTable)
        .innerJoin(usersTable, eq(usersTable.id, territoriesTable.ownerId))
        .$dynamic();

    const findOwned = async (ids: string[]) => {
        if (ids.length === 0) return [];

        return selectOwnership()
            .where(inArray(territoriesTable.id, ids));
    };

    const findOne = async (id: string) => {
        const rows = await selectOwnership()
            .where(eq(territoriesTable.id, id)).limit(1);
        return rows[0] ?? null;
    };

    const claimIfFree = async (id: string, ownerId: number) => {
        const rows = await db.insert(territoriesTable)
            .values({ id, ownerId })
            .onConflictDoNothing({ target: territoriesTable.id })
            .returning({ id: territoriesTable.id });
        return rows.length > 0;
    };

    const countByOwner = async (ownerId: number) => {
        const rows = await db.select({ count: sql<number>`count(*)::int` })
            .from(territoriesTable)
            .where(eq(territoriesTable.ownerId, ownerId));
        return rows[0].count;
    };

    return { findOwned, findOne, claimIfFree, countByOwner };
}

export type TerritoryRepository = ReturnType<typeof createTerritoryRepository>;
