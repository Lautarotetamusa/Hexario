import { CreateUserInput, UserService } from "../src/modules/user";

// Usuarios de prueba fijos: son la puerta de entrada para loguearse a mano
// en desarrollo y para los tests, así que su username/password tienen que
// ser previsibles.
export const PASSWORD_SEED = "seed12345";

const USUARIOS_SEED: Omit<CreateUserInput, "password">[] = [
    { username: "usuario_uno", email: "usuario_uno@example.com" },
    { username: "usuario_dos", email: "usuario_dos@example.com" },
    { username: "juli", email: "juli@example.com" },
    { username: "tomi", email: "tomi@example.com" },
    { username: "agus", email: "agus@example.com" },
    { username: "meli", email: "meli@example.com" },
    { username: "nico", email: "nico@example.com" },
    { username: "sofia", email: "sofia@example.com" }
];

// `register` (no un insert directo) para no duplicar el hasheo de la
// password. `userService` entra por parámetro, mismo patrón que el resto.
export async function seedUsers(userService: UserService) {
    const users = [];
    for (const usuario of USUARIOS_SEED) {
        users.push(await userService.register({ ...usuario, password: PASSWORD_SEED }));
    }
    return users;
}
