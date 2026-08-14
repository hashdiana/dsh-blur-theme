/**
 * `gaussianBlur` locale namespace: the settings row copy.
 * @module dsh-gaussian-blur/client/locales
 */

/** Dictionary namespace owned by this plugin (settings row copy). */
export const NS = 'gaussianBlur'

/** Simplified Chinese dictionary (the key-set source of truth). */
export const zh = {
  'blur.title': '悬浮卡片高斯模糊',
  'blur.description': '控制顶部会话栏与输入卡片的毛玻璃模糊强度（0-100，实时预览）',
}

/** English dictionary, checked complete against the zh key set. */
export const en = {
  'blur.title': 'Floating card Gaussian blur',
  'blur.description': 'How strongly the top session bar and the composer card frost their backdrop (0-100, live preview)',
}

/** The gaussianBlur namespace key union. */
export type GaussianBlurKey = keyof typeof zh

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    /** This plugin's settings-row copy. */
    gaussianBlur: GaussianBlurKey
  }
}
