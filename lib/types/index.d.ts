/**
 * dsh-gaussian-blur node half: registers the durable settings namespace
 * (`dsh-gaussian-blur`) that carries the composer-card blur preference,
 * through the optional host `settings` service. The visual browser surface
 * ships via exports["./client"].
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