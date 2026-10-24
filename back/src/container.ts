import { db } from "./db/client";
import { createUserModule } from "./modules/user";

export function createContainer() {
    const user = createUserModule({ db });

    return { user };
}

export type Container = ReturnType<typeof createContainer>;

export const container = createContainer();
