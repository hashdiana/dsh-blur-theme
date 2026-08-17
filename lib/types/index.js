/**
 * dsh-gaussian-blur node half: registers the `dsh-gaussian-blur` settings
 * namespace schema (the card-blur preference). The browser half persists the
 * preference locally today — the web API proxy only serves allow-listed
 * settings namespaces, so this registration is forward-compatible: it lights
 * up as soon as the framework exposes third-party namespaces to configuration
 * clients. The visual browser surface ships via exports["./client"].
 * @module dsh-gaussian-blur
 */
import { settingsNamespace } from '@deepseek-ai/dsh-settings';
import z from '@deepseek-ai/schemastery';
import { CARD_BLUR_DEFAULT, CARD_BLUR_FIELD, CARD_BLUR_MAX, CARD_BLUR_MIN, SETTINGS_NAMESPACE } from "./shared/settings.js";
/** Durable schema; also the wire envelope the browser scope validates against. */
const SettingsSchema = z.object({
    [CARD_BLUR_FIELD]: z.number().min(CARD_BLUR_MIN).max(CARD_BLUR_MAX).default(CARD_BLUR_DEFAULT),
});
/**
 * Host plugin body: register the settings section when a settings provider
 * exists (optional-service lazy mount — never blocks boot without one).
 * @param ctx - host root context.
 */
export function apply(ctx) {
    ctx.inject(['settings'], (settingsCtx) => {
        settingsCtx.settings.register(settingsNamespace(SETTINGS_NAMESPACE), SettingsSchema);
    });
}
//# sourceMappingURL=index.js.map