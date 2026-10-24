import {Response, Request, NextFunction} from "express"
import { ZodError } from "zod";
import { ServiceError, BadRequest } from "bradb";

// `NotFound`/`Duplicated`/`Forbidden`/`Unauthorized` no se re-exportan
// desde acá: quien los necesite los importa directo de `bradb`, para no
// mantener un alias que sólo reenvía sin agregar nada.

// Alias de `BadRequest` (bradb): mismo status/comportamiento, nombre más
// claro en los call sites de validación de reglas de negocio.
export class ValidationError extends BadRequest {}

export class ApiError extends Error{
    status: number;
    name: string;
    // Datos extra del rechazo que el contrato necesita devolver además del
    // mensaje: `handleErrors` los aplana dentro del error del sobre
    // `{success:false, errors:[...]}`.
    details?: Record<string, unknown>;

    constructor(status: number, message: string, name: string, details?: Record<string, unknown>){
        super(message);
        this.status = status;
        this.name = name;
        this.details = details;
    }
}

// `next` es obligatorio en la firma aunque no se use: Express reconoce un
// manejador de errores por su aridad de 4 argumentos, no por el nombre del
// parámetro; quitarlo haría que el handler dejara de recibir los errores.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function handleErrors(err: Error, req: Request, res: Response, next: NextFunction): Response{
    if (err instanceof ZodError){
        const errors = err.issues.map(e => ({
            ...e,
            message: e.code == "invalid_type"
                ? `El campo ${String(e.path[0])} es obligatorio`
                : e.message
        }));

        return res.status(400).json({
            success: false,
            errors: errors
        });
    }

    if (err instanceof ApiError) return res.status(err.status).json({
        success: false,
        errors: [{
            code: err.name,
            message: err.message,
            ...err.details
        }]
    });

    // Errores de bradb: `ServiceBuilder` los tira solo (FK/unique violations
    // vía `handleSqlError`), y los controllers/services los tiran directo
    // para sus propias reglas de negocio (`NotFound`/`Duplicated`/
    // `ValidationError`/`Forbidden`/`Unauthorized`, todos `ServiceError`) —
    // no se duplican clases que bradb ya define.
    if (err instanceof ServiceError) return res.status(err.statusCode).json({
        success: false,
        errors: [{
            code: err.name,
            message: err.message
        }]
    });

    console.error("INTERNAL ERROR: ", err.message, err.stack);
    return res.status(500).json({
        success: false,
        errors: [{
            code: err.name,
            message: "Internal server error"
        }]
    });
}
