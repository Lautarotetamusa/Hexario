import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { sql } from "drizzle-orm";
import * as schema from "./schema";
import { env } from "../env";

const pool = new Pool({
    connectionString: env.DATABASE_URL
});

export const db = drizzle(pool, { schema });

// Tipo de `db` para que los módulos declaren "necesito una conexión a la
// base" sin importar el singleton de acá: lo reciben como parámetro de su
// factory (`createXModule({ db })`), armada una sola vez en `container.ts`.
export type Database = typeof db;

// Tipo del handle de transacción que recibe `db.transaction(async (tx) => ...)`,
// inferido de la propia firma de `db` para no duplicarlo a mano ni depender
// de un tipo interno de bradb. Vive acá porque es infraestructura pura de
// Postgres: cualquier módulo que necesite atomicidad lo recibe sin importar
// el singleton de `db`.
export type Tx = Parameters<typeof db.transaction>[0] extends (tx: infer T, ...args: unknown[]) => unknown ? T : never;

async function testDBConnection() {
    try {
        await db.execute(sql`select 1`);
    } catch (err) {
        console.error("Drizzle (Postgres) no está configurado correctamente", err);
        process.exit(1);
    }
}
testDBConnection();
