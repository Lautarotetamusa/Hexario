import { RequestHandler } from "express";
import { userValidator, loginUserValidator, createUserValidator } from "./user.validator";
import { UserService } from "./user.service";
import { signToken } from "../../lib/auth/auth";
import { created, ok, updated } from "../../lib/http/responses";

// El controller sólo adapta HTTP: parsea/valida con zod, le pasa los datos
// al service y arma la respuesta. Las reglas de negocio (unicidad de
// username, verificación de password, etc.) viven en user.service.ts.
export type UserControllerDeps = {
    service: UserService;
};

export function createUserController({ service }: UserControllerDeps) {
    const create: RequestHandler = async (req, res) => {
        const body = createUserValidator.parse(req.body);
        const user = await service.register(body);

        created(res, user, "Usuario creado correctamente");
    }

    const update: RequestHandler = async (req, res) => {
        const body = userValidator.update.parse(req.body);
        const { user, changed } = await service.update(res.locals.user.id, body);

        updated(res, user, changed ? "Usuario actualizado correctamente" : "El usuario esta igual que antes");
    }

    // El JWT es un artefacto de la capa HTTP (el token que viaja en la
    // response), no un dato que el service tenga que conocer: por eso se
    // firma acá, después de que el service sólo confirma la credencial.
    const login: RequestHandler = async (req, res) => {
        const body = loginUserValidator.parse(req.body);
        const user = await service.authenticate(body.username, body.password);

        res.status(200).json({
            success: true,
            message: "login exitoso",
            token: signToken(user)
        });
    }

    const getOne: RequestHandler = async (req, res) => {
        const user = await service.findOne({ id: res.locals.user.id });

        ok(res, user);
    }

    return {
        create,
        login,
        update,
        getOne
    }
}

export type UserController = ReturnType<typeof createUserController>;
