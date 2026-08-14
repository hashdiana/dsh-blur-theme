/**
 * The General-settings row for the composer-card Gaussian blur strength:
 * title + description on the left, a 0-100 slider with the resolved radius
 * on the right. The row owns its data and copy through the injected snapshot
 * hook, setter, and bound translate — the settings item contract passes no
 * owner props.
 * @module dsh-gaussian-blur/client/BlurStrengthRow
 */
import type { SnapshotSelectorHook, TranslateNS } from '@deepseek-ai/dsh-client-ui-slots';
import { type CardBlurSettings } from '../shared/settings.ts';
import { NS } from './locales.ts';
/** Snapshot surface the injected hook selects from (the settings section). */
export interface BlurScopeSnapshot {
    value: CardBlurSettings | undefined;
}
/** Component props: framework inject face (hook, setter, bound copy). */
export interface BlurStrengthRowProps {
    /** Snapshot selector hook over the plugin's settings section. */
    useCardBlur: SnapshotSelectorHook<BlurScopeSnapshot>;
    /** Write path for the selected strength. */
    setCardBlur: (value: number) => void;
    /** Namespace-bound translate for the `gaussianBlur` dictionary. */
    t: TranslateNS<typeof NS>;
}
/**
 * Render the blur-strength slider row.
 * @param props - framework props (see {@link BlurStrengthRowProps}).
 * @returns the General-section row.
 */
export declare function BlurStrengthRow({ useCardBlur, setCardBlur, t }: BlurStrengthRowProps): import("react").JSX.Element;
//# sourceMappingURL=blurRow.d.ts.map