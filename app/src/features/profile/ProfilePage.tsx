import { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import {
  Avatar,
  Button,
  Field,
  FormError,
  IconArrowRight,
  IconHex,
  Input,
  Segmented,
  useTheme,
  useToast,
  type ThemePreference,
} from "../../design-system";
import { updateMe } from "../../api/user";
import { useAuth } from "../../auth/AuthContext";
import { useSubmit } from "../../hooks/useSubmit";
import { validateEmail } from "../../lib/validation";
import { useProfile } from "./useProfile";

const THEME_OPTIONS: Array<{ value: ThemePreference; label: string }> = [
  { value: "system", label: "Sistema" },
  { value: "light", label: "Claro" },
  { value: "dark", label: "Oscuro" },
];

export function ProfilePage() {
  const { user, logout } = useAuth();
  const { profile, loading, error, setProfile } = useProfile();
  const { preference, setPreference } = useTheme();
  const toast = useToast();

  const [draftEmail, setDraftEmail] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | undefined>(undefined);

  // Sin efecto de sincronización: mientras nadie edite, el valor sale del
  // perfil cargado; apenas se escribe, el draft manda.
  const email = draftEmail ?? profile?.email ?? "";
  const dirty = profile !== null && email.trim() !== profile.email;

  const { pending: saving, error: formError, submit } = useSubmit(async (nextEmail: string) => {
    const response = await updateMe({ email: nextEmail });
    setProfile(response.data);
    setDraftEmail(null);
    toast("Email actualizado.");
  });

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const nextError = validateEmail(email);
    setEmailError(nextError);
    if (nextError) return;
    void submit(email.trim());
  };

  const handleLogout = () => {
    logout();
    toast("Sesión cerrada.");
  };

  const username = profile?.username ?? user?.username ?? "";

  return (
    <main className="hx-screen hx-screen--app">
      <header className="hx-page-header">
        <span className="hx-label">Cuenta</span>
        <h1 className="hx-title">Tu perfil</h1>
      </header>

      <div className="hx-profile-head">
        <Avatar name={username} color="me" size="lg" />
        <div>
          <div className="hx-profile-head__name">{username}</div>
          <span className="hx-caption">{loading ? "Cargando…" : "Sesión activa"}</span>
        </div>
      </div>

      {error ? <FormError title="No pudimos cargar tu perfil">{error}</FormError> : null}

      <section className="hx-panel" aria-labelledby="profile-data">
        <div>
          <h2 className="hx-subtitle" id="profile-data">
            Datos de la cuenta
          </h2>
          <p className="hx-caption">El usuario no se puede cambiar desde acá.</p>
        </div>

        <Field id="profile-username" label="Usuario">
          <Input value={username} readOnly disabled={loading} />
        </Field>

        <form className="hx-form" onSubmit={handleSubmit} noValidate>
          {formError ? <FormError title="No pudimos guardar">{formError}</FormError> : null}

          <Field
            id="profile-email"
            label="Email"
            required
            error={emailError}
            hint="Se usa para identificarte en la cuenta."
          >
            <Input
              name="email"
              type="email"
              autoComplete="email"
              placeholder="vos@ejemplo.com"
              value={email}
              disabled={loading}
              onChange={(event) => {
                setDraftEmail(event.target.value);
                setEmailError(undefined);
              }}
            />
          </Field>

          <Button type="submit" disabled={loading || saving || !dirty}>
            {saving ? "Guardando…" : "Guardar cambios"}
          </Button>
        </form>
      </section>

      <section className="hx-panel" aria-labelledby="profile-preferences">
        <div>
          <h2 className="hx-subtitle" id="profile-preferences">
            Preferencias
          </h2>
          <p className="hx-caption">El tema también se aplica al mapa.</p>
        </div>

        <div className="hx-section">
          <span className="hx-label">Tema</span>
          <Segmented
            label="Tema de la interfaz"
            options={THEME_OPTIONS}
            value={preference}
            onChange={setPreference}
          />
        </div>

        <ul className="hx-rows">
          <li>
            <Link className="hx-row" to="/instalar">
              <IconHex size={20} />
              <span className="hx-row__label">Instalar la app</span>
              <IconArrowRight size={18} />
            </Link>
          </li>
        </ul>
      </section>

      <Button variant="secondary" onClick={handleLogout}>
        Cerrar sesión
      </Button>
    </main>
  );
}
