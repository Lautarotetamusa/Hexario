Use `SidebarNav` as the app's only primary navigation. Mix `{section}` dividers with link items.

```jsx
<SidebarNav value={view} onChange={setView} items={[
  {value:'',label:'Inicio',icon:'layout-dashboard'},
  {section:'Cuenta'},
  {value:'perfil',label:'Perfil',icon:'user-round'},
  {value:'instalar',label:'Instalar',icon:'download'},
]} />
```

En la app base el layout no usa `SidebarNav`: en mobile la navegación es una
barra inferior y en desktop un header horizontal (ver `src/layout/AppLayout.tsx`).
