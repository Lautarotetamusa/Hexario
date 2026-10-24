import { useState } from 'react';
import { getErrorMessage } from '../lib/errors';

// Envuelve el submit de un formulario con los dos estados que la pantalla
// necesita mostrar: `pending` (para el botón) y `error` (para el aviso). No
// sabe qué se envía ni a quién: recibe la acción ya armada.
export function useSubmit<TInput>(action: (input: TInput) => Promise<void>) {
    const [pending, setPending] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const submit = async (input: TInput) => {
        setError(null);
        setPending(true);
        try {
            await action(input);
        } catch (err) {
            // Acá sí hay un lugar que reacciona al error: el aviso del formulario.
            setError(getErrorMessage(err));
        } finally {
            setPending(false);
        }
    };

    return { pending, error, submit };
}
