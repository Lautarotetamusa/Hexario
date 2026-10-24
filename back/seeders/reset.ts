import { sql, getTableName } from "drizzle-orm";
import { db } from "../src/db/client";
import { businessesTable, promotionsTable, territoriesTable, usersTable } from "../src/db/schema";

// Todas las tablas que el seeder recrea. `TRUNCATE ... CASCADE` resuelve las
// FKs y reinicia las identidades, así el seeder es repetible desde cero.
const TABLAS_SEEDEADAS = [usersTable, territoriesTable, businessesTable, promotionsTable];

export async function resetSeedData(): Promise<void> {
    const nombresTablas = TABLAS_SEEDEADAS.map((tabla) => sql.identifier(getTableName(tabla)));

    await db.execute(sql`truncate table ${sql.join(nombresTablas, sql.raw(", "))} restart identity cascade`);
}
