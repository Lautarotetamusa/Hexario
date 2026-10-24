import { RequestHandler } from "express";
import { created, ok } from "../../lib/http/responses";
import { TerritoryService } from "./territory.service";
import { territoryValidator } from "./territory.validator";

export function createTerritoryController({ service }: { service: TerritoryService }) {
    const listVisible: RequestHandler = async (req, res) => {
        const parts = String(req.query.bbox ?? "").split(",").map(Number);
        const box = territoryValidator.bbox.parse({
            south: parts[0], west: parts[1], north: parts[2], east: parts[3]
        });
        ok(res, await service.listVisible(box));
    };

    const claim: RequestHandler = async (req, res) => {
        const input = territoryValidator.claim.parse(req.body);
        const result = await service.claim(res.locals.user.id, input);
        if (result.claimed) created(res, result, "Hexágono reclamado");
        else ok(res, result, "Ya sos dueño de este hexágono");
    };

    const mine: RequestHandler = async (_req, res) => {
        ok(res, { count: await service.countMine(res.locals.user.id) });
    };

    return { listVisible, claim, mine };
}

export type TerritoryController = ReturnType<typeof createTerritoryController>;
