import express from "express";
import { BusinessController } from "./business.controller";

// Rutas públicas del catálogo. No hay auth: un jugador puede ver los
// comercios y sus promociones antes de loguearse.
export function createBusinessRoutes(controller: BusinessController) {
    const router = express.Router();

    router.get("/businesses", controller.listBusinesses);
    router.get("/businesses/:slug", controller.getBusiness);
    router.get("/promotions", controller.listPromotions);
    router.get("/promotions/:id", controller.getPromotion);

    return router;
}
