import {
    boolean,
    doublePrecision,
    index,
    integer,
    pgTable,
    text,
    timestamp,
    varchar
} from "drizzle-orm/pg-core";

// Comercio adherido. En el MVP no hay alta pública ni panel de comercio:
// los carga el seeder (y más adelante un admin). La API sólo los expone.
export const businessesTable = pgTable("businesses", {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    slug: varchar("slug", { length: 80 }).notNull().unique(),
    name: varchar("name", { length: 120 }).notNull(),
    description: text("description").notNull(),
    category: varchar("category", { length: 40 }).notNull(),
    address: varchar("address", { length: 200 }).notNull(),
    neighborhood: varchar("neighborhood", { length: 80 }).notNull(),
    latitude: doublePrecision("latitude").notNull(),
    longitude: doublePrecision("longitude").notNull(),
    phone: varchar("phone", { length: 40 }),
    instagram: varchar("instagram", { length: 80 }),
    imageUrl: text("image_url"),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
}, (table) => [
    index("businesses_active_idx").on(table.isActive)
]);

// Promoción de un comercio. `stock` es global y `perUserLimit` es el tope
// por jugador (ver PRODUCT.md BR-050/BR-062). No hay endpoints de escritura
// en esta etapa: se seedean y la API sólo devuelve las disponibles.
export const promotionsTable = pgTable("promotions", {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    businessId: integer("business_id")
        .notNull()
        .references(() => businessesTable.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 140 }).notNull(),
    description: text("description").notNull(),
    conditions: text("conditions"),
    costPoints: integer("cost_points").notNull(),
    stock: integer("stock").notNull(),
    perUserLimit: integer("per_user_limit").notNull().default(1),
    startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
    endsAt: timestamp("ends_at", { withTimezone: true }),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
}, (table) => [
    index("promotions_business_idx").on(table.businessId),
    index("promotions_active_idx").on(table.isActive)
]);

export type Business = typeof businessesTable.$inferSelect;
export type NewBusiness = typeof businessesTable.$inferInsert;
export type Promotion = typeof promotionsTable.$inferSelect;
export type NewPromotion = typeof promotionsTable.$inferInsert;
