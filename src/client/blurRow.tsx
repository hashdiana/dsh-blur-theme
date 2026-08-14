/**
 * The General-settings row for the composer-card Gaussian blur strength:
 * title + description on the left, a 0-100 slider with the resolved radius
 * on the right. The row owns its data and copy through the injected snapshot
 * hook, setter, and bound translate — the settings item contract passes no
 * owner props.
 * @module dsh-gaussian-blur/client/BlurStrengthRow
 */

import type { SnapshotSelectorHook, TranslateNS } from '@deepseek-ai/dsh-client-ui-slots'
import {
  CARD_BLUR_DEFAULT,
  CARD_BLUR_FIELD,
  CARD_BLUR_MAX,
  CARD_BLUR_MIN,
  blurPx,
  type CardBlurSettings,
} from '../shared/settings.ts'
import { NS } from './locales.ts'
import css from './blurRow.module.css'

/** Snapshot surface the injected hook selects from (the settings section). */
export interface BlurScopeSnapshot {
  value: CardBlurSettings | undefined
}

/** Component props: framework inject face (hook, setter, bound copy). */
export interface BlurStrengthRowProps {
  /** Snapshot selector hook over the plugin's settings section. */
  useCardBlur: SnapshotSelectorHook<BlurScopeSnapshot>
  /** Write path for the selected strength. */
  setCardBlur: (value: number) => void
  /** Namespace-bound translate for the `gaussianBlur` dictionary. */
  t: TranslateNS<typeof NS>
}

/**
 * Render the blur-strength slider row.
 * @param props - framework props (see {@link BlurStrengthRowProps}).
 * @returns the General-section row.
 */
export function BlurStrengthRow({ useCardBlur, setCardBlur, t }: BlurStrengthRowProps) {
  const value = useCardBlur((snapshot) => snapshot.value?.[CARD_BLUR_FIELD] ?? CARD_BLUR_DEFAULT)

  return (
    <div className={css.row}>
      <div className={css.rowText}>
        <div className={css.title}>{t('blur.title')}</div>
        <div className={css.desc}>{t('blur.description')}</div>
      </div>
      <div className={css.sliderWrap}>
        <input
          type="range"
          className={css.slider}
          min={CARD_BLUR_MIN}
          max={CARD_BLUR_MAX}
          step={1}
          value={value}
          aria-label={t('blur.title')}
          onChange={(event) => {
            const next = Number(event.currentTarget.value)
            if (Number.isFinite(next)) setCardBlur(next)
          }}
        />
        <span className={css.sliderValue}>{blurPx(value)}px</span>
      </div>
    </div>
  )
}
