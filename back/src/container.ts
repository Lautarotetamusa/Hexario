import { db } from "./db/client";
import { createUserModule } from "./modules/user";
import { createTerritoryModule } from "./modules/territory";

export function createContainer() {
    const user = createUserModule({ db });
    const territory = createTerritoryModule({ db });

    return { user, territory };
}

export type Container = ReturnType<typeof createContainer>;

export const container = createContainer();
