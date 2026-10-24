import express, { Express } from "express";
import cors from 'cors';
import { Container } from "./container";
import { handleErrors } from "./lib/http/errors";
import { env } from "./env";

export function createApp(container: Container): Express {
    const app = express();

    // Restringido a los orígenes conocidos del front (ver env.CORS_ORIGIN y
    // env.CORS_PORT). `cors()` sin opciones habilitaría cualquier origen.
    const corsOrigins = new Set(
        env.CORS_ORIGIN.split(",").map((origin) => origin.trim()).filter(Boolean)
    );
    if (env.CORS_PORT) {
        corsOrigins.add(`http://localhost:${env.CORS_PORT}`);
        corsOrigins.add(`http://127.0.0.1:${env.CORS_PORT}`);
    }
    app.use(cors({ origin: [...corsOrigins] }));
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    app.use('/user', container.user.router);
    app.use('/territories', container.territory.router);

    app.use(handleErrors);

    app.use('/{*splat}', (_, res) => res.status(404).json({
        success: false,
        error: "Esta ruta no hace nada"
    }));

    return app;
}
