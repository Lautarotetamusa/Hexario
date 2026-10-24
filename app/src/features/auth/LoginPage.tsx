import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Alert, Button, Field, Input, PasswordField } from "../../design-system";
import { useAuth } from "../../auth/AuthContext";
import { AuthShell } from "./AuthShell";
import { redirectTarget } from "./redirectTarget";
import { useAuthSubmit } from "./useAuthSubmit";
import { validateLoginUsername, validateRequiredPassword } from "./validation";

type Errors = { username?: string; password?: string };

export function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState<Errors>({});

    const { pending, error, submit } = useAuthSubmit(async (input: { username: string; password: string }) => {
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
            <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
                {error ? <Alert tone="error" title="No pudimos iniciar tu sesión">{error}</Alert> : null}

                <Field label="Usuario" required htmlFor="login-username" error={errors.username}>
                    <Input
                        id="login-username"
                        name="username"
                        iconStart="user-round"
                        autoComplete="username"
                        autoFocus
                        placeholder="tu_usuario"
                        value={username}
                        invalid={Boolean(errors.username)}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </Field>

                <PasswordField
                    id="login-password"
                    name="password"
                    label="Contraseña"
                    required
                    autoComplete="current-password"
                    value={password}
                    error={errors.password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <Button type="submit" fullWidth loading={pending}>
                    Ingresar
                </Button>

                <p style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", textAlign: "center" }}>
                    ¿Todavía no tenés cuenta? <Link to="/registro">Creá una</Link>
                </p>
            </form>
        </AuthShell>
    );
}
