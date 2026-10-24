#!/usr/bin/env bash
# SubagentStop hook: antes de dejar terminar al front-implementer, corre
# el build (tsc + vite build) de /app, y el linter sólo sobre los
# archivos que tocó (no todo el repo, mismo criterio que
# require-back-implementer-checks.sh: no bloquear por deuda ajena). No hay
# suite de tests configurada en /app (ver app/package.json), así que
# no se chequea acá. Si algo falla, bloquea el Stop y le devuelve la salida
# al agente para que corrija antes de darse por terminado.
set -uo pipefail

input="$(cat)"
agent_type="$(echo "$input" | jq -r '.agent_type // .subagent_type // ""')"

if [[ "$agent_type" != "front-implementer" ]]; then
    exit 0
fi

cwd="$(echo "$input" | jq -r '.cwd // ""')"
app_dir="$cwd/app"

failures=""

add_failure() {
    local title="$1" output="$2"
    failures+=$'\n\n## '"$title"$'\n'"$(echo "$output" | tail -n 60)"
}

out="$(cd "$app_dir" && npm run build 2>&1)"
[[ $? -ne 0 ]] && add_failure "npm run build" "$out"

changed_ts="$(
    {
        cd "$app_dir" && git diff --relative --name-only -- src/ 2>/dev/null
        cd "$app_dir" && git ls-files --others --exclude-standard --relative -- src/ 2>/dev/null
    } | grep -E '\.(ts|tsx)$' | sort -u
)"
if [[ -n "$changed_ts" ]]; then
    out="$(cd "$app_dir" && npx oxlint $changed_ts 2>&1)"
    [[ $? -ne 0 ]] && add_failure "oxlint (archivos tocados)" "$out"
fi

if [[ -n "$failures" ]]; then
    jq -n --arg reason "No podés terminar todavía: hay checks en rojo dentro de /app. Corregí esto y volvé a verificar antes de responder de nuevo:$failures" \
        '{"decision":"block","reason":$reason}'
    exit 0
fi

exit 0
