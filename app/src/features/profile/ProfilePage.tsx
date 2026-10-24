import { useState } from "react";
import type { FormEvent } from "react";
import { Alert, Button, Card, Field, Input } from "../../design-system";
import { updateMe } from "../../api/user";
import { getErrorMessage } from "../../lib/errors";
import { useToast } from "../../notifications/ToastProvider";
import { useProfile } from "./useProfile";

export function ProfilePage() {
    const { profile, loading, error, setProfile } = useProfile();
    const { showToast } = useToast();

    const [draftEmail, setDraftEmail] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    // Sin efecto de sincronización: mientras nadie edite, el valor sale del
    // perfil cargado; apenas se escribe, el draft manda.
    const email = draftEmail ?? profile?.email ?? "";

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        setFormError(null);
        setSaving(true);

        try {
            const response = await updateMe({ email: email.trim() });
            setProfile(response.data);
            setDraftEmail(null);
            showToast("success", "Email actualizado.");
        } catch (err) {
            setFormError(getErrorMessage(err));
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="page-stack">
            <header className="page-heading">
                <span className="eyebrow">Cuenta</span>
                <h1>Tu perfil</h1>
                <p>Estos son los datos con los que entraste a Hexario.</p>
            </header>

            {error ? <Alert tone="error" title="No pudimos cargar tu perfil">{error}</Alert> : null}

            <Card title="Datos de la cuenta" subtitle={loading ? "Cargando…" : "El usuario no se puede cambiar desde acá."}>
                <div className="card-body">
                    <Field label="Usuario" htmlFor="profile-username">
                        <Input id="profile-username" value={profile?.username ?? ""} readOnly disabled />
                    </Field>

                    <form onSubmit={handleSubmit} className="form-stack" noValidate>
                        {formError ? <Alert tone="error" title="No pudimos guardar">{formError}</Alert> : null}

                        <Field label="Email" required htmlFor="profile-email" hint="Se usa para identificarte en la cuenta.">
                            <Input
                                id="profile-email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                placeholder="vos@ejemplo.com"
                                value={email}
                                onChange={(event) => setDraftEmail(event.target.value)}
                                disabled={loading}
                            />
                        </Field>

                        <div>
                            <Button type="submit" loading={saving} disabled={loading || !profile}>
                                Guardar cambios
                            </Button>
                        </div>
                    </form>
                </div>
            </Card>
        </div>
    );
}
