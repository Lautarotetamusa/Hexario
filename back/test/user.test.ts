import {describe, expect, it} from 'vitest';
import request from "supertest";
import { join } from "path";
import * as dotenv from 'dotenv';

dotenv.config({path: join(__dirname, "../.env")});

import {db} from '../src/db/client';
import { createContainer } from '../src/container';
import { createApp } from '../src/app';
import { PASSWORD_SEED } from '../seeders/users.seeder';
import {expectBadRequest, expectCreated, expectDataResponse, expectNotFound, expectUnauthorized, expectUpdated} from './util';

const app = createApp(createContainer());

// Los usuarios del seed (`usuario_uno`/`usuario_dos`) ya existen: el alta
// usa un username distinto para no colisionar con ellos.
const newUser = {
    username: "testing",
    password: "ANASHEEEEEEE",
    email: "lauti@gmail.com"
};

afterAll(() => {
    db.$client.end();
});

describe('POST user/register', () => {
    it('Sin email', async () => {
        const res = await request(app)
            .post('/user/register').send({ username: newUser.username, password: newUser.password });

        expectBadRequest(res);
    });

    it('Email invalido', async () => {
        const res = await request(app)
            .post('/user/register').send({ ...newUser, email: "no-es-un-email" });

        expectBadRequest(res);
    });

    it('Creado con exito', async () => {
        const res = await request(app)
            .post('/user/register').send(newUser);

        expectCreated(res);
        expect(res.body.data.username).toEqual(newUser.username);
        expect(res.body.data.password).not.toBeDefined();
    });

    it('Username repetido', async () => {
        const res = await request(app)
            .post('/user/register').send(newUser);

        expectBadRequest(res);
    });
});

describe('POST user/login', () => {
    it('Usuario inexistente', async () => {
        const res = await request(app)
            .post('/user/login').send({ username: "no_existe", password: "x" });

        expectNotFound(res);
    });

    it('Password incorrecta', async () => {
        const res = await request(app)
            .post('/user/login').send({ username: newUser.username, password: "incorrecta" });

        expectUnauthorized(res);
    });

    it('Login exitoso', async () => {
        const res = await request(app)
            .post('/user/login').send({ username: newUser.username, password: newUser.password });

        expect(res.status).toEqual(200);
        expect(res.body.token).toBeDefined();
    });
});

describe('Usuario autenticado', () => {
    let token: string;

    beforeAll(async () => {
        const res = await request(app)
            .post('/user/login').send({ username: "usuario_uno", password: PASSWORD_SEED });

        token = res.body.token;
    });

    it('GET user sin token', async () => {
        expectUnauthorized(await request(app).get('/user'));
    });

    it('GET user con token invalido', async () => {
        expectUnauthorized(await request(app).get('/user').set({ Authorization: "Bearer invalido" }));
    });

    it('GET user', async () => {
        const res = await request(app).get('/user').set({ Authorization: `Bearer ${token}` });

        expectDataResponse(res, 200);
        expect(res.body.data.username).toEqual("usuario_uno");
        expect(res.body.data.password).not.toBeDefined();
    });

    it('PUT user con email invalido', async () => {
        const res = await request(app).put('/user').set({ Authorization: `Bearer ${token}` }).send({ email: "x" });

        expectBadRequest(res);
    });

    it('PUT user', async () => {
        const res = await request(app).put('/user').set({ Authorization: `Bearer ${token}` }).send({ email: "nuevo@example.com" });

        expectUpdated(res);
        expect(res.body.data.email).toEqual("nuevo@example.com");
    });
});
