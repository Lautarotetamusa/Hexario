import { db } from "../src/db/client";
import { promotionsTable } from "../src/db/schema";
import type { Business, NewPromotion } from "../src/modules/business";

type SeedPromotion = Omit<NewPromotion, "businessId" | "startsAt" | "endsAt"> & {
    businessSlug: string;
    startsAt: Date;
    endsAt: Date;
};

const now = Date.now();
const days = (amount: number) => amount * 24 * 60 * 60 * 1000;
const starts = new Date(now - days(3));
const ends = new Date(now + days(30));

const PROMOTIONS: SeedPromotion[] = [
    {
        businessSlug: "cafe-la-florida",
        title: "Café con dos medialunas",
        description: "Un café chico o flat white + dos medialunas de manteca.",
        conditions: "Válido de lunes a viernes hasta las 12:00. No acumulable.",
        costPoints: 450,
        stock: 20,
        perUserLimit: 1,
        startsAt: starts,
        endsAt: ends
    },
    {
        businessSlug: "cafe-la-florida",
        title: "Flat white + budín",
        description: "Flat white de especialidad con budín de limón o banana.",
        conditions: "Una unidad por persona. Sujeto a stock diario.",
        costPoints: 600,
        stock: 12,
        perUserLimit: 1,
        startsAt: starts,
        endsAt: ends
    },
    {
        businessSlug: "heladeria-il-padrino",
        title: "Cuarto kilo a elección",
        description: "Cuarto kilo de helado artesanal con dos sabores a elección.",
        conditions: "No incluye toppings. Válido en el local de Pichincha.",
        costPoints: 900,
        stock: 15,
        perUserLimit: 1,
        startsAt: starts,
        endsAt: ends
    },
    {
        businessSlug: "libreria-buchin",
        title: "10% en tu próxima compra",
        description: "Descuento en libros y papelería seleccionados.",
        conditions: "No acumulable con otras promociones. Tope $20.000.",
        costPoints: 350,
        stock: 30,
        perUserLimit: 2,
        startsAt: starts,
        endsAt: ends
    },
    {
        businessSlug: "cerveceria-bircher",
        title: "Pinta artesanal",
        description: "Una pinta de cerveza artesanal de la casa, estilo a elección.",
        conditions: "Sólo mayores de 18. Consumo en el local.",
        costPoints: 2400,
        stock: 10,
        perUserLimit: 1,
        startsAt: starts,
        endsAt: ends
    },
    {
        businessSlug: "panaderia-la-rosarina",
        title: "Docena de medialunas",
        description: "Docena de medialunas de manteca recién horneadas.",
        conditions: "Retirar antes de las 18:00. Pedido con 2 horas de anticipación.",
        costPoints: 700,
        stock: 18,
        perUserLimit: 1,
        startsAt: starts,
        endsAt: ends
    },
    {
        businessSlug: "pizzeria-don-beto",
        title: "Pizza muzzarella para dos",
        description: "Pizza muzzarella al molde para dos personas + dos gaseosas.",
        conditions: "Válido para consumo en el local. No incluye postre.",
        costPoints: 1500,
        stock: 8,
        perUserLimit: 1,
        startsAt: starts,
        endsAt: ends
    },
    {
        businessSlug: "tienda-verde",
        title: "Yerba + mate de regalo",
        description: "Bolsa de yerba de 1 kg y un mate de calabaza.",
        conditions: "Stock limitado. No acumulable con descuentos.",
        costPoints: 800,
        stock: 20,
        perUserLimit: 1,
        startsAt: starts,
        endsAt: ends
    },
    {
        businessSlug: "bar-el-federal",
        title: "Happy hour: 2x1 en gin tonic",
        description: "Dos gin tonic de la casa al precio de uno.",
        conditions: "Jueves de 18:00 a 21:00. Sólo mayores de 18.",
        costPoints: 1200,
        stock: 25,
        perUserLimit: 1,
        startsAt: starts,
        endsAt: ends
    },
    {
        businessSlug: "rotiseria-la-bomba",
        title: "Docena de empanadas surtidas",
        description: "Doce empanadas de carne, pollo y jamón y queso para llevar.",
        conditions: "Pedido con 30 minutos de anticipación. No incluye bebida.",
        costPoints: 1000,
        stock: 15,
        perUserLimit: 1,
        startsAt: starts,
        endsAt: ends
    },
    {
        businessSlug: "vinoteca-orono",
        title: "Vino de la casa + tabla de quesos",
        description: "Una botella de vino de pequeña bodega y una tabla de quesos.",
        conditions: "Sólo mayores de 18. Consumo en el local.",
        costPoints: 1800,
        stock: 12,
        perUserLimit: 1,
        startsAt: starts,
        endsAt: ends
    },
    {
        businessSlug: "floreria-pichincha",
        title: "Ramo chico de estación",
        description: "Ramo armado con flores de estación y papel kraft.",
        conditions: "Retirar en el local. Sujeto a disponibilidad de flores.",
        costPoints: 650,
        stock: 10,
        perUserLimit: 1,
        startsAt: starts,
        endsAt: ends
    },
    {
        businessSlug: "gimnasio-norte",
        title: "Clase de prueba + evaluación",
        description: "Una clase funcional de prueba y una evaluación inicial.",
        conditions: "Requiere reserva previa. Válido para nuevos alumnos.",
        costPoints: 1200,
        stock: 20,
        perUserLimit: 1,
        startsAt: starts,
        endsAt: ends
    },
    {
        businessSlug: "ceramica-abasto",
        title: "Taza artesanal",
        description: "Una taza de cerámica hecha a mano, a elección entre los modelos disponibles.",
        conditions: "Retirar en el taller. Stock limitado.",
        costPoints: 750,
        stock: 12,
        perUserLimit: 1,
        startsAt: starts,
        endsAt: ends
    },
    {
        businessSlug: "cafeteria-del-parque",
        title: "Café + porción de torta",
        description: "Un café de especialidad y una porción de torta casera.",
        conditions: "Válido de lunes a viernes hasta las 18:00.",
        costPoints: 550,
        stock: 20,
        perUserLimit: 1,
        startsAt: starts,
        endsAt: ends
    },
    // Estos tres existen para probar que la API no muestra promos vencidas,
    // pausadas ni sin stock.
    {
        businessSlug: "cafe-la-florida",
        title: "Promo vencida",
        description: "No debería aparecer en la API.",
        conditions: null,
        costPoints: 300,
        stock: 10,
        perUserLimit: 1,
        startsAt: new Date(now - days(20)),
        endsAt: new Date(now - days(1))
    },
    {
        businessSlug: "heladeria-il-padrino",
        title: "Promo pausada",
        description: "No debería aparecer en la API.",
        conditions: null,
        costPoints: 500,
        stock: 10,
        perUserLimit: 1,
        isActive: false,
        startsAt: starts,
        endsAt: ends
    },
    {
        businessSlug: "libreria-buchin",
        title: "Promo sin stock",
        description: "No debería aparecer en la API.",
        conditions: null,
        costPoints: 400,
        stock: 0,
        perUserLimit: 1,
        startsAt: starts,
        endsAt: ends
    }
];

export async function seedPromotions(businesses: Business[]): Promise<number> {
    const bySlug = new Map(businesses.map((business) => [business.slug, business.id]));

    const values: NewPromotion[] = PROMOTIONS.map(({ businessSlug, ...promotion }) => {
        const businessId = bySlug.get(businessSlug);
        if (!businessId) throw new Error(`No existe el negocio seed ${businessSlug}`);
        return { ...promotion, businessId };
    });

    await db.insert(promotionsTable).values(values);
    return values.length;
}
