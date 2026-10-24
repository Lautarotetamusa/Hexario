import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { latLngToCell } from "h3-js";
import { db } from "../src/db/client";
import { createContainer } from "../src/container";
import { createApp } from "../src/app";
import { PASSWORD_SEED } from "../seeders/users.seeder";

const app = createApp(createContainer());
const latitude = -32.949;
const longitude = -60.698;
const cellId = latLngToCell(latitude, longitude, 9);
const location = () => ({ latitude, longitude, accuracy: 12, recordedAt: new Date().toISOString() });
let firstToken: string;
let secondToken: string;

beforeAll(async () => {
    const [first, second] = await Promise.all([
        request(app).post("/user/login").send({ username: "usuario_uno", password: PASSWORD_SEED }),
        request(app).post("/user/login").send({ username: "usuario_dos", password: PASSWORD_SEED })
    ]);
    firstToken = first.body.token;
    secondToken = second.body.token;
});

afterAll(() => db.$client.end());

describe("territorios H3", () => {
    it("muestra celdas de resolución 9 en el mapa", async () => {
        const response = await request(app).get("/territories?bbox=-32.952,-60.701,-32.946,-60.695");
        expect(response.status).toBe(200);
        expect(response.body.data.resolution).toBe(9);
        expect(response.body.data.cells.some((cell: { id: string }) => cell.id === cellId)).toBe(true);
    });

    it("requiere usuario y posición reciente dentro de Rosario", async () => {
        expect((await request(app).post("/territories/claim").send(location())).status).toBe(401);
        const stale = await request(app).post("/territories/claim")
            .set("Authorization", `Bearer ${firstToken}`)
            .send({ ...location(), recordedAt: new Date(Date.now() - 60_000).toISOString() });
        expect(stale.status).toBe(400);
        expect(stale.body.errors[0].code).toBe("LOCATION_STALE");
        const outside = await request(app).post("/territories/claim")
            .set("Authorization", `Bearer ${firstToken}`)
            .send({ ...location(), latitude: -34 });
        expect(outside.status).toBe(400);
        expect(outside.body.errors[0].code).toBe("OUTSIDE_GAME_AREA");
    });

    it("reclama una sola vez y preserva el primer dueño", async () => {
        const first = await request(app).post("/territories/claim")
            .set("Authorization", `Bearer ${firstToken}`).send(location());
        expect(first.status).toBe(201);
        expect(first.body.data.territory.id).toBe(cellId);
        expect(first.body.data.territory.owner.username).toBe("usuario_uno");

        const repeated = await request(app).post("/territories/claim")
            .set("Authorization", `Bearer ${firstToken}`).send(location());
        expect(repeated.status).toBe(200);
        expect(repeated.body.data.claimed).toBe(false);

        const rival = await request(app).post("/territories/claim")
            .set("Authorization", `Bearer ${secondToken}`).send(location());
        expect(rival.status).toBe(409);
        expect(rival.body.errors[0].code).toBe("TERRITORY_OWNED");

        const map = await request(app).get("/territories?bbox=-32.952,-60.701,-32.946,-60.695");
        const cell = map.body.data.cells.find((entry: { id: string }) => entry.id === cellId);
        expect(cell.owner.username).toBe("usuario_uno");

        const mine = await request(app).get("/territories/mine")
            .set("Authorization", `Bearer ${firstToken}`);
        expect(mine.body.data.count).toBe(1);
    });

    it("deja un solo ganador ante dos reclamos simultáneos", async () => {
        const competingLocation = { ...location(), latitude: -32.96, longitude: -60.71 };
        const competingCellId = latLngToCell(competingLocation.latitude, competingLocation.longitude, 9);
        const [first, second] = await Promise.all([
            request(app).post("/territories/claim").set("Authorization", `Bearer ${firstToken}`).send(competingLocation),
            request(app).post("/territories/claim").set("Authorization", `Bearer ${secondToken}`).send(competingLocation)
        ]);
        expect([first.status, second.status].sort()).toEqual([201, 409]);

        const map = await request(app).get("/territories?bbox=-32.964,-60.714,-32.956,-60.706");
        const matches = map.body.data.cells.filter((cell: { id: string }) => cell.id === competingCellId);
        expect(matches).toHaveLength(1);
        expect(matches[0].owner.username).toBe(first.status === 201 ? "usuario_uno" : "usuario_dos");
    });
});
