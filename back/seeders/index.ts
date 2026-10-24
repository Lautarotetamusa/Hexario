import { db } from "../src/db/client";
import { createUserModule } from "../src/modules/user";
import { resetSeedData } from "./reset";
import { seedUsers, PASSWORD_SEED } from "./users.seeder";
import { seedTerritories } from "./territories.seeder";
import { seedBusinesses } from "./businesses.seeder";
import { seedPromotions } from "./promotions.seeder";

async function main(): Promise<void> {
    await resetSeedData();

    const user = createUserModule({ db });
    const users = await seedUsers(user.service);
    const territories = await seedTerritories(users);
    const businesses = await seedBusinesses();
    const promotions = await seedPromotions(businesses);

    console.log(`Seed listo: ${users.length} usuarios, password de todos: "${PASSWORD_SEED}"`);
    for (const u of users) {
        console.log(`  - ${u.username}`);
    }
    console.log(`  ${territories} territorios, ${businesses.length} negocios, ${promotions} promociones`);
    for (const business of businesses) {
        console.log(`  - ${business.slug}: ${business.name}`);
    }
}

main()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error("Error corriendo los seeders:", err);
        process.exit(1);
    });
