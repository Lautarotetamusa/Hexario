import { useCallback, useMemo, useRef, useState } from 'react';
import {
  BottomSheet,
  Button,
  Chip,
  HeroNumber,
  HexarioMark,
  HexCard,
  IconButton,
  IconClose,
  IconLocate,
  IconPlay,
  Num,
  StatRow,
  TheftNotice,
  formatPoints,
  useTheme,
  useToast,
  type SheetSnap,
} from '../../design-system';
import { AppNav } from '../../layout/AppNav';
import { useHexarioMap } from './useHexarioMap';
import {
  MOCK_HEX_CELLS,
  MOCK_SUMMARY,
  MOCK_THEFT,
  describeHex,
  hexCardState,
  hexPlaceLabel,
} from './mock';

const SHEET_HEIGHTS: Record<SheetSnap, number> = { min: 88, mid: 300, full: 420 };

// La hoja suma, además del cuerpo, el agarre y la nav inferior. Se descuenta
// para que los controles flotantes queden siempre por encima del panel.
const SHEET_CHROME = 48;

const floatingControlBottom = (snap: SheetSnap) =>
  `calc(${SHEET_HEIGHTS[snap]}px + ${SHEET_CHROME}px + var(--hx-nav) + env(safe-area-inset-bottom) + 16px)`;

const HEX_ACTION_MESSAGE = {
  free: 'Pasá por ahí para que sea tuyo',
  mine: 'Volvé a pasar para renovar la protección',
  stealable: 'Caminá hasta ahí y es tuyo',
  protected: 'Todavía está protegido',
} as const;

export function MapPage() {
  const { theme } = useTheme();
  const toast = useToast();
  const mapContainer = useRef<HTMLDivElement>(null);
  const [snap, setSnap] = useState<SheetSnap>(() => (window.innerHeight < 680 ? 'min' : 'mid'));
  const [selected, setSelected] = useState<string | null>(null);
  const [theftVisible, setTheftVisible] = useState(true);

  const cells = useMemo(() => {
    const base = MOCK_HEX_CELLS.map((cell) => (cell.h3 === selected ? { ...cell, selected: true } : cell));
    // Un hexágono libre también se puede tocar: entra al mapa sólo para
    // dibujar el halo de selección.
    if (selected && !base.some((cell) => cell.h3 === selected)) {
      base.push({ h3: selected, owner: null, selected: true });
    }
    return base;
  }, [selected]);

  const handleSelectHex = useCallback((h3: string | null) => {
    setSelected(h3);
    if (h3) {
      setTheftVisible(false);
      // Un toque en el mapa no tiene que quedar escondido detrás del panel mínimo.
      setSnap((current) => (current === 'min' ? 'mid' : current));
    }
  }, []);

  const { centerOnLocation, focusHex } = useHexarioMap({
    container: mapContainer,
    theme,
    cells,
    onSelectHex: handleSelectHex,
  });

  const selectedHex = selected ? describeHex(selected) : null;
  const selectedState = selectedHex ? hexCardState(selectedHex) : null;

  const handleRecover = () => {
    setTheftVisible(false);
    focusHex(MOCK_THEFT.h3);
    handleSelectHex(MOCK_THEFT.h3);
  };

  return (
    <div className="hx-map-screen">
      <div
        ref={mapContainer}
        className="hx-map-canvas"
        role="region"
        aria-label="Mapa de hexágonos de Rosario"
      />

      <div className="hx-map-top">
        <div className="hx-map-top__row">
          <span className="hx-float-pill">
            <HexarioMark size={20} />
            <span style={{ fontWeight: 600 }}>Centro</span>
            <span className="hx-caption">· Rosario</span>
          </span>
        </div>
      </div>

      {theftVisible && !selected && snap !== 'full' && (
        <div className="hx-map-notice">
          <TheftNotice
            thiefName={MOCK_THEFT.thiefName}
            thiefColor={MOCK_THEFT.thiefColor}
            place={MOCK_THEFT.place}
            when={MOCK_THEFT.when}
            lostRentPerHour={MOCK_THEFT.lostRentPerHour}
            onRecover={handleRecover}
            onDismiss={() => setTheftVisible(false)}
          />
        </div>
      )}

      {snap !== 'full' && (
        <>
          <div className="hx-map-attrib" style={{ bottom: floatingControlBottom(snap) }}>
            <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">
              © OpenStreetMap
            </a>
            <span aria-hidden="true">·</span>
            <a href="https://openfreemap.org" target="_blank" rel="noreferrer">
              OpenFreeMap
            </a>
          </div>

          <IconButton
            aria-label="Centrar en mi ubicación"
            className="hx-map-locate"
            style={{ bottom: floatingControlBottom(snap) }}
            onClick={centerOnLocation}
          >
            <IconLocate size={22} />
          </IconButton>
        </>
      )}

      <BottomSheet
        label={selectedHex ? 'Hexágono seleccionado' : 'Resumen de tus puntos'}
        snap={snap}
        onSnapChange={setSnap}
        heights={SHEET_HEIGHTS}
        footer={<AppNav fixed={false} />}
      >
        {selectedHex && selectedState ? (
          <>
            <div className="hx-sheet__row" style={{ alignItems: 'center' }}>
              <span className="hx-label">Hexágono</span>
              <IconButton aria-label="Cerrar tarjeta" variant="subtle" onClick={() => setSelected(null)}>
                <IconClose size={18} />
              </IconButton>
            </div>
            <HexCard
              state={selectedState}
              ownerName={selectedHex.ownerName}
              ownerColor={selectedHex.ownerColor ?? 'neutral'}
              place={hexPlaceLabel(selectedHex)}
              rentPerHour={selectedHex.rentPerHour}
              protectionLeftMs={selectedHex.protectionLeftMs}
              legendary={selectedHex.legendary}
              float={false}
              className="hx-card--flat"
              onAction={() => toast(HEX_ACTION_MESSAGE[selectedState])}
              onNotify={() => toast('Te avisamos cuando se libere')}
            />
          </>
        ) : (
          <>
            <div className="hx-sheet__row">
              <HeroNumber label="Tus puntos" value={formatPoints(MOCK_SUMMARY.points)} unit="pts" />
              {snap !== 'min' && (
                <Chip tone="ok">
                  <Num>+{MOCK_SUMMARY.pointsPerHour}</Num> por hora
                </Chip>
              )}
            </div>
            <StatRow
              stats={[
                { label: 'Hexágonos', value: MOCK_SUMMARY.hexagons },
                { label: 'Protegidos', value: MOCK_SUMMARY.protectedCount },
                { label: 'Robables', value: MOCK_SUMMARY.stealableCount, tone: 'alert' },
              ]}
            />
            <Button icon={<IconPlay size={20} strokeWidth={2} />} onClick={() => toast('Caminata iniciada')}>
              Empezar caminata
            </Button>
          </>
        )}
      </BottomSheet>
    </div>
  );
}
