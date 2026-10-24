import { db } from "../src/db/client";
import { createUserModule } from "../src/modules/user";
import { resetSeedData } from "./reset";
import { seedUsers, PASSWORD_SEED } from "./users.seeder";

async function main(): Promise<void> {
    await resetSeedData();

    const user = createUserModule({ db });
    const users = await seedUsers(user.service);

    console.log(`Seed listo: ${users.length} usuarios, password de todos: "${PASSWORD_SEED}"`);
    for (const u of users) {
        console.log(`  - ${u.username}`);
    }
}

main()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error("Error corriendo los seeders:", err);
        process.exit(1);
    });
