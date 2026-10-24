// Reglas de validación de los formularios de sesión, en un solo lugar para que
// login y registro no las repitan ni se desincronicen. Son sólo la primera
// barrera (evitan un ida y vuelta al servidor por un campo vacío): el backend
// sigue siendo quien decide si un usuario o un email ya existen.

export const USERNAME_RULE = "Usá entre 3 y 20 caracteres: letras, números o guion bajo.";
export const PASSWORD_RULE = "Usá al menos 8 caracteres.";
export const EMAIL_RULE = "Revisá el email: parece incompleto.";

const USERNAME_PATTERN = /^[a-zA-Z0-9_]{3,20}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateUsername(value: string): string | undefined {
    const trimmed = value.trim();
    if (!trimmed) return "Elegí un nombre de usuario.";
    if (!USERNAME_PATTERN.test(trimmed)) return USERNAME_RULE;
    return undefined;
}

export function validateEmail(value: string): string | undefined {
    const trimmed = value.trim();
    if (!trimmed) return "Escribí tu email.";
    if (!EMAIL_PATTERN.test(trimmed)) return EMAIL_RULE;
    return undefined;
}

export function validatePassword(value: string): string | undefined {
    if (!value) return "Escribí una contraseña.";
    if (value.length < 8) return PASSWORD_RULE;
    return undefined;
}

// En el login no se repiten las reglas del alta: si el usuario ya existe con
// otro formato, el error lo tiene que dar el servidor, no el navegador.
export function validateLoginUsername(value: string): string | undefined {
    return value.trim() ? undefined : "Escribí tu usuario.";
}

export function validateRequiredPassword(value: string): string | undefined {
    return value ? undefined : "Escribí tu contraseña.";
}
