import { Database } from "../../db/client";
import { createBusinessRepository } from "./business.repository";
import { createBusinessService } from "./business.service";
import { createBusinessController } from "./business.controller";
import { createBusinessRoutes } from "./business.routes";

export type { Business, NewBusiness, Promotion, NewPromotion } from "./business.schema";
export type { BusinessService, PublicBusiness, PublicPromotion } from "./business.service";
export type { BusinessRepository } from "./business.repository";

export type BusinessModuleDeps = {
    db: Database;
};

export function createBusinessModule({ db }: BusinessModuleDeps) {
    const repository = createBusinessRepository({ db });
    const service = createBusinessService({ repository });
    const controller = createBusinessController({ service });
    const router = createBusinessRoutes(controller);

    return { repository, service, controller, router };
}

export type BusinessModule = ReturnType<typeof createBusinessModule>;
