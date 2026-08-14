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
export declare const GB_ROOT = "data-gb-root";
/** Marker stamped on the sidebar column (frame's first child). */
export declare const GB_SIDEBAR_COL = "data-gb-sidebar-col";
/** Marker stamped on the real sidebar root (past the slot's contents wrapper). */
export declare const GB_SIDEBAR_ROOT = "data-gb-sidebar-root";
/** Marker stamped on the sidebar workspace tree body (fade host). */
export declare const GB_SIDEBAR_SCROLLPORT = "data-gb-sidebar-scrollport";
/** Marker stamped on the sidebar workspace list (the real scroller). */
export declare const GB_SIDEBAR_LIST = "data-gb-sidebar-list";
/** Marker stamped on the conversation view area (the chat scroll viewport). */
export declare const GB_CHAT_VIEWPORT = "data-gb-chat-viewport";
/** Marker stamped on the session header (past the slot's contents wrapper). */
export declare const GB_HEADER = "data-gb-header";
/** Presence flag: the scroller can still move toward the top edge. */
export declare const GB_TOP = "data-gb-top";
/** Presence flag: the scroller can still move toward the bottom edge. */
export declare const GB_BOTTOM = "data-gb-bottom";
/** Body-level pure-color overlay melting from the browser's top edge down. */
export declare const GB_FADE_TOP = "data-gb-fade-top";
/** Body-level pure-color overlay melting from the browser's bottom edge up. */
export declare const GB_FADE_BOTTOM = "data-gb-fade-bottom";
/** Body-level progressive-blur overlays for the sidebar tree edges. */
export declare const GB_FADE_SIDEBAR_TOP = "data-gb-fade-sidebar-top";
export declare const GB_FADE_SIDEBAR_BOTTOM = "data-gb-fade-sidebar-bottom";
/** CSS variable (on the conversation root) holding the scroller's reserved
    top band: the floating header card's bottom edge plus breathing room. */
export declare const GB_HEADER_BOTTOM_VAR = "--dsh-gb-header-bottom";
/** Side-effect-free scroll-state projection: which edge fades should show. */
export declare function scrollState(scrollEl: HTMLElement): {
    top: boolean;
    bottom: boolean;
};
/**
 * Mount the enhancer: one idempotent markup pass over the live DOM plus the
 * observers/listeners that keep it current. Returns the disposer.
 * @returns a disposer that retracts every marker and observer.
 */
export declare function enhance(): () => void;
//# sourceMappingURL=enhancer.d.ts.map