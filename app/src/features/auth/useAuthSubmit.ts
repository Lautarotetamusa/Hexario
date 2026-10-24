import { useState } from "react";
import { getErrorMessage } from "../../lib/errors";

// Envuelve el submit de un formulario de sesión con los dos estados que la
// pantalla realmente necesita mostrar: `pending` (para el botón) y `error`
// (para el Alert). No sabe qué se envía ni a quién: recibe la acción ya armada,
// misma idea de inyección que el resto de los hooks del proyecto.
export function useAuthSubmit<TInput>(action: (input: TInput) => Promise<void>) {
    const [pending, setPending] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const submit = async (input: TInput) => {
        setError(null);
        setPending(true);
        try {
            await action(input);
        } catch (err) {
            // Acá sí hay un lugar que reacciona al error: el Alert del form.
            setError(getErrorMessage(err));
        } finally {
            setPending(false);
        }
    };

    return { pending, error, submit };
}
