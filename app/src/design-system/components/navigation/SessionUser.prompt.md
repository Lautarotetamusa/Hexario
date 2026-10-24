Use `SessionUser` como `footer` de `SidebarNav`: es el único lugar de la barra donde se ve
con quién está iniciada la sesión y desde dónde se cierra.

```jsx
<SidebarNav
  items={NAV_ITEMS}
  value={section}
  onChange={navigate}
  footer={<SessionUser name={user.username} onLogout={handleLogout} />}
/>
```

`onLogout` sólo ejecuta la acción: a dónde ir después lo decide el layout que lo usa.
