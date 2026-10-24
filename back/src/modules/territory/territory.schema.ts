import { integer, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";
import { usersTable } from "../user/user.schema";

export const territoriesTable = pgTable("territory_claims", {
    id: varchar("id", { length: 15 }).primaryKey(),
    ownerId: integer("owner_id").notNull().references(() => usersTable.id),
    claimedAt: timestamp("claimed_at", { withTimezone: true }).notNull().defaultNow()
});
