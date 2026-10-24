import bcrypt from "bcrypt";
import { Unauthorized } from "bradb";
import { UserRepository } from "./user.repository";
import { UserUpdate, User, CreateUserInput } from "./user.validator";
import { ValidationError } from "../../lib/http/errors";

export type UserServiceDeps = {
    repository: UserRepository;
};

export function createUserService({ repository }: UserServiceDeps) {
    const register = async (body: CreateUserInput): Promise<User> => {
        if (await repository.existsByUsername(body.username)) {
            throw new ValidationError("Ya existe un usuario con este username");
        }

        const password = await bcrypt.hash(body.password, 10);

        return repository.insert({ ...body, password });
    };

    // `changed` en `false` cuando no hay nada que actualizar (bradb tira si
    // `data` viene vacío): el controller decide con eso qué mensaje
    // devolver, sin tener que conocer la regla en sí.
    const update = async (id: number, data: UserUpdate): Promise<{ user: User; changed: boolean }> => {
        if (Object.keys(data).length === 0) {
            return { user: await repository.findOne({ id }), changed: false };
        }

        return { user: await repository.update({ id }, data), changed: true };
    };

    const authenticate = async (username: string, password: string): Promise<User> => {
        const user = await repository.findByUsername(username);
        const hash = await repository.getPasswordHash(user.id);
        const match = await bcrypt.compare(password, hash);

        if (!match) throw new Unauthorized("Contraseña incorrecta");

        return user;
    };

    return {
        findOne: repository.findOne,
        register,
        update,
        authenticate
    };
}

export type UserService = ReturnType<typeof createUserService>;
