export default function useContextMenu() {
    // oncontextmenu
    let dom: HTMLDivElement | null = null;

    function handleContext(d: HTMLDivElement) {
        dom = d;
        dom.addEventListener('contextmenu', oncontextmenu, true);
    }

    function oncontextmenu(e: Event) {
        // console.log(e.target);
        e.preventDefault();
    }

    function clearContext() {
        dom && dom.removeEventListener('contextmenu', oncontextmenu, true);
        dom = null;
    }

    return {
        clearContext,
        handleContext,
    };
}
