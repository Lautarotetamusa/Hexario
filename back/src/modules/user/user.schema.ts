import { pgTable, integer, varchar } from "drizzle-orm/pg-core";

// PK simple `id`: una fila de `users` no tiene dueño, es ella misma la
// entidad dueño. Las tablas que pertenezcan a un usuario deberían usar PK
// compuesta `(id, user)` (ver ARCHITECTURE.md).
export const usersTable = pgTable("users", {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    username: varchar("username", { length: 25 }).notNull().unique(),
    password: varchar("password", { length: 60 }).notNull(),
    email: varchar("email", { length: 255 }).notNull()
});
