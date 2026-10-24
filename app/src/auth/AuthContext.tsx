import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { login as loginRequest, register as registerRequest } from "../api/auth";
import type { LoginInput, RegisterInput } from "../api/auth";
import { setAuthToken } from "../api/client";

type Session = {
    username: string;
    token: string;
};

type AuthContextValue = {
    user: Session | null;
    loading: boolean;
    login: (input: LoginInput) => Promise<void>;
    register: (input: RegisterInput) => Promise<void>;
    logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

// Clave propia de esta app: no se reutiliza la de ningún proyecto anterior.
const STORAGE_KEY = "hexario.session";

// El payload de un JWT viene en base64url (`-` y `_`): `atob` sólo entiende
// base64 clásico, así que se normaliza antes de decodificar.
function decodePayload(payload: string): { exp: number } {
    return JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/"))) as { exp: number };
}

// Un token que no se puede decodificar, o que no trae `exp`, se trata como
// vencido: conviene pedir el ingreso otra vez antes que arrastrar una sesión
// que la API va a rechazar en el primer request.
function isTokenExpired(token: string): boolean {
    const [, payload] = token.split(".");
    if (!payload) return true;

    try {
        return decodePayload(payload).exp * 1000 < Date.now();
    } catch {
        return true;
    }
}

// El valor lo puede editar cualquiera desde la consola del navegador: si
// quedó corrupto, se descarta y la app arranca sin sesión (pantalla de
// ingreso) en vez de romperse antes de renderizar.
function readSession(): Session | null {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    try {
        const session = JSON.parse(stored) as Session;
        if (!session.token || isTokenExpired(session.token)) {
            localStorage.removeItem(STORAGE_KEY);
            return null;
        }
        return session;
    } catch {
        localStorage.removeItem(STORAGE_KEY);
        return null;
    }
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const session = readSession();
        if (session) {
            setAuthToken(session.token);
            setUser(session);
        }
        setLoading(false);
    }, []);

    const login = useCallback(async (input: LoginInput) => {
        const response = await loginRequest(input);
        const session: Session = { username: input.username, token: response.token };

        localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
        setAuthToken(session.token);
        setUser(session);
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem(STORAGE_KEY);
        setAuthToken(null);
        setUser(null);
    }, []);

    // El alta no devuelve token (ver api/auth.ts), así que se entra con la
    // misma credencial recién creada en vez de mandar al usuario a tipearla
    // otra vez en el login.
    const register = useCallback(
        async (input: RegisterInput) => {
            await registerRequest(input);
            await login({ username: input.username, password: input.password });
        },
        [login]
    );

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>{children}</AuthContext.Provider>
    );
}

export function useAuth(): AuthContextValue {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth debe usarse dentro de un AuthProvider");
    return context;
}
