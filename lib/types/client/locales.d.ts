/**
 * `gaussianBlur` locale namespace: the settings row copy.
 * @module dsh-gaussian-blur/client/locales
 */
/** Dictionary namespace owned by this plugin (settings row copy). */
export declare const NS = "gaussianBlur";
/** Simplified Chinese dictionary (the key-set source of truth). */
export declare const zh: {
    'blur.title': string;
    'blur.description': string;
};
/** English dictionary, checked complete against the zh key set. */
export declare const en: {
    'blur.title': string;
    'blur.description': string;
};
/** The gaussianBlur namespace key union. */
export type GaussianBlurKey = keyof typeof zh;
declare module '@deepseek-ai/dsh-client-ui-slots' {
    interface LocaleNamespaceMap {
        /** This plugin's settings-row copy. */
        gaussianBlur: GaussianBlurKey;
    }
}
//# sourceMappingURL=locales.d.ts.map