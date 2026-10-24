import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button, Field, FormError, Input, PasswordField } from "../../design-system";
import { useAuth } from "../../auth/AuthContext";
import { useSubmit } from "../../hooks/useSubmit";
import { validateLoginUsername, validateRequiredPassword } from "../../lib/validation";
import { AuthShell } from "./AuthShell";
import { redirectTarget } from "./redirectTarget";

type Errors = { username?: string; password?: string };

export function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState<Errors>({});

    const { pending, error, submit } = useSubmit(async (input: { username: string; password: string }) => {
        await login(input);
        navigate(redirectTarget(location.state), { replace: true });
    });

    const handleSubmit = (event: FormEvent) => {
        event.preventDefault();
        const next: Errors = {
            username: validateLoginUsername(username),
            password: validateRequiredPassword(password)
        };
        setErrors(next);
        if (next.username || next.password) return;

        void submit({ username: username.trim(), password });
    };

    return (
        <AuthShell eyebrow="Iniciar sesión" title="Entrá a tu cuenta" subtitle="Usá el usuario y la contraseña con los que te registraste.">
            <form onSubmit={handleSubmit} noValidate className="hx-form">
                {error ? <FormError title="No pudimos iniciar tu sesión">{error}</FormError> : null}

                <Field id="login-username" label="Usuario" required error={errors.username}>
                    <Input
                        name="username"
                        autoComplete="username"
                        autoFocus
                        placeholder="tu_usuario"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </Field>

                <Field id="login-password" label="Contraseña" required error={errors.password}>
                    <PasswordField
                        name="password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </Field>

                <Button type="submit" disabled={pending}>
                    {pending ? "Ingresando…" : "Ingresar"}
                </Button>

                <p className="hx-auth__switch">
                    ¿Todavía no tenés cuenta? <Link to="/registro">Creá una</Link>
                </p>
            </form>
        </AuthShell>
    );
}
