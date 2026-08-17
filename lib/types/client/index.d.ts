/**
 * dsh-gaussian-blur plugin, browser half: a DOM enhancer that anchors the
 * shipped Web UI through its stable data-* hooks (`data-shell-overlay`,
 * `data-conversation-scroll`, `data-composer-seat`, `data-composer-card`,
 * `div[data-phase]`) and applies the plugin's own `data-gb-*` markers, so the
 * stylesheet never couples to hashed CSS-module classes or fragile DOM
 * order. Everything is idempotent, re-runs when React replaces nodes, and
 * unwinds completely on fiber dispose (HMR-safe).
 *
 * The General-settings row for the card blur strength registers on the
 * `settings.general.item` slot and persists the preference through a
 * browser-local store (see ./blurStore.ts for why the settings wire is not
 * used) while the CSS fallback radius applies whenever the row is absent.
 * @module dsh-gaussian-blur/client
 */
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client';
/** Services the always-on surface needs: the slot registry and the copy. */
export declare const inject: string[];
/**
 * Client plugin body: mount the DOM enhancer, project the durable blur
 * preference onto the `--dsh-gb-card-blur` variable, and register the
 * General-settings row.
 * @param ctx - client root context.
 */
export declare function apply(ctx: ClientContext): void;
//# sourceMappingURL=index.d.ts.map