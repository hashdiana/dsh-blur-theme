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
import { CARD_BLUR_DEFAULT, CARD_BLUR_FIELD, CARD_BLUR_MAX, CARD_BLUR_MIN } from "../shared/settings.js";
/** localStorage key carrying the 0-100 preference. */
const STORAGE_KEY = 'dsh-gaussian-blur:cardBlur';
/** Read the stored value, clamped into bounds, defaulting when absent/corrupt. */
function readStored() {
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw === null)
            return CARD_BLUR_DEFAULT;
        const parsed = Number(raw);
        if (Number.isFinite(parsed)) {
            return Math.max(CARD_BLUR_MIN, Math.min(CARD_BLUR_MAX, Math.round(parsed)));
        }
    }
    catch {
        // Storage unavailable (private mode, blocked origin): use the default.
    }
    return CARD_BLUR_DEFAULT;
}
/** Create the browser-local blur-preference store. */
export function createBlurStore() {
    let value = readStored();
    const listeners = new Set();
    const getSnapshot = () => ({ value: { [CARD_BLUR_FIELD]: value } });
    return {
        getSnapshot,
        subscribe(listener) {
            listeners.add(listener);
            return () => { listeners.delete(listener); };
        },
        set(next) {
            const clamped = Math.max(CARD_BLUR_MIN, Math.min(CARD_BLUR_MAX, Math.round(next)));
            if (clamped === value)
                return;
            value = clamped;
            try {
                window.localStorage.setItem(STORAGE_KEY, String(clamped));
            }
            catch {
                // Storage unavailable: keep the in-memory value for this session.
            }
            for (const listener of listeners)
                listener();
        },
    };
}
//# sourceMappingURL=blurStore.js.map