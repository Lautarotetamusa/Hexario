import React from 'react';
import { Field } from './Field.jsx';
import { Input } from './Input.jsx';
import { IconButton } from '../core/IconButton.jsx';

// Campo de contraseña: el Field + Input del sistema más el botón de
// mostrar/ocultar superpuesto. Vive acá y no en cada pantalla porque todo
// formulario con contraseña necesita las tres piezas juntas: control
// enmascarado, revelado a pedido y etiqueta/error consistentes.
//
// El botón se superpone en vez de usar `suffix` del Input para no heredar el
// tratamiento mono (el sufijo es para unidades: ARS, %).
export function PasswordField({ id, label, hint, error, required, size = 'md', style, ...rest }) {
  const [visible, setVisible] = React.useState(false);
  const invalid = Boolean(error);

  return (
    <Field label={label} hint={hint} error={error} required={required} htmlFor={id} style={style}>
      <div style={{ position: 'relative' }}>
        <Input
          id={id}
          size={size}
          type={visible ? 'text' : 'password'}
          invalid={invalid}
          aria-invalid={invalid || undefined}
          style={{ paddingRight: 34 }}
          {...rest}
        />
        <IconButton
          icon={visible ? 'eye-off' : 'eye'}
          size="sm"
          label={visible ? 'Ocultar la contraseña' : 'Mostrar la contraseña'}
          onClick={() => setVisible(v => !v)}
          style={{ position: 'absolute', right: 4, top: '50%', transform: 'translateY(-50%)' }}
        />
      </div>
    </Field>
  );
}
