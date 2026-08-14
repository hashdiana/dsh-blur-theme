/**
 * Shared (type-free) settings contract for the Gaussian blur preference,
 * imported by both the host half (namespace registration) and the browser
 * half (scope binding + row UI). No runtime imports: it must stay safe to
 * inline into the client bundle.
 * @module dsh-gaussian-blur/shared/settings
 */

/** Settings namespace owned by this plugin (host registration + client scope). */
export const SETTINGS_NAMESPACE = 'dsh-gaussian-blur'

/** Field carrying the composer-card Gaussian blur strength (0-100). */
export const CARD_BLUR_FIELD = 'cardBlur'

/** Slider bounds. */
export const CARD_BLUR_MIN = 0
export const CARD_BLUR_MAX = 100

/** Default slider value: 60 maps to 18px — a visible but calm frosting. */
export const CARD_BLUR_DEFAULT = 60

/** Strongest radius the slider reaches (100 = 30px). */
export const CARD_BLUR_MAX_PX = 30

/** Map the 0-100 slider onto a blur radius in px. */
export function blurPx(value: number): number {
  const clamped = Math.max(CARD_BLUR_MIN, Math.min(CARD_BLUR_MAX, value))
  return Math.round((clamped / CARD_BLUR_MAX) * CARD_BLUR_MAX_PX * 10) / 10
}

/** Decoded value shape of the durable settings section. */
export interface CardBlurSettings {
  [CARD_BLUR_FIELD]: number
}
