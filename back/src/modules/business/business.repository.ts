import { and, asc, eq, getTableColumns, gt, gte, isNull, lte, or } from "drizzle-orm";
import { Database } from "../../db/client";
import { businessesTable, promotionsTable } from "./business.schema";
import type { Business, Promotion } from "./business.schema";

export type PromotionWithBusiness = {
    promotion: Promotion;
    business: Business;
};

const businessColumns = getTableColumns(businessesTable);
const promotionColumns = getTableColumns(promotionsTable);

// Una promo está disponible si está activa, su comercio está activo, ya
// empezó, no venció y tiene stock. Es la misma regla que BR-053 y la usan
// tanto el listado general como el detalle del negocio.
const availableConditions = (now: Date) => and(
    eq(promotionsTable.isActive, true),
    eq(businessesTable.isActive, true),
    lte(promotionsTable.startsAt, now),
    or(isNull(promotionsTable.endsAt), gte(promotionsTable.endsAt, now)),
    gt(promotionsTable.stock, 0)
);

export function createBusinessRepository({ db }: { db: Database }) {
    const listActive = async (): Promise<Business[]> =>
        db.select().from(businessesTable)
            .where(eq(businessesTable.isActive, true))
            .orderBy(asc(businessesTable.name));

    const findActiveBySlug = async (slug: string): Promise<Business | null> => {
        const rows = await db.select().from(businessesTable)
            .where(and(eq(businessesTable.slug, slug), eq(businessesTable.isActive, true)))
            .limit(1);
        return rows[0] ?? null;
    };

    // Base común de las tres lecturas de promos: join con el negocio y
    // columnas públicas. `$dynamic()` permite reutilizarla y agregarle
    // where/orderBy/limit sin repetir el join.
    const selectPromotions = () => db.select({
        promotion: promotionColumns,
        business: businessColumns
    })
        .from(promotionsTable)
        .innerJoin(businessesTable, eq(businessesTable.id, promotionsTable.businessId))
        .$dynamic();

    const listAvailablePromotions = async (now: Date): Promise<PromotionWithBusiness[]> =>
        selectPromotions()
            .where(availableConditions(now))
            .orderBy(asc(promotionsTable.costPoints), asc(promotionsTable.id));

    const listAvailableByBusiness = async (businessId: number, now: Date): Promise<PromotionWithBusiness[]> =>
        selectPromotions()
            .where(and(availableConditions(now), eq(promotionsTable.businessId, businessId)))
            .orderBy(asc(promotionsTable.costPoints), asc(promotionsTable.id));

    const findAvailablePromotion = async (id: number, now: Date): Promise<PromotionWithBusiness | null> => {
        const rows = await selectPromotions()
            .where(and(availableConditions(now), eq(promotionsTable.id, id)))
            .limit(1);
        return rows[0] ?? null;
    };

    return {
        listActive,
        findActiveBySlug,
        listAvailablePromotions,
        listAvailableByBusiness,
        findAvailablePromotion
    };
}

export type BusinessRepository = ReturnType<typeof createBusinessRepository>;
