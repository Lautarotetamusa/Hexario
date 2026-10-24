import { db } from "./db/client";
import { createUserModule } from "./modules/user";
import { createTerritoryModule } from "./modules/territory";
import { createBusinessModule } from "./modules/business";

export function createContainer() {
    const user = createUserModule({ db });
    const territory = createTerritoryModule({ db });
    const business = createBusinessModule({ db });

    return { user, territory, business };
}

export type Container = ReturnType<typeof createContainer>;

export const container = createContainer();
