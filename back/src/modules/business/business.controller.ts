import { RequestHandler } from "express";
import { ok } from "../../lib/http/responses";
import { BusinessService } from "./business.service";
import { businessValidator } from "./business.validator";

export type BusinessControllerDeps = {
    service: BusinessService;
};

export function createBusinessController({ service }: BusinessControllerDeps) {
    const listBusinesses: RequestHandler = async (_req, res) => {
        const items = await service.listBusinesses();
        ok(res, { items, count: items.length });
    };

    const getBusiness: RequestHandler = async (req, res) => {
        const { slug } = businessValidator.slug.parse(req.params);
        ok(res, await service.getBusiness(slug));
    };

    const listPromotions: RequestHandler = async (_req, res) => {
        const items = await service.listPromotions();
        ok(res, { items, count: items.length });
    };

    const getPromotion: RequestHandler = async (req, res) => {
        const { id } = businessValidator.promotionId.parse(req.params);
        ok(res, await service.getPromotion(id));
    };

    return {
        listBusinesses,
        getBusiness,
        listPromotions,
        getPromotion
    };
}

export type BusinessController = ReturnType<typeof createBusinessController>;
