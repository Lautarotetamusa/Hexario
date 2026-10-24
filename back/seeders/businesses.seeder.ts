import { db } from "../src/db/client";
import { businessesTable } from "../src/db/schema";
import type { Business, NewBusiness } from "../src/modules/business";

// Comercios de ejemplo para desarrollo. En producción los carga el equipo
// de Hexario (más adelante desde un panel de admin); no hay alta pública.
const BUSINESSES: NewBusiness[] = [
    {
        slug: "cafe-la-florida",
        name: "Café La Florida",
        description: "Café de especialidad y pastelería artesanal, a metros de la peatonal.",
        category: "cafe",
        address: "Córdoba 1234",
        neighborhood: "Centro",
        latitude: -32.9472,
        longitude: -60.6392,
        phone: "341 555 0101",
        instagram: "cafelaflorida"
    },
    {
        slug: "heladeria-il-padrino",
        name: "Heladería Il Padrino",
        description: "Helados artesanales con sabores de estación y opciones sin TACC.",
        category: "heladeria",
        address: "Mendoza 2450",
        neighborhood: "Pichincha",
        latitude: -32.9535,
        longitude: -60.6485,
        phone: "341 555 0102",
        instagram: "ilpadrinohelados"
    },
    {
        slug: "libreria-buchin",
        name: "Librería Buchín",
        description: "Libros, papelería y regalos para todas las edades.",
        category: "libreria",
        address: "Sarmiento 780",
        neighborhood: "Centro",
        latitude: -32.944,
        longitude: -60.636,
        phone: "341 555 0103",
        instagram: "libreriabuchin"
    },
    {
        slug: "cerveceria-bircher",
        name: "Cervecería Bircher",
        description: "Cerveza artesanal de la casa y cocina de bar para compartir.",
        category: "cerveceria",
        address: "Salta 1760",
        neighborhood: "Abasto",
        latitude: -32.956,
        longitude: -60.6535,
        phone: "341 555 0104",
        instagram: "birchercerveza"
    },
    {
        slug: "panaderia-la-rosarina",
        name: "Panadería La Rosarina",
        description: "Pan de masa madre, medialunas y facturas recién horneadas.",
        category: "panaderia",
        address: "Cafferata 1450",
        neighborhood: "Echesortu",
        latitude: -32.948,
        longitude: -60.655,
        phone: "341 555 0105",
        instagram: "larosarinapan"
    },
    {
        slug: "pizzeria-don-beto",
        name: "Pizzería Don Beto",
        description: "Pizza al molde y a la piedra, con masa fermentada 48 horas.",
        category: "pizzeria",
        address: "Rioja 1100",
        neighborhood: "Centro",
        latitude: -32.941,
        longitude: -60.643,
        phone: "341 555 0106",
        instagram: "donbetopizza"
    },
    {
        slug: "tienda-verde",
        name: "Tienda Verde",
        description: "Almacén natural, yerbas, frutos secos y productos a granel.",
        category: "almacen",
        address: "Bv. Oroño 950",
        neighborhood: "República",
        latitude: -32.960,
        longitude: -60.645,
        phone: "341 555 0107",
        instagram: "tiendaverde.ros"
    },
    {
        slug: "bar-el-federal",
        name: "Bar El Federal",
        description: "Bar de barrio con vermut, picadas y música en vivo los jueves.",
        category: "bar",
        address: "Urquiza 1550",
        neighborhood: "Arroyito",
        latitude: -32.938,
        longitude: -60.650,
        phone: "341 555 0108",
        instagram: "elfederalbar"
    }
];

export async function seedBusinesses(): Promise<Business[]> {
    return db.insert(businessesTable).values(BUSINESSES).returning();
}
