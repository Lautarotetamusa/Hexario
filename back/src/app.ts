import express, { Express } from "express";
import cors from 'cors';
import { Container } from "./container";
import { handleErrors } from "./lib/http/errors";
import { env } from "./env";

export function createApp(container: Container): Express {
    const app = express();

    // Restringido a los orígenes conocidos del front (ver env.CORS_ORIGIN);
    // `cors()` sin opciones habilita cualquier origen, lo cual no hace falta
    // acá — esta API nunca se llama desde un origen que no controlemos.
    app.use(cors({ origin: env.CORS_ORIGIN.split(",").map((o) => o.trim()) }));
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    app.use('/user', container.user.router);

    app.use(handleErrors);

    app.use('/{*splat}', (_, res) => res.status(404).json({
        success: false,
        error: "Esta ruta no hace nada"
    }));

    return app;
}
