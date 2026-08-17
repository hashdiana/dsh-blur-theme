/**
 * dsh-gaussian-blur node half: registers the `dsh-gaussian-blur` settings
 * namespace schema (the card-blur preference). The browser half persists the
 * preference locally today — the web API proxy only serves allow-listed
 * settings namespaces, so this registration is forward-compatible: it lights
 * up as soon as the framework exposes third-party namespaces to configuration
 * clients. The visual browser surface ships via exports["./client"].
 * @module dsh-gaussian-blur
 */
import type { Context } from '@deepseek-ai/cordis';
/**
 * Host plugin body: register the settings section when a settings provider
 * exists (optional-service lazy mount — never blocks boot without one).
 * @param ctx - host root context.
 */
export declare function apply(ctx: Context): void;
//# sourceMappingURL=index.d.ts.map