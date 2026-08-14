/**
 * dsh-gaussian-blur plugin, browser half: a DOM enhancer that anchors the
 * shipped Web UI through its stable data-* hooks (`data-shell-overlay`,
 * `data-conversation-scroll`, `data-composer-seat`, `data-composer-card`,
 * `div[data-phase]`) and applies the plugin's own `data-gb-*` markers, so the
 * stylesheet never couples to hashed CSS-module classes or fragile DOM
 * order. Everything is idempotent, re-runs when React replaces nodes, and
 * unwinds completely on fiber dispose (HMR-safe).
 *
 * The General-settings row for the composer-card blur strength mounts on an
 * optional `settingsScope` fiber: without the settings surface the visual
 * enhancer still activates and the CSS fallback radius applies.
 * @module dsh-gaussian-blur/client
 */
import { enhance } from "./enhancer.js";
import { NS, en, zh } from "./locales.js";
import { BlurStrengthRow } from "./blurRow.js";
import { CARD_BLUR_DEFAULT, CARD_BLUR_FIELD, SETTINGS_NAMESPACE, blurPx, } from "../shared/settings.js";
/** Services the always-on surface needs: the slot registry and the copy. */
export const inject = ['locale', 'slots'];
/**
 * Client plugin body: mount the DOM enhancer, then — when the settings
 * surface exists — project the durable blur preference onto the
 * `--dsh-gb-card-blur` variable and register the General-settings row.
 * @param ctx - client root context.
 */
export function apply(ctx) {
    ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'dsh-gaussian-blur: dictionaries');
    ctx.effect(() => enhance(), 'dsh-gaussian-blur: dom enhancer');
    ctx.inject(['settingsScope'], (settingsCtx) => {
        const scope = settingsCtx.settingsScope.bind({ namespace: SETTINGS_NAMESPACE });
        settingsCtx.effect(() => {
            const applyBlur = () => {
                const value = scope.getSnapshot().value?.[CARD_BLUR_FIELD];
                const radius = blurPx(typeof value === 'number' ? value : CARD_BLUR_DEFAULT);
                document.documentElement.style.setProperty('--dsh-gb-card-blur', `${radius}px`);
            };
            applyBlur();
            const unsubscribe = scope.subscribe(applyBlur);
            return () => {
                unsubscribe();
                document.documentElement.style.removeProperty('--dsh-gb-card-blur');
            };
        }, 'dsh-gaussian-blur: card blur preference');
        // The General section declares the item slot at runtime; register once
        // declared (the disposer withdraws the row with the fiber). The settings
        // item contract owns its own copy, so `t` rides the inject face.
        settingsCtx.slots.inject('settings.general.item', () => settingsCtx.slots.register({
            name: 'settings.general.item',
            id: 'gaussian-blur-card',
            order: 30,
            inject: () => ({
                hooks: { cardBlur: scope },
                setCardBlur: (value) => {
                    // Live preview first (host acceptance is a round-trip; remote
                    // browsers never persist), then the durable write.
                    document.documentElement.style.setProperty('--dsh-gb-card-blur', `${blurPx(value)}px`);
                    void scope.set(CARD_BLUR_FIELD, value);
                },
                t: ctx.locale.bind(NS),
            }),
        }, BlurStrengthRow));
    });
}
//# sourceMappingURL=index.js.map