import { useEffect, useState } from "react";
import { getMe } from "../../api/user";
import type { User } from "../../api/user";
import { getErrorMessage } from "../../lib/errors";

export type ProfileState = {
    profile: User | null;
    loading: boolean;
    error: string | null;
    setProfile: (user: User) => void;
};

// La sesión guarda sólo username + token (no el perfil completo): el email
// vive en la API y se lee una vez al entrar a la pantalla. Así el token no
// arrastra datos que puedan quedar viejos.
export function useProfile(): ProfileState {
    const [profile, setProfile] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        getMe()
            .then((response) => {
                if (!cancelled) setProfile(response.data);
            })
            .catch((err: unknown) => {
                if (!cancelled) setError(getErrorMessage(err));
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, []);

    return { profile, loading, error, setProfile };
}
