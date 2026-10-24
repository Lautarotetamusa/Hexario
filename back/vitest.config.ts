import { defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
    test: {
        environment: "node",
        globals: true,
        testTimeout: 30000,
        // Todos los archivos de test comparten la misma DB fija (ver
        // scripts/reset-test-db.sh) y se ejecutan de a uno para que no se
        // pisen los datos entre archivos.
        fileParallelism: false,
        coverage: {
            provider: "v8",
            reporter: ["text", "html"],
            include: ["src/**/*.ts"],
            exclude: ["src/index.ts"]
        }
    },
    resolve: {
        alias: {
            "@": resolve(__dirname, "src")
        }
    }
});
