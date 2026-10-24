/** Contraseña: `Field` + `Input` del sistema con el botón de mostrar/ocultar superpuesto. */
export interface PasswordFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  id: string;
  label?: React.ReactNode;
  /** Texto de ayuda; se oculta cuando hay `error`. */
  hint?: React.ReactNode;
  /** Mensaje de error del campo (marca el control como inválido). */
  error?: React.ReactNode;
  required?: boolean;
  size?: 'sm' | 'md' | 'lg';
}
export function PasswordField(props: PasswordFieldProps): JSX.Element;
