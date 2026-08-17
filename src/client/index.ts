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

import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
// Type-only: pulls the locale Context merge (ctx.locale).
import type {} from '@deepseek-ai/dsh-client-locale/client'
// Type-only: pulls the settings slot-map merge (settings.general.item).
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import { enhance } from './enhancer.ts'
import { NS, en, zh } from './locales.ts'
import { BlurStrengthRow } from './blurRow.tsx'
import { createBlurStore } from './blurStore.ts'
import { CARD_BLUR_FIELD, blurPx } from '../shared/settings.ts'

/** Services the always-on surface needs: the slot registry and the copy. */
export const inject = ['locale', 'slots']

/**
 * Client plugin body: mount the DOM enhancer, project the durable blur
 * preference onto the `--dsh-gb-card-blur` variable, and register the
 * General-settings row.
 * @param ctx - client root context.
 */
export function apply(ctx: ClientContext): void {
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'dsh-gaussian-blur: dictionaries')
  ctx.effect(() => enhance(), 'dsh-gaussian-blur: dom enhancer')

  const store = createBlurStore()

  // Project the stored preference onto the CSS variable, live.
  ctx.effect(() => {
    const applyBlur = () => {
      const value = store.getSnapshot().value[CARD_BLUR_FIELD]
      document.documentElement.style.setProperty('--dsh-gb-card-blur', `${blurPx(value)}px`)
    }
    applyBlur()
    const unsubscribe = store.subscribe(applyBlur)
    return () => {
      unsubscribe()
      document.documentElement.style.removeProperty('--dsh-gb-card-blur')
    }
  }, 'dsh-gaussian-blur: card blur preference')

  // The General section declares the item slot at runtime; register once
  // declared (the disposer withdraws the row with the fiber). The settings
  // item contract owns its own copy, so `t` rides the inject face.
  const t = ctx.locale.bind(NS)
  ctx.slots.inject('settings.general.item', () =>
    ctx.slots.register({
      name: 'settings.general.item',
      id: 'gaussian-blur-card',
      order: 30,
      inject: () => ({
        hooks: { cardBlur: store },
        setCardBlur: (value: number) => {
          store.set(value)
        },
        t,
      }),
    }, BlurStrengthRow),
  )
}
