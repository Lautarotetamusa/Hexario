import { HexarioMark } from "../design-system";

export function FullscreenSpinner() {
    return (
        <div className="hx-loading" role="status" aria-label="Cargando Hexario">
            <HexarioMark size={40} />
        </div>
    );
}
