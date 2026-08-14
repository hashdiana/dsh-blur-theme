import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { CARD_BLUR_DEFAULT, CARD_BLUR_FIELD, CARD_BLUR_MAX, CARD_BLUR_MIN, blurPx, } from "../shared/settings.js";
import css from './blurRow.module.css';
/**
 * Render the blur-strength slider row.
 * @param props - framework props (see {@link BlurStrengthRowProps}).
 * @returns the General-section row.
 */
export function BlurStrengthRow({ useCardBlur, setCardBlur, t }) {
    const value = useCardBlur((snapshot) => snapshot.value?.[CARD_BLUR_FIELD] ?? CARD_BLUR_DEFAULT);
    return (_jsxs("div", { className: css.row, children: [_jsxs("div", { className: css.rowText, children: [_jsx("div", { className: css.title, children: t('blur.title') }), _jsx("div", { className: css.desc, children: t('blur.description') })] }), _jsxs("div", { className: css.sliderWrap, children: [_jsx("input", { type: "range", className: css.slider, min: CARD_BLUR_MIN, max: CARD_BLUR_MAX, step: 1, value: value, "aria-label": t('blur.title'), onChange: (event) => {
                            const next = Number(event.currentTarget.value);
                            if (Number.isFinite(next))
                                setCardBlur(next);
                        } }), _jsxs("span", { className: css.sliderValue, children: [blurPx(value), "px"] })] })] }));
}
//# sourceMappingURL=blurRow.js.map