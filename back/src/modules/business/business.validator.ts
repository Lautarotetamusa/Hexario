import { z } from "zod";

// La API de negocios es de sólo lectura: no hay body que validar. Estos
// esquemas validan los params de las rutas públicas.
export const businessValidator = {
    slug: z.object({
        slug: z.string().trim().min(1).max(80).regex(/^[a-z0-9-]+$/, "Slug inválido")
    }),
    promotionId: z.object({
        id: z.coerce.number().int().positive()
    })
};

export type BusinessSlugParams = z.infer<typeof businessValidator.slug>;
export type PromotionIdParams = z.infer<typeof businessValidator.promotionId>;
