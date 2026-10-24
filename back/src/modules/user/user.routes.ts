import express from "express";
import { auth } from "../../lib/auth/auth";
import { UserController } from "./user.controller";

export function createUserRoutes(controller: UserController) {
    const router = express.Router();

    router.post('/register', controller.create);

    router.post('/login', controller.login);

    router.put('', auth, controller.update);

    router.get('/', auth, controller.getOne);

    return router;
}
