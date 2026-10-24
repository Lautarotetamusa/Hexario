import { appendFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import type { RequestHandler } from "express";

const LOG_DIR = join(process.cwd(), "logs");
const LOG_FILE = join(LOG_DIR, "backend.log");

try {
    mkdirSync(LOG_DIR, { recursive: true });
} catch {
    // Si no se puede crear el directorio, igual se mantiene el log por consola.
}

function writeLine(line: string): void {
    console.log(line);
    try {
        appendFileSync(LOG_FILE, `${line}\n`);
    } catch {
        // El logging a archivo es best-effort; no debe romper un request.
    }
}

function statusLevel(status: number): "ERROR" | "WARN" | "INFO" {
    if (status >= 500) return "ERROR";
    if (status >= 400) return "WARN";
    return "INFO";
}

/**
 * Log de requests: método, ruta, status y duración. No imprime headers ni
 * bodies para no filtrar tokens, contraseñas ni datos personales.
 */
export const requestLogger: RequestHandler = (req, res, next) => {
    // El healthcheck de Docker pega cada pocos segundos; no ensuciamos el log.
    if (req.path === "/health") return next();

    const startedAt = Date.now();

    res.on("finish", () => {
        const durationMs = Date.now() - startedAt;
        const level = statusLevel(res.statusCode);
        const timestamp = new Date().toISOString();

        writeLine(
            `[${timestamp}] ${level} ${req.method} ${req.originalUrl} ${res.statusCode} ${durationMs}ms`
        );
    });

    next();
};
