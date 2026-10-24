Use `PasswordField` en lugar de `Field` + `Input type="password"` cuando el valor es una
contraseña: agrega el botón de mostrar/ocultar y marca el control con `invalid` a partir
de `error`. El resto de las props de `Input` (`value`, `onChange`, `autoComplete`, `disabled`)
se pasan tal cual.

```jsx
<PasswordField
  id="password"
  label="Contraseña"
  autoComplete="current-password"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  error={errors.password}
/>
```

`autoComplete="current-password"` al entrar y `"new-password"` al crear cuenta: así el
gestor de contraseñas del navegador (y el de la PWA instalada) ofrece lo correcto.
