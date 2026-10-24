import { api } from "./client";

export type BusinessSummary = {
    id: number;
    slug: string;
    name: string;
    category: string;
    address: string;
    neighborhood: string;
    latitude: number;
    longitude: number;
};

export type Business = BusinessSummary & {
    description: string;
    phone: string | null;
    instagram: string | null;
    imageUrl: string | null;
};

export type Promotion = {
    id: number;
    title: string;
    description: string;
    conditions: string | null;
    costPoints: number;
    stock: number;
    perUserLimit: number;
    startsAt: string;
    endsAt: string | null;
    business: BusinessSummary;
};

export type BusinessDetail = Business & {
    promotions: Promotion[];
};

type Envelope<T> = {
    success: true;
    message?: string;
    data: T;
};

type ItemsEnvelope<T> = Envelope<{ items: T[]; count: number }>;

export async function listBusinesses(): Promise<Business[]> {
    const response = await api.get<ItemsEnvelope<Business>>("/businesses");
    return response.data.items;
}

export async function getBusiness(slug: string): Promise<BusinessDetail> {
    const response = await api.get<Envelope<BusinessDetail>>(`/businesses/${encodeURIComponent(slug)}`);
    return response.data;
}

export async function listPromotions(): Promise<Promotion[]> {
    const response = await api.get<ItemsEnvelope<Promotion>>("/promotions");
    return response.data.items;
}

export async function getPromotion(id: number): Promise<Promotion> {
    const response = await api.get<Envelope<Promotion>>(`/promotions/${id}`);
    return response.data;
}
