import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { createPkSchema } from 'bradb';
import { usersTable } from './user.schema';
import { z } from 'zod';

// `select` excluye siempre `password`: estructuralmente imposible devolver el
// hash en una respuesta, sin depender de que cada controller se acuerde de omitirlo.
const select = createSelectSchema(usersTable).omit({ password: true });
const insert = createInsertSchema(usersTable, { email: z.string().email() });
const update = z.object({
    email: z.string().email()
}).partial();
const pk = createPkSchema(usersTable);

export type UserInsert = z.infer<typeof insert>;
export type UserUpdate = z.infer<typeof update>;
export type User = z.infer<typeof select>;
export type TokenUser = Pick<User, 'id'>;

export const userValidator = {
    select,
    insert,
    update,
    pk
};

export const loginUserValidator = z.object({
    username: z.string(),
    password: z.string(),
});

export const createUserValidator = insert.pick({
    username: true,
    password: true,
    email: true,
});
export type CreateUserInput = z.infer<typeof createUserValidator>;
