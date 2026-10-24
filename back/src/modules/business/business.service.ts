import { NotFound } from "bradb";
import { BusinessRepository, PromotionWithBusiness } from "./business.repository";
import type { Business, Promotion } from "./business.schema";

export type BusinessServiceDeps = {
    repository: BusinessRepository;
};

const businessSummary = (business: Business) => ({
    id: business.id,
    slug: business.slug,
    name: business.name,
    category: business.category,
    address: business.address,
    neighborhood: business.neighborhood,
    latitude: business.latitude,
    longitude: business.longitude
});

const publicBusiness = (business: Business) => ({
    ...businessSummary(business),
    description: business.description,
    phone: business.phone,
    instagram: business.instagram,
    imageUrl: business.imageUrl
});

const publicPromotion = ({ promotion, business }: PromotionWithBusiness) => ({
    id: promotion.id,
    title: promotion.title,
    description: promotion.description,
    conditions: promotion.conditions,
    costPoints: promotion.costPoints,
    stock: promotion.stock,
    perUserLimit: promotion.perUserLimit,
    startsAt: promotion.startsAt.toISOString(),
    endsAt: promotion.endsAt?.toISOString() ?? null,
    business: businessSummary(business)
});

export type PublicBusiness = ReturnType<typeof publicBusiness>;
export type PublicPromotion = ReturnType<typeof publicPromotion>;

export function createBusinessService({ repository }: BusinessServiceDeps) {
    const listBusinesses = async (): Promise<PublicBusiness[]> => {
        const businesses = await repository.listActive();
        return businesses.map(publicBusiness);
    };

    const getBusiness = async (slug: string): Promise<PublicBusiness & { promotions: PublicPromotion[] }> => {
        const business = await repository.findActiveBySlug(slug);
        if (!business) throw new NotFound(`No existe el negocio ${slug}`);

        const promotions = await repository.listAvailableByBusiness(business.id, new Date());
        return {
            ...publicBusiness(business),
            promotions: promotions.map(publicPromotion)
        };
    };

    const listPromotions = async (): Promise<PublicPromotion[]> => {
        const promotions = await repository.listAvailablePromotions(new Date());
        return promotions.map(publicPromotion);
    };

    const getPromotion = async (id: number): Promise<PublicPromotion> => {
        const promotion = await repository.findAvailablePromotion(id, new Date());
        if (!promotion) throw new NotFound(`No existe la promoción ${id} o no está disponible`);
        return publicPromotion(promotion);
    };

    return { listBusinesses, getBusiness, listPromotions, getPromotion };
}

export type BusinessService = ReturnType<typeof createBusinessService>;
export type { Business, Promotion };
