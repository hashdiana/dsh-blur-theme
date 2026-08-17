/**
 * Browser-local durable store for the card-blur preference.
 *
 * Why not the framework settings scope: the web API proxy
 * (`@deepseek-ai/dsh-host-apiproxy`) only serves settings namespaces on its
 * hard-coded allowlists (model providers plus a few product namespaces); a
 * third-party namespace answers `settings-not-exposed` on every read and
 * write even after `settings.register()`. Exposing third-party namespaces is
 * explicitly deferred work in the framework, so the slider persists through
 * localStorage — the same per-browser durability a visual theme preference
 * needs — and the host half keeps its namespace registration for the day the
 * seam opens.
 *
 * The store's surface (getSnapshot/subscribe/set) mirrors the settings scope
 * shape, so the settings row's injected selector hook consumes it unchanged.
 * @module dsh-gaussian-blur/client/blurStore
 */
import { type CardBlurSettings } from '../shared/settings.ts';
/** Snapshot selected by the settings row's injected hook. */
export interface BlurStoreSnapshot {
    value: CardBlurSettings;
}
/** Minimal external store contract consumed by the row (and the plugin). */
export interface BlurStore {
    /** @returns the current snapshot (stable reference until the next change). */
    getSnapshot(): BlurStoreSnapshot;
    /** Subscribe to snapshot changes. @returns the disposer. */
    subscribe(listener: () => void): () => void;
    /** Commit a new 0-100 value: clamp, persist, notify. */
    set(value: number): void;
}
/** Create the browser-local blur-preference store. */
export declare function createBlurStore(): BlurStore;
//# sourceMappingURL=blurStore.d.ts.map