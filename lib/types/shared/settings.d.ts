/**
 * Shared (type-free) settings contract for the Gaussian blur preference,
 * imported by both the host half (namespace registration) and the browser
 * half (scope binding + row UI). No runtime imports: it must stay safe to
 * inline into the client bundle.
 * @module dsh-gaussian-blur/shared/settings
 */
/** Settings namespace owned by this plugin (host registration + client scope). */
export declare const SETTINGS_NAMESPACE = "dsh-gaussian-blur";
/** Field carrying the composer-card Gaussian blur strength (0-100). */
export declare const CARD_BLUR_FIELD = "cardBlur";
/** Slider bounds. */
export declare const CARD_BLUR_MIN = 0;
export declare const CARD_BLUR_MAX = 100;
/** Default slider value: 60 maps to 18px — a visible but calm frosting. */
export declare const CARD_BLUR_DEFAULT = 60;
/** Strongest radius the slider reaches (100 = 30px). */
export declare const CARD_BLUR_MAX_PX = 30;
/** Map the 0-100 slider onto a blur radius in px. */
export declare function blurPx(value: number): number;
/** Decoded value shape of the durable settings section. */
export interface CardBlurSettings {
    [CARD_BLUR_FIELD]: number;
}
//# sourceMappingURL=settings.d.ts.map