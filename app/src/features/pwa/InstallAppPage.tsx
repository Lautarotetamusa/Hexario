import { useNavigate } from 'react-router-dom';
import {
  Button,
  Chip,
  IconArrowLeft,
  IconArrowRight,
  IconButton,
  IconCheck,
  IconHex,
} from '../../design-system';
import { isIos, isSafariDesktop } from './platform';
import { useInstallPrompt } from './useInstallPrompt';

const BENEFITS = [
  { icon: <IconHex size={18} />, text: 'Abre a pantalla completa desde el ícono, sin la barra del navegador.' },
  { icon: <IconCheck size={18} />, text: 'Arranca aunque no tengas conexión: el shell queda guardado en el dispositivo.' },
  { icon: <IconArrowRight size={18} />, text: 'Se instala en el momento, sin pasar por una tienda de aplicaciones.' },
];

// Instrucciones manuales para los navegadores que no ofrecen `beforeinstallprompt`
// (Safari de iOS y de escritorio). Cada variante es el camino real de ese navegador.
function manualSteps(): string[] {
  if (isIos()) {
    return [
      'Abrí esta pantalla en Safari.',
      'Tocá el botón Compartir de la barra inferior.',
      'Elegí «Agregar a pantalla de inicio» y confirmá con «Agregar».',
    ];
  }
  if (isSafariDesktop()) {
    return [
      'Con esta pantalla abierta, entrá al menú Archivo.',
      'Elegí «Agregar al Dock» y confirmá con «Agregar».',
    ];
  }
  return [
    'Abrí esta pantalla en Chrome o Edge, en el teléfono o en la computadora.',
    'Tocá el ícono de instalar de la barra de direcciones, o el menú del navegador.',
    'Confirmá con «Instalar»: el ícono queda en tu inicio o escritorio.',
  ];
}

function InstallSteps() {
  return (
    <div className="hx-section">
      <p className="hx-caption">Este navegador no ofrece el botón de instalación. Se puede instalar igual, en dos pasos:</p>
      <ol className="hx-steps">
        {manualSteps().map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
    </div>
  );
}

export function InstallAppPage() {
  const navigate = useNavigate();
  const { canInstall, isInstalled, install } = useInstallPrompt();

  return (
    <main className="hx-screen hx-screen--app">
      <header className="hx-page-header">
        <div className="hx-page-header__row">
          <IconButton aria-label="Volver al perfil" variant="subtle" onClick={() => navigate('/perfil')}>
            <IconArrowLeft size={20} />
          </IconButton>
          <span className="hx-label">Aplicación</span>
        </div>
        <h1 className="hx-title">Instalar Hexario</h1>
        <p className="hx-caption">Instalada se abre como una app, no como una pestaña del navegador.</p>
      </header>

      <section className="hx-panel" aria-labelledby="install-device">
        <div className="hx-list-header">
          <h2 className="hx-subtitle" id="install-device">
            En tu dispositivo
          </h2>
          {isInstalled ? (
            <Chip tone="ok" size="sm">
              Instalada
            </Chip>
          ) : null}
        </div>

        <ul className="hx-benefits">
          {BENEFITS.map((benefit) => (
            <li key={benefit.text}>
              {benefit.icon}
              <span>{benefit.text}</span>
            </li>
          ))}
        </ul>

        {isInstalled ? (
          <p className="hx-caption">
            Ya la estás usando desde el ícono de este dispositivo y no hace falta hacer nada más.
          </p>
        ) : canInstall ? (
          <Button onClick={install}>Instalar Hexario</Button>
        ) : (
          <InstallSteps />
        )}
      </section>
    </main>
  );
}
