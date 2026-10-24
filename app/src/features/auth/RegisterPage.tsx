import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Field, FormError, Input, PasswordField, useToast } from "../../design-system";
import { useAuth } from "../../auth/AuthContext";
import { useSubmit } from "../../hooks/useSubmit";
import { validateEmail, validatePassword, validateUsername } from "../../lib/validation";
import { AuthShell } from "./AuthShell";

type Errors = { username?: string; email?: string; password?: string; confirm?: string };

export function RegisterPage() {
    const { register } = useAuth();
    const toast = useToast();
    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [errors, setErrors] = useState<Errors>({});

    const { pending, error, submit } = useSubmit(async (input: { username: string; email: string; password: string }) => {
        await register(input);
        // El alta entra directo al inicio: la sesión ya queda iniciada (ver
        // AuthContext#register), así que no se le pide la contraseña de nuevo.
        toast("Tu cuenta quedó creada.");
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
            <form onSubmit={handleSubmit} noValidate className="hx-form">
                {error ? <FormError title="No pudimos crear tu cuenta">{error}</FormError> : null}

                <Field
                    id="register-username"
                    label="Usuario"
                    required
                    error={errors.username}
                    hint="Es el nombre con el que vas a entrar a la app."
                >
                    <Input
                        name="username"
                        autoComplete="username"
                        autoFocus
                        placeholder="tu_usuario"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </Field>

                <Field id="register-email" label="Email" required error={errors.email}>
                    <Input
                        name="email"
                        type="email"
                        autoComplete="email"
                        placeholder="vos@ejemplo.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </Field>

                <Field id="register-password" label="Contraseña" required error={errors.password} hint="Al menos 8 caracteres.">
                    <PasswordField
                        name="password"
                        autoComplete="new-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </Field>

                <Field id="register-confirm" label="Repetí la contraseña" required error={errors.confirm}>
                    <PasswordField
                        name="confirm"
                        autoComplete="new-password"
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                    />
                </Field>

                <Button type="submit" disabled={pending}>
                    {pending ? "Creando cuenta…" : "Crear cuenta"}
                </Button>

                <p className="hx-auth__switch">
                    ¿Ya tenés cuenta? <Link to="/login">Ingresá</Link>
                </p>
            </form>
        </AuthShell>
    );
}
