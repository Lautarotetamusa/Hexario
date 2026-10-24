import { eq } from "drizzle-orm";
import { ServiceBuilder, NotFound } from "bradb";
import { Database } from "../../db/client";
import { usersTable } from "./user.schema";
import { userFilterMap } from "./user.filter";
import { userValidator, UserInsert, UserUpdate, User } from "./user.validator";

export type UserRepositoryDeps = {
    db: Database;
};

export function createUserRepository({ db }: UserRepositoryDeps) {
    const builder = new ServiceBuilder(db, usersTable, userFilterMap);

    // Columnas de `usersTable` sin `password`: se reutiliza en todos los
    // caminos de lectura para que sea imposible traer el hash por accidente,
    // ni siquiera si se agrega un campo nuevo a mano.
    const selectWithoutPassword = () =>
        db
            .select({
                id: usersTable.id,
                username: usersTable.username,
                email: usersTable.email
            })
            .from(usersTable)
            .$dynamic();

    const findOne = builder.findOne(selectWithoutPassword);
    const persistInsert = builder.create();
    const persistUpdate = builder.update();

    // El parse saca el `password` de las filas que devuelven insert/update,
    // así el hash nunca sale de este archivo.
    const insert = async (data: UserInsert): Promise<User> =>
        userValidator.select.parse(await persistInsert(data));

    const update = async (pk: { id: number }, data: UserUpdate): Promise<User> =>
        userValidator.select.parse(await persistUpdate(pk, data));

    const existsByUsername = async (username: string): Promise<boolean> => {
        const rows = await db
            .select({ id: usersTable.id })
            .from(usersTable)
            .where(eq(usersTable.username, username))
            .limit(1);

        return rows.length > 0;
    };

    const getPasswordHash = async (id: number): Promise<string> => {
        const rows = await db
            .select({ password: usersTable.password })
            .from(usersTable)
            .where(eq(usersTable.id, id))
            .limit(1);

        if (rows.length === 0) throw new NotFound(`No existe un usuario con id ${id}`);

        return rows[0].password;
    };

    const findByUsername = async (username: string): Promise<User> => {
        const rows = await selectWithoutPassword().where(eq(usersTable.username, username));

        if (rows.length === 0) throw new NotFound(`No existe un usuario con username ${username}`);

        return rows[0];
    };

    return {
        findOne,
        insert,
        update,
        existsByUsername,
        getPasswordHash,
        findByUsername
    };
}

export type UserRepository = ReturnType<typeof createUserRepository>;
