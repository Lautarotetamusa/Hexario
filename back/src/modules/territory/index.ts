import { Database } from "../../db/client";
import { createTerritoryRepository } from "./territory.repository";
import { createTerritoryService } from "./territory.service";
import { createTerritoryController } from "./territory.controller";
import { createTerritoryRoutes } from "./territory.routes";

export function createTerritoryModule({ db }: { db: Database }) {
    const repository = createTerritoryRepository({ db });
    const service = createTerritoryService({ repository });
    const controller = createTerritoryController({ service });
    const router = createTerritoryRoutes(controller);
    return { repository, service, router };
}

export type TerritoryModule = ReturnType<typeof createTerritoryModule>;
