/**
 * The DOM enhancer behind dsh-gaussian-blur.
 *
 * Strategy: never couple to hashed CSS-module classes. The shipped Web UI
 * exposes a handful of stable hooks — the overlay layer attribute, the
 * conversation scroll wrapper, the composer seat/card attributes, and the
 * conversation root's `data-phase` — so the enhancer locates the surfaces
 * through those hooks, stamps its own `data-gb-*` markers on them, and lets
 * enhancer.module.css do all the visual work.
 *
 * The markup pass is idempotent and re-runs from a document-level
 * MutationObserver (debounced to one animation frame) plus scroll/resize
 * events, so React remounts never lose the styling. Disposal removes every
 * marker, restores the built-in sidebar fade, and disconnects the observers.
 *
 * @module dsh-gaussian-blur/client/enhancer
 */
import './enhancer.module.css';
/** Marker stamped on the conversation root (the `div[data-phase]` column). */
export const GB_ROOT = 'data-gb-root';
/** Marker stamped on the sidebar column (frame's first child). */
export const GB_SIDEBAR_COL = 'data-gb-sidebar-col';
/** Marker stamped on the real sidebar root (past the slot's contents wrapper). */
export const GB_SIDEBAR_ROOT = 'data-gb-sidebar-root';
/** Marker stamped on the sidebar workspace tree body (fade host). */
export const GB_SIDEBAR_SCROLLPORT = 'data-gb-sidebar-scrollport';
/** Marker stamped on the sidebar workspace list (the real scroller). */
export const GB_SIDEBAR_LIST = 'data-gb-sidebar-list';
/** Marker stamped on the conversation view area (the chat scroll viewport). */
export const GB_CHAT_VIEWPORT = 'data-gb-chat-viewport';
/** Marker stamped on the session header (past the slot's contents wrapper). */
export const GB_HEADER = 'data-gb-header';
/** Presence flag: the scroller can still move toward the top edge. */
export const GB_TOP = 'data-gb-top';
/** Presence flag: the scroller can still move toward the bottom edge. */
export const GB_BOTTOM = 'data-gb-bottom';
/** Body-level pure-color overlay melting from the browser's top edge down. */
export const GB_FADE_TOP = 'data-gb-fade-top';
/** Body-level pure-color overlay melting from the browser's bottom edge up. */
export const GB_FADE_BOTTOM = 'data-gb-fade-bottom';
/** Body-level progressive-blur overlays for the sidebar tree edges. */
export const GB_FADE_SIDEBAR_TOP = 'data-gb-fade-sidebar-top';
export const GB_FADE_SIDEBAR_BOTTOM = 'data-gb-fade-sidebar-bottom';
/** CSS variable (on the conversation root) holding the scroller's reserved
    top band: the floating header card's bottom edge plus breathing room. */
export const GB_HEADER_BOTTOM_VAR = '--dsh-gb-header-bottom';
/** Every marker the enhancer may stamp (and must retract on dispose). */
const GB_MARKERS = [GB_ROOT, GB_SIDEBAR_COL, GB_SIDEBAR_ROOT, GB_SIDEBAR_SCROLLPORT, GB_SIDEBAR_LIST, GB_CHAT_VIEWPORT, GB_HEADER];
/**
 * Pure-color edge fades — no blur at all (backdrop-filter dropped after the
 * subpixel-fringing artifacts could not be cleaned up). Each edge is one
 * plain div with a solid-to-transparent background gradient in the
 * user-specified direction, anchored on the BROWSER edges (not the floating
 * bars, which ride above the fades):
 * - Top bar: solid at the very top browser edge, dissolving over the
 *   floating card's band.
 * - Bottom bar: solid at the very bottom browser edge, clear above the
 *   composer card.
 */
const FADE_HEIGHT = 64;
const SIDEBAR_FADE_HEIGHT = 40;
/** Right gutter the sidebar fade leaves for the scrollbar (matches the
    workspace's --dsh-session-list-edge-inset). */
const SIDEBAR_FADE_GUTTER = 12;
/** Stable framework hooks the enhancer anchors on. */
const HOOK_OVERLAY = '[data-shell-overlay]';
const HOOK_SCROLL_BODY = '[data-conversation-scroll]';
/**
 * The slot system mounts every entry through a `display: contents` wrapper
 * (layout-neutral, but present in the DOM). Walk through such single-child
 * wrappers to the real box the stylesheet needs to touch.
 */
function skipContentsWrappers(el) {
    let current = el ?? null;
    while (current instanceof HTMLElement
        && current.children.length === 1
        && getComputedStyle(current).display === 'contents') {
        current = current.firstElementChild;
    }
    return current;
}
/** Collect every anchor from the live DOM without touching it. */
function findAnchors() {
    const overlay = document.querySelector(HOOK_OVERLAY);
    const frame = overlay?.parentElement instanceof HTMLElement ? overlay.parentElement : null;
    const sidebarCol = frame?.firstElementChild instanceof HTMLElement ? frame.firstElementChild : null;
    const sidebarRootEl = skipContentsWrappers(sidebarCol?.firstElementChild);
    const sidebarRoot = sidebarRootEl instanceof HTMLElement ? sidebarRootEl : null;
    const sidebarList = sidebarCol?.querySelector('[role="tree"]') ?? null;
    const sidebarScrollport = sidebarList?.parentElement instanceof HTMLElement ? sidebarList.parentElement : null;
    const scrollBody = document.querySelector(HOOK_SCROLL_BODY);
    const rootCandidate = scrollBody?.parentElement;
    const root = rootCandidate instanceof HTMLElement
        && skipContentsWrappers(rootCandidate.firstElementChild)?.tagName === 'HEADER'
        ? rootCandidate
        : document.querySelector('div[data-phase]');
    const headerEl = skipContentsWrappers(root?.firstElementChild);
    const header = headerEl?.tagName === 'HEADER' ? headerEl : null;
    const viewportEl = skipContentsWrappers(scrollBody?.firstElementChild);
    const viewport = viewportEl instanceof HTMLElement ? viewportEl : null;
    return { frame, sidebarCol, sidebarRoot, sidebarScrollport, sidebarList, root, header, scrollBody, viewport };
}
/** Side-effect-free scroll-state projection: which edge fades should show. */
export function scrollState(scrollEl) {
    const { scrollTop, clientHeight, scrollHeight } = scrollEl;
    return {
        top: scrollTop > 4,
        bottom: scrollTop + clientHeight < scrollHeight - 4,
    };
}
/** Stamp one marker (idempotent) and remember it for disposal. */
function mark(el, attr, tracked) {
    if (!el.hasAttribute(attr))
        el.setAttribute(attr, '');
    tracked.add(el);
}
/** Project a scroller's state onto its fade host's presence flags. */
function syncScroll(scrollEl, hostEl) {
    if (scrollEl === null || hostEl === null)
        return;
    const { top, bottom } = scrollState(scrollEl);
    if (top)
        hostEl.setAttribute(GB_TOP, '');
    else
        hostEl.removeAttribute(GB_TOP);
    if (bottom)
        hostEl.setAttribute(GB_BOTTOM, '');
    else
        hostEl.removeAttribute(GB_BOTTOM);
}
/**
 * The built-in workspace fade (a 24px gradient strip, absolute at the bottom
 * of the tree body) is superseded by the plugin's blurred fades; hide it so
 * the bottom edge is not double-faded. Only an empty absolutely-positioned
 * last child qualifies — the real fade is exactly that.
 */
function hideBuiltinFade(scrollport, restore) {
    const last = scrollport.lastElementChild;
    if (!(last instanceof HTMLElement))
        return;
    if (last.children.length > 0)
        return;
    if (getComputedStyle(last).position !== 'absolute')
        return;
    if (last.style.display !== 'none') {
        last.style.display = 'none';
        restore.add(last);
    }
}
/**
 * Measure the session header and publish the scroller's top inset on the
 * root: the floating card sits 8px below the window edge, so the reserved
 * band spans the card's bottom edge plus its 8px breathing room (this keeps
 * the first message below the card at rest; scrolled content rises through
 * the band to the browser's top edge).
 */
function publishHeaderVar(header, root) {
    root.style.setProperty(GB_HEADER_BOTTOM_VAR, `${header.getBoundingClientRect().bottom + 8}px`);
}
/**
 * Body-level fixed overlay: one plain div per edge, styled entirely by the
 * stylesheet (pure-color gradient, no blur). Body children are never touched
 * by React, so the overlay survives every remount; the pass re-positions it
 * against the live anchors.
 */
function ensureFadeOverlay(attr, ownedNodes) {
    const existing = document.querySelector(`[${attr}]`);
    if (existing !== null)
        return existing;
    const overlay = document.createElement('div');
    overlay.setAttribute(attr, '');
    overlay.style.opacity = '0';
    document.body.appendChild(overlay);
    ownedNodes.add(overlay);
    return overlay;
}
/** Pin one fade overlay over a live anchor box (fixed, viewport-space). */
function positionFade(fade, box) {
    fade.style.left = `${box.left}px`;
    fade.style.top = `${box.top}px`;
    fade.style.width = `${box.width}px`;
    fade.style.height = `${box.height}px`;
}
/**
 * Mount the enhancer: one idempotent markup pass over the live DOM plus the
 * observers/listeners that keep it current. Returns the disposer.
 * @returns a disposer that retracts every marker and observer.
 */
export function enhance() {
    const tracked = new Set();
    const restoredFades = new Set();
    const ownedNodes = new Set();
    const observedHeaders = new WeakSet();
    let pending = 0;
    let headerObserver = null;
    /** One full pass: locate, mark, publish, sync. Cheap; safe to re-run. */
    const pass = () => {
        const anchors = findAnchors();
        if (anchors.root !== null)
            mark(anchors.root, GB_ROOT, tracked);
        if (anchors.sidebarCol !== null)
            mark(anchors.sidebarCol, GB_SIDEBAR_COL, tracked);
        if (anchors.sidebarRoot !== null)
            mark(anchors.sidebarRoot, GB_SIDEBAR_ROOT, tracked);
        if (anchors.sidebarScrollport !== null)
            mark(anchors.sidebarScrollport, GB_SIDEBAR_SCROLLPORT, tracked);
        if (anchors.sidebarList !== null)
            mark(anchors.sidebarList, GB_SIDEBAR_LIST, tracked);
        if (anchors.viewport !== null)
            mark(anchors.viewport, GB_CHAT_VIEWPORT, tracked);
        if (anchors.header !== null) {
            mark(anchors.header, GB_HEADER, tracked);
            if (anchors.root !== null)
                publishHeaderVar(anchors.header, anchors.root);
            if (typeof ResizeObserver !== 'undefined' && !observedHeaders.has(anchors.header)) {
                observedHeaders.add(anchors.header);
                headerObserver ??= new ResizeObserver(schedule);
                headerObserver.observe(anchors.header);
            }
        }
        if (anchors.sidebarScrollport !== null)
            hideBuiltinFade(anchors.sidebarScrollport, restoredFades);
        syncScroll(anchors.sidebarList, anchors.sidebarScrollport);
        syncScroll(anchors.scrollBody, anchors.root);
        // Pure-color edge fades (no blur), user-specified directions:
        // - Top fade: solid at the very TOP browser edge, dissolving over the
        //   floating card's band — text under the frosted card melts toward the
        //   edge and disappears exactly there, with nothing dark under the card.
        //   The card floats above the fade (z 6 > 5).
        // - Bottom fade: the solid end hugs the very BOTTOM browser edge; the
        //   ramp dissolves upward, starting FADE_HEIGHT above the composer
        //   card. The seat floats above the fade (z 7 > 5).
        // - Sidebar fades: the same two directions, gated by the tree's scroll.
        const topFade = ensureFadeOverlay(GB_FADE_TOP, ownedNodes);
        const bottomFade = ensureFadeOverlay(GB_FADE_BOTTOM, ownedNodes);
        const sidebarTopFade = ensureFadeOverlay(GB_FADE_SIDEBAR_TOP, ownedNodes);
        const sidebarBottomFade = ensureFadeOverlay(GB_FADE_SIDEBAR_BOTTOM, ownedNodes);
        if (anchors.scrollBody !== null) {
            const rect = anchors.scrollBody.getBoundingClientRect();
            const state = scrollState(anchors.scrollBody);
            if (anchors.header !== null) {
                // Solid at the browser's top edge, dissolving over the floating
                // card's band: text melts toward the edge and disappears exactly
                // there, and nothing is painted under the card itself.
                const headerRect = anchors.header.getBoundingClientRect();
                positionFade(topFade, { left: rect.left, top: 0, width: rect.width, height: Math.max(0, headerRect.bottom) });
                topFade.style.opacity = state.top ? '1' : '0';
            }
            const card = document.querySelector('[data-composer-card]');
            const seat = document.querySelector('[data-composer-seat]');
            if (card !== null && seat !== null) {
                const cardRect = card.getBoundingClientRect();
                const seatRect = seat.getBoundingClientRect();
                // From FADE_HEIGHT above the card down to the browser's bottom
                // edge: transparent at the top, solid at the very bottom.
                const top = cardRect.top - FADE_HEIGHT;
                positionFade(bottomFade, { left: seatRect.left, top, width: seatRect.width, height: window.innerHeight - top });
                bottomFade.style.opacity = state.bottom ? '1' : '0';
            }
        }
        if (anchors.sidebarScrollport !== null) {
            const rect = anchors.sidebarScrollport.getBoundingClientRect();
            const width = Math.max(0, rect.width - SIDEBAR_FADE_GUTTER);
            positionFade(sidebarTopFade, { left: rect.left, top: rect.top, width, height: SIDEBAR_FADE_HEIGHT });
            positionFade(sidebarBottomFade, { left: rect.left, top: rect.bottom - SIDEBAR_FADE_HEIGHT, width, height: SIDEBAR_FADE_HEIGHT });
            const state = anchors.sidebarList !== null ? scrollState(anchors.sidebarList) : { top: false, bottom: false };
            sidebarTopFade.style.opacity = state.top ? '1' : '0';
            sidebarBottomFade.style.opacity = state.bottom ? '1' : '0';
        }
    };
    /** Debounced pass shared by mutation, scroll, and resize signals. */
    const schedule = () => {
        if (pending !== 0)
            return;
        pending = typeof requestAnimationFrame === 'function'
            ? requestAnimationFrame(() => { pending = 0; pass(); })
            : window.setTimeout(() => { pending = 0; pass(); }, 0);
    };
    const observer = new MutationObserver(schedule);
    observer.observe(document.documentElement, { childList: true, subtree: true });
    window.addEventListener('scroll', schedule, { passive: true, capture: true });
    window.addEventListener('resize', schedule, { passive: true });
    pass();
    return () => {
        if (typeof cancelAnimationFrame === 'function' && pending !== 0)
            cancelAnimationFrame(pending);
        else if (pending !== 0)
            window.clearTimeout(pending);
        pending = 0;
        observer.disconnect();
        headerObserver?.disconnect();
        headerObserver = null;
        window.removeEventListener('scroll', schedule, { capture: true });
        window.removeEventListener('resize', schedule);
        for (const el of tracked) {
            for (const attr of GB_MARKERS)
                el.removeAttribute(attr);
            el.removeAttribute(GB_TOP);
            el.removeAttribute(GB_BOTTOM);
            el.style.removeProperty(GB_HEADER_BOTTOM_VAR);
        }
        for (const el of restoredFades)
            el.style.display = '';
        for (const el of ownedNodes)
            el.remove();
        tracked.clear();
        restoredFades.clear();
        ownedNodes.clear();
    };
}
//# sourceMappingURL=enhancer.js.map