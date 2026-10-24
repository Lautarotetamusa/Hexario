#!/usr/bin/env bash
# Recrea la base de desarrollo desde cero: dropea, crea, migra y seedea.
# No toca la base de test (esa la maneja scripts/reset-test-db.sh).
set -euo pipefail

cd "$(dirname "$0")/.."

set -a
source .env
set +a

read -rp "⚠️  Esto elimina y recrea la base '$DB_NAME' en $DB_HOST:$DB_PORT. Escribí 'ACEPTAR' para continuar: " CONFIRM
if [[ "$CONFIRM" != "ACEPTAR" ]]; then
    echo "❌ Operación cancelada."
    exit 1
fi

export PGPASSWORD="$DB_PASS"

echo "🔴 Recreando $DB_NAME..."
dropdb -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" --if-exists --force "$DB_NAME"
createdb -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" "$DB_NAME"

echo "🟢 Aplicando migraciones..."
npx drizzle-kit migrate

echo "🌱 Cargando seed..."
npm run seed

echo "✅ Base '$DB_NAME' lista."
