import { afterAll, describe, expect, it } from "vitest";
import request from "supertest";
import { eq } from "drizzle-orm";
import { db } from "../src/db/client";
import { promotionsTable } from "../src/db/schema";
import { createContainer } from "../src/container";
import { createApp } from "../src/app";
import { ROSARIO_BOUNDS } from "../src/modules/territory/territory.service";

const app = createApp(createContainer());

afterAll(() => db.$client.end());

describe("negocios y promociones", () => {
    it("lista los negocios activos sin autenticación", async () => {
        const response = await request(app).get("/businesses");

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.count).toBe(14);
        expect(response.body.data.items).toHaveLength(14);

        const cafe = response.body.data.items.find(
            (business: { slug: string }) => business.slug === "cafe-la-florida"
        );
        expect(cafe.name).toBe("Café La Florida");
        expect(cafe.neighborhood).toBe("Centro");
        expect(typeof cafe.latitude).toBe("number");
        expect(cafe.isActive).not.toBeDefined();

        for (const business of response.body.data.items) {
            expect(business.latitude).toBeGreaterThanOrEqual(ROSARIO_BOUNDS.south);
            expect(business.latitude).toBeLessThanOrEqual(ROSARIO_BOUNDS.north);
            expect(business.longitude).toBeGreaterThanOrEqual(ROSARIO_BOUNDS.west);
            expect(business.longitude).toBeLessThanOrEqual(ROSARIO_BOUNDS.east);
        }
    });

    it("devuelve el detalle del negocio con sus promos disponibles", async () => {
        const response = await request(app).get("/businesses/cafe-la-florida");

        expect(response.status).toBe(200);
        expect(response.body.data.slug).toBe("cafe-la-florida");
        expect(response.body.data.promotions).toHaveLength(2);
        expect(
            response.body.data.promotions.some(
                (promotion: { title: string }) => promotion.title === "Promo vencida"
            )
        ).toBe(false);
    });

    it("lista sólo promociones disponibles y con el negocio asociado", async () => {
        const response = await request(app).get("/promotions");

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.count).toBe(15);
        expect(response.body.data.items).toHaveLength(15);

        const titles = response.body.data.items.map((promotion: { title: string }) => promotion.title);
        expect(titles).not.toContain("Promo vencida");
        expect(titles).not.toContain("Promo pausada");
        expect(titles).not.toContain("Promo sin stock");

        for (const promotion of response.body.data.items) {
            expect(promotion.business.slug).toBeDefined();
            expect(promotion.business.name).toBeDefined();
            expect(promotion.business.latitude).toBeTypeOf("number");
            expect(promotion.costPoints).toBeGreaterThan(0);
        }
    });

    it("devuelve el detalle de una promo disponible", async () => {
        const list = await request(app).get("/promotions");
        const first = list.body.data.items[0];

        const response = await request(app).get(`/promotions/${first.id}`);

        expect(response.status).toBe(200);
        expect(response.body.data.id).toBe(first.id);
        expect(response.body.data.business.slug).toBeDefined();
        expect(response.body.data.endsAt).toBeTypeOf("string");
    });

    it("oculta una promo vencida también en el detalle", async () => {
        const [expired] = await db.select({ id: promotionsTable.id })
            .from(promotionsTable)
            .where(eq(promotionsTable.title, "Promo vencida"))
            .limit(1);

        const response = await request(app).get(`/promotions/${expired.id}`);

        expect(response.status).toBe(404);
        expect(response.body.success).toBe(false);
    });

    it("responde 404 para un negocio inexistente", async () => {
        const response = await request(app).get("/businesses/no-existe");

        expect(response.status).toBe(404);
        expect(response.body.success).toBe(false);
    });
});
