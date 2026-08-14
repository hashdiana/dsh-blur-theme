/**
 * dsh-gaussian-blur node half: registers the durable settings namespace
 * (`dsh-gaussian-blur`) that carries the composer-card blur preference,
 * through the optional host `settings` service. The visual browser surface
 * ships via exports["./client"].
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