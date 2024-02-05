export function disableContextMenu(dom: HTMLCanvasElement) {
  dom.addEventListener('contextmenu', oncontextmenu, true);
  dom.addEventListener('wheel', oncontextmenu, true);
  function oncontextmenu(e: Event) {
    e.preventDefault();
  }
}

export function elementBlur(dom?: HTMLElement) {
  dom = dom || (document.activeElement as HTMLElement);
  dom !== document.body && dom?.blur?.();
}
