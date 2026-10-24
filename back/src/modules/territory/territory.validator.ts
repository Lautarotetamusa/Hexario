import { z } from "zod";

const coordinate = z.number().finite();

export const territoryValidator = {
    bbox: z.object({
        south: coordinate.min(-90).max(90),
        west: coordinate.min(-180).max(180),
        north: coordinate.min(-90).max(90),
        east: coordinate.min(-180).max(180)
    }).refine(({ south, north, west, east }) => south < north && west < east),
    claim: z.object({
        latitude: coordinate.min(-90).max(90),
        longitude: coordinate.min(-180).max(180),
        accuracy: coordinate.positive(),
        recordedAt: z.iso.datetime({ offset: true })
    })
};

export type BoundingBox = z.infer<typeof territoryValidator.bbox>;
export type ClaimInput = z.infer<typeof territoryValidator.claim>;
