import express from "express";
import { auth } from "../../lib/auth/auth";
import { TerritoryController } from "./territory.controller";

export function createTerritoryRoutes(controller: TerritoryController) {
    const router = express.Router();
    router.get("/", controller.listVisible);
    router.get("/mine", auth, controller.mine);
    router.post("/claim", auth, controller.claim);
    return router;
}
