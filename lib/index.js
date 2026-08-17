import { settingsNamespace } from "@deepseek-ai/dsh-settings";
import z from "@deepseek-ai/schemastery";
//#region lib/types/shared/settings.js
/**
* Shared (type-free) settings contract for the Gaussian blur preference,
* imported by both the host half (namespace registration) and the browser
* half (scope binding + row UI). No runtime imports: it must stay safe to
* inline into the client bundle.
* @module dsh-gaussian-blur/shared/settings
*/
/** Settings namespace owned by this plugin (host registration + client scope). */
const SETTINGS_NAMESPACE = "dsh-gaussian-blur";
//#endregion
//#region lib/types/index.js
/**
* dsh-gaussian-blur node half: registers the `dsh-gaussian-blur` settings
* namespace schema (the card-blur preference). The browser half persists the
* preference locally today — the web API proxy only serves allow-listed
* settings namespaces, so this registration is forward-compatible: it lights
* up as soon as the framework exposes third-party namespaces to configuration
* clients. The visual browser surface ships via exports["./client"].
* @module dsh-gaussian-blur
*/
/** Durable schema; also the wire envelope the browser scope validates against. */
const SettingsSchema = z.object({ ["cardBlur"]: z.number().min(0).max(100).default(60) });
/**
* Host plugin body: register the settings section when a settings provider
* exists (optional-service lazy mount — never blocks boot without one).
* @param ctx - host root context.
*/
function apply(ctx) {
	ctx.inject(["settings"], (settingsCtx) => {
		settingsCtx.settings.register(settingsNamespace(SETTINGS_NAMESPACE), SettingsSchema);
	});
}
//#endregion
export { apply };
