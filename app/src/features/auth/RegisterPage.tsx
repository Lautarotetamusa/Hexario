import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Alert, Button, Field, Input, PasswordField } from "../../design-system";
import { useAuth } from "../../auth/AuthContext";
import { useToast } from "../../notifications/ToastProvider";
import { AuthShell } from "./AuthShell";
import { useAuthSubmit } from "./useAuthSubmit";
import { validateEmail, validatePassword, validateUsername } from "./validation";

type Errors = { username?: string; email?: string; password?: string; confirm?: string };

export function RegisterPage() {
    const { register } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [errors, setErrors] = useState<Errors>({});

    const { pending, error, submit } = useAuthSubmit(async (input: { username: string; email: string; password: string }) => {
        await register(input);
        // El alta entra directo al inicio: la sesión ya queda iniciada (ver
        // AuthContext#register), así que no se le pide la contraseña de nuevo.
        showToast("success", "Tu cuenta quedó creada.");
        navigate("/", { replace: true });
    });

    const handleSubmit = (event: FormEvent) => {
        event.preventDefault();
        const next: Errors = {
            username: validateUsername(username),
            email: validateEmail(email),
            password: validatePassword(password),
            confirm: confirm === password ? undefined : "Las contraseñas no coinciden."
        };
        setErrors(next);
        if (Object.values(next).some(Boolean)) return;

        void submit({ username: username.trim(), email: email.trim(), password });
    };

    return (
        <AuthShell eyebrow="Crear cuenta" title="Registrate en un paso" subtitle="Con tu usuario, tu email y una contraseña ya tenés tu cuenta lista.">
            <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
                {error ? <Alert tone="error" title="No pudimos crear tu cuenta">{error}</Alert> : null}

                <Field
                    label="Usuario"
                    required
                    htmlFor="register-username"
                    error={errors.username}
                    hint="Es el nombre con el que vas a entrar a la app."
                >
                    <Input
                        id="register-username"
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

                <Field label="Email" required htmlFor="register-email" error={errors.email}>
                    <Input
                        id="register-email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        placeholder="vos@ejemplo.com"
                        value={email}
                        invalid={Boolean(errors.email)}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </Field>

                <PasswordField
                    id="register-password"
                    name="password"
                    label="Contraseña"
                    required
                    autoComplete="new-password"
                    hint="Al menos 8 caracteres."
                    value={password}
                    error={errors.password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <PasswordField
                    id="register-confirm"
                    name="confirm"
                    label="Repetí la contraseña"
                    required
                    autoComplete="new-password"
                    value={confirm}
                    error={errors.confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                />

                <Button type="submit" fullWidth loading={pending}>
                    Crear cuenta
                </Button>

                <p style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)", textAlign: "center" }}>
                    ¿Ya tenés cuenta? <Link to="/login">Ingresá</Link>
                </p>
            </form>
        </AuthShell>
    );
}
