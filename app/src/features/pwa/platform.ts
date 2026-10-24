// No hay forma de preguntarle al navegador si soporta la instalación de PWA,
// así que cuando no llegó `beforeinstallprompt` se infiere por plataforma para
// elegir qué instrucciones mostrar. Es sólo texto de ayuda: si falla, el peor
// caso es una instrucción que no aplica.

export function isIos(): boolean {
    return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

// Safari de escritorio: en Mac el nombre del motor está en el UA pero los
// navegadores basados en Chromium (Chrome, Edge, Brave) agregan su propio
// identificador, así que alcanza con descartarlos.
export function isSafariDesktop(): boolean {
    const ua = navigator.userAgent;
    return /safari/i.test(ua) && !/chrome|chromium|crios|edg|android/i.test(ua);
}
