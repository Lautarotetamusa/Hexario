import { createContext, useContext, useState } from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';
import { cx } from './cx';

/**
 * Formularios: el sistema no traía campos de entrada. Se extiende acá con el
 * mismo lenguaje (altura 56, radio de tarjeta, etiqueta en mayúsculas) y con
 * `aria-describedby` cableado desde `Field` para no repetirlo en cada pantalla.
 */

type FieldContextValue = {
  id: string;
  describedBy?: string;
  invalid: boolean;
  required: boolean;
};

const FieldContext = createContext<FieldContextValue | null>(null);

type FieldProps = {
  /** Id del control: lo comparten la etiqueta y el propio input. */
  id: string;
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: ReactNode;
  className?: string;
};

export function Field({ id, label, required, hint, error, children, className }: FieldProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = errorId ?? hintId;

  return (
    <div className={cx('hx-field', error && 'hx-field--invalid', className)}>
      <label className="hx-field__label" htmlFor={id}>
        {label}
        {required && (
          <>
            <span className="hx-field__req" aria-hidden="true">
              *
            </span>
            <span className="hx-visually-hidden">(obligatorio)</span>
          </>
        )}
      </label>
      <FieldContext.Provider value={{ id, describedBy, invalid: Boolean(error), required: Boolean(required) }}>
        {children}
      </FieldContext.Provider>
      {hint && !error && (
        <span id={hintId} className="hx-field__hint">
          {hint}
        </span>
      )}
      {error && (
        <span id={errorId} className="hx-field__error" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  /** Fuerza el estado de error cuando el campo no va dentro de un `Field`. */
  invalid?: boolean;
};

export function Input({ className, invalid, ...rest }: InputProps) {
  const field = useContext(FieldContext);
  const isInvalid = invalid ?? field?.invalid ?? false;

  return (
    <input
      {...rest}
      id={rest.id ?? field?.id}
      required={rest.required ?? field?.required}
      aria-invalid={isInvalid || undefined}
      aria-describedby={rest['aria-describedby'] ?? field?.describedBy}
      className={cx('hx-input', isInvalid && 'hx-input--invalid', className)}
    />
  );
}

type PasswordFieldProps = Omit<InputProps, 'type'>;

export function PasswordField({ className, ...rest }: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="hx-field__control">
      <Input {...rest} type={visible ? 'text' : 'password'} className={cx('hx-input--with-action', className)} />
      <button
        type="button"
        className="hx-field__toggle"
        aria-pressed={visible}
        aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        onClick={() => setVisible((current) => !current)}
      >
        {visible ? 'Ocultar' : 'Mostrar'}
      </button>
    </div>
  );
}

type FormErrorProps = {
  title?: string;
  children: ReactNode;
};

/** Error de envío que no pertenece a un campo puntual. */
export function FormError({ title, children }: FormErrorProps) {
  return (
    <div className="hx-form-error" role="alert">
      {title && <span className="hx-form-error__title">{title}</span>}
      <span>{children}</span>
    </div>
  );
}
