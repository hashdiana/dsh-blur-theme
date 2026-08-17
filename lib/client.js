window.__ModuleLoader__.load({
	id: "dsh-gaussian-blur",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react_jsx_runtime = require("react/jsx-runtime");
		//#region \0dsh-css:E:\ds\dsh-gaussian-blur\src\client\enhancer.module.css.mjs
		const css$1 = "[data-gb-sidebar-col]{border:1px solid var(--dsw-alias-border-l2);box-shadow:var(--dsw-shadow-lv2);background:var(--dsw-alias-bg-base);border-radius:22px;margin:8px;overflow:hidden}[data-gb-sidebar-root]{background:var(--dsw-alias-bg-base)}div:has(>[data-shell-overlay]):not([data-sidebar-collapsed]) [data-gb-sidebar-root]{padding-top:0;width:auto!important}div:has(>[data-shell-overlay]):not([data-sidebar-collapsed]) [data-gb-sidebar-root]>:first-child{height:48px;margin-bottom:4px}div:has(>[data-shell-overlay])[data-sidebar-collapsed] [data-gb-sidebar-col]{border-left:none;border-right:none;border-radius:0 22px 22px 0;margin:8px 0}[data-gb-sidebar-scrollport],[data-gb-root]{position:relative}[data-gb-root] [data-conversation-scroll]{padding-top:var(--dsh-gb-header-bottom,0px)}[data-gb-header]{z-index:6;width:fit-content;max-width:calc(100% - 144px);box-shadow:var(--dsw-shadow-lv2);background:0 0;border-radius:22px;margin:0;position:absolute;top:8px;left:8px}[data-gb-header]:before{content:\"\";z-index:-1;border-radius:inherit;border:1px solid var(--dsw-alias-border-l2);background:color-mix(in srgb, var(--dsw-alias-bg-base) 78%, transparent);backdrop-filter:blur(var(--dsh-gb-card-blur,18px)) saturate(160%);position:absolute;inset:0}[data-gb-header]:after{display:none}[data-gb-header]>div:first-child>div:last-child{z-index:3;margin:0;position:fixed;top:8px;right:8px}[data-gb-header]>div:first-child>div:last-child button:first-child{background:var(--dsw-alias-bg-base);box-shadow:var(--dsw-shadow-lv2);border-radius:16px}[data-gb-fade-top],[data-gb-fade-bottom],[data-gb-fade-sidebar-top],[data-gb-fade-sidebar-bottom]{z-index:5;pointer-events:none;opacity:0;transition:opacity .18s var(--ds-ease-in-out);position:fixed;overflow:hidden}[data-gb-fade-top],[data-gb-fade-sidebar-top]{background:linear-gradient(to bottom, var(--dsw-alias-bg-base), transparent)}[data-gb-fade-bottom],[data-gb-fade-sidebar-bottom]{background:linear-gradient(to top, var(--dsw-alias-bg-base), transparent)}[data-composer-seat]{pointer-events:none;z-index:7}[data-gb-root][data-phase=active] [data-composer-seat]{background:linear-gradient(to top, var(--dsw-alias-bg-base) 0%, color-mix(in srgb, var(--dsw-alias-bg-base) 82%, transparent) 45%, color-mix(in srgb, var(--dsw-alias-bg-base) 12%, transparent) 100%)}[data-composer-seat]>*{pointer-events:auto}[data-composer-card]{backdrop-filter:blur(var(--dsh-gb-card-blur,18px)) saturate(160%);background:color-mix(in srgb, var(--dsw-specific-input-major) 84%, transparent);box-shadow:var(--dsw-shadow-lv2)}[data-gb-chat-viewport]{padding-bottom:24px}@media (prefers-reduced-motion:reduce){[data-gb-fade-top],[data-gb-fade-bottom],[data-gb-fade-sidebar-top],[data-gb-fade-sidebar-bottom]{transition:none}}";
		const tagId$1 = "dsh-gaussian-blur/enhancer.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$1) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "dsh-gaussian-blur";
			tag.dataset.pluginCss = tagId$1;
			tag.textContent = css$1;
			document.head.appendChild(tag);
		}
		//#endregion
		//#region src/client/enhancer.ts
		/** Marker stamped on the conversation root (the `div[data-phase]` column). */
		const GB_ROOT = "data-gb-root";
		/** Marker stamped on the sidebar column (frame's first child). */
		const GB_SIDEBAR_COL = "data-gb-sidebar-col";
		/** Marker stamped on the real sidebar root (past the slot's contents wrapper). */
		const GB_SIDEBAR_ROOT = "data-gb-sidebar-root";
		/** Marker stamped on the sidebar workspace tree body (fade host). */
		const GB_SIDEBAR_SCROLLPORT = "data-gb-sidebar-scrollport";
		/** Marker stamped on the sidebar workspace list (the real scroller). */
		const GB_SIDEBAR_LIST = "data-gb-sidebar-list";
		/** Marker stamped on the conversation view area (the chat scroll viewport). */
		const GB_CHAT_VIEWPORT = "data-gb-chat-viewport";
		/** Marker stamped on the session header (past the slot's contents wrapper). */
		const GB_HEADER = "data-gb-header";
		/** Presence flag: the scroller can still move toward the top edge. */
		const GB_TOP = "data-gb-top";
		/** Presence flag: the scroller can still move toward the bottom edge. */
		const GB_BOTTOM = "data-gb-bottom";
		/** Body-level pure-color overlay melting from the browser's top edge down. */
		const GB_FADE_TOP = "data-gb-fade-top";
		/** Body-level pure-color overlay melting from the browser's bottom edge up. */
		const GB_FADE_BOTTOM = "data-gb-fade-bottom";
		/** Body-level progressive-blur overlays for the sidebar tree edges. */
		const GB_FADE_SIDEBAR_TOP = "data-gb-fade-sidebar-top";
		const GB_FADE_SIDEBAR_BOTTOM = "data-gb-fade-sidebar-bottom";
		/** CSS variable (on the conversation root) holding the scroller's reserved
		top band: the floating header card's bottom edge plus breathing room. */
		const GB_HEADER_BOTTOM_VAR = "--dsh-gb-header-bottom";
		/** Every marker the enhancer may stamp (and must retract on dispose). */
		const GB_MARKERS = [
			GB_ROOT,
			GB_SIDEBAR_COL,
			GB_SIDEBAR_ROOT,
			GB_SIDEBAR_SCROLLPORT,
			GB_SIDEBAR_LIST,
			GB_CHAT_VIEWPORT,
			GB_HEADER
		];
		/**
		* Pure-color edge fades — no blur at all (backdrop-filter dropped after the
		* subpixel-fringing artifacts could not be cleaned up). Each edge is one
		* plain div with a solid-to-transparent background gradient in the
		* user-specified direction, anchored on the BROWSER edges (not the floating
		* bars, which ride above the fades):
		* - Top bar: solid at the very top browser edge, dissolving over the
		*   floating card's band.
		* - Bottom bar: solid at the very bottom browser edge, clear above the
		*   composer card.
		*/
		const FADE_HEIGHT = 64;
		const SIDEBAR_FADE_HEIGHT = 40;
		/** Right gutter the sidebar fade leaves for the scrollbar (matches the
		workspace's --dsh-session-list-edge-inset). */
		const SIDEBAR_FADE_GUTTER = 12;
		/** Stable framework hooks the enhancer anchors on. */
		const HOOK_OVERLAY = "[data-shell-overlay]";
		const HOOK_SCROLL_BODY = "[data-conversation-scroll]";
		/**
		* The slot system mounts every entry through a `display: contents` wrapper
		* (layout-neutral, but present in the DOM). Walk through such single-child
		* wrappers to the real box the stylesheet needs to touch.
		*/
		function skipContentsWrappers(el) {
			let current = el ?? null;
			while (current instanceof HTMLElement && current.children.length === 1 && getComputedStyle(current).display === "contents") current = current.firstElementChild;
			return current;
		}
		/** Collect every anchor from the live DOM without touching it. */
		function findAnchors() {
			const overlay = document.querySelector(HOOK_OVERLAY);
			const frame = overlay?.parentElement instanceof HTMLElement ? overlay.parentElement : null;
			const sidebarCol = frame?.firstElementChild instanceof HTMLElement ? frame.firstElementChild : null;
			const sidebarRootEl = skipContentsWrappers(sidebarCol?.firstElementChild);
			const sidebarRoot = sidebarRootEl instanceof HTMLElement ? sidebarRootEl : null;
			const sidebarList = sidebarCol?.querySelector("[role=\"tree\"]") ?? null;
			const sidebarScrollport = sidebarList?.parentElement instanceof HTMLElement ? sidebarList.parentElement : null;
			const scrollBody = document.querySelector(HOOK_SCROLL_BODY);
			const rootCandidate = scrollBody?.parentElement;
			const root = rootCandidate instanceof HTMLElement && skipContentsWrappers(rootCandidate.firstElementChild)?.tagName === "HEADER" ? rootCandidate : document.querySelector("div[data-phase]");
			const headerEl = skipContentsWrappers(root?.firstElementChild);
			const header = headerEl?.tagName === "HEADER" ? headerEl : null;
			const viewportEl = skipContentsWrappers(scrollBody?.firstElementChild);
			return {
				frame,
				sidebarCol,
				sidebarRoot,
				sidebarScrollport,
				sidebarList,
				root,
				header,
				scrollBody,
				viewport: viewportEl instanceof HTMLElement ? viewportEl : null
			};
		}
		/** Side-effect-free scroll-state projection: which edge fades should show. */
		function scrollState(scrollEl) {
			const { scrollTop, clientHeight, scrollHeight } = scrollEl;
			return {
				top: scrollTop > 4,
				bottom: scrollTop + clientHeight < scrollHeight - 4
			};
		}
		/** Stamp one marker (idempotent) and remember it for disposal. */
		function mark(el, attr, tracked) {
			if (!el.hasAttribute(attr)) el.setAttribute(attr, "");
			tracked.add(el);
		}
		/** Project a scroller's state onto its fade host's presence flags. */
		function syncScroll(scrollEl, hostEl) {
			if (scrollEl === null || hostEl === null) return;
			const { top, bottom } = scrollState(scrollEl);
			if (top) hostEl.setAttribute(GB_TOP, "");
			else hostEl.removeAttribute(GB_TOP);
			if (bottom) hostEl.setAttribute(GB_BOTTOM, "");
			else hostEl.removeAttribute(GB_BOTTOM);
		}
		/**
		* The built-in workspace fade (a 24px gradient strip, absolute at the bottom
		* of the tree body) is superseded by the plugin's blurred fades; hide it so
		* the bottom edge is not double-faded. Only an empty absolutely-positioned
		* last child qualifies — the real fade is exactly that.
		*/
		function hideBuiltinFade(scrollport, restore) {
			const last = scrollport.lastElementChild;
			if (!(last instanceof HTMLElement)) return;
			if (last.children.length > 0) return;
			if (getComputedStyle(last).position !== "absolute") return;
			if (last.style.display !== "none") {
				last.style.display = "none";
				restore.add(last);
			}
		}
		/**
		* Measure the session header and publish the scroller's top inset on the
		* root: the floating card sits 8px below the window edge, so the reserved
		* band spans the card's bottom edge plus its 8px breathing room (this keeps
		* the first message below the card at rest; scrolled content rises through
		* the band to the browser's top edge).
		*/
		function publishHeaderVar(header, root) {
			root.style.setProperty(GB_HEADER_BOTTOM_VAR, `${header.getBoundingClientRect().bottom + 8}px`);
		}
		/**
		* Body-level fixed overlay: one plain div per edge, styled entirely by the
		* stylesheet (pure-color gradient, no blur). Body children are never touched
		* by React, so the overlay survives every remount; the pass re-positions it
		* against the live anchors.
		*/
		function ensureFadeOverlay(attr, ownedNodes) {
			const existing = document.querySelector(`[${attr}]`);
			if (existing !== null) return existing;
			const overlay = document.createElement("div");
			overlay.setAttribute(attr, "");
			overlay.style.opacity = "0";
			document.body.appendChild(overlay);
			ownedNodes.add(overlay);
			return overlay;
		}
		/** Pin one fade overlay over a live anchor box (fixed, viewport-space). */
		function positionFade(fade, box) {
			fade.style.left = `${box.left}px`;
			fade.style.top = `${box.top}px`;
			fade.style.width = `${box.width}px`;
			fade.style.height = `${box.height}px`;
		}
		/**
		* Mount the enhancer: one idempotent markup pass over the live DOM plus the
		* observers/listeners that keep it current. Returns the disposer.
		* @returns a disposer that retracts every marker and observer.
		*/
		function enhance() {
			const tracked = /* @__PURE__ */ new Set();
			const restoredFades = /* @__PURE__ */ new Set();
			const ownedNodes = /* @__PURE__ */ new Set();
			const observedHeaders = /* @__PURE__ */ new WeakSet();
			let pending = 0;
			let headerObserver = null;
			/** One full pass: locate, mark, publish, sync. Cheap; safe to re-run. */
			const pass = () => {
				const anchors = findAnchors();
				if (anchors.root !== null) mark(anchors.root, GB_ROOT, tracked);
				if (anchors.sidebarCol !== null) mark(anchors.sidebarCol, GB_SIDEBAR_COL, tracked);
				if (anchors.sidebarRoot !== null) mark(anchors.sidebarRoot, GB_SIDEBAR_ROOT, tracked);
				if (anchors.sidebarScrollport !== null) mark(anchors.sidebarScrollport, GB_SIDEBAR_SCROLLPORT, tracked);
				if (anchors.sidebarList !== null) mark(anchors.sidebarList, GB_SIDEBAR_LIST, tracked);
				if (anchors.viewport !== null) mark(anchors.viewport, GB_CHAT_VIEWPORT, tracked);
				if (anchors.header !== null) {
					mark(anchors.header, GB_HEADER, tracked);
					if (anchors.root !== null) publishHeaderVar(anchors.header, anchors.root);
					if (typeof ResizeObserver !== "undefined" && !observedHeaders.has(anchors.header)) {
						observedHeaders.add(anchors.header);
						headerObserver ??= new ResizeObserver(schedule);
						headerObserver.observe(anchors.header);
					}
				}
				if (anchors.sidebarScrollport !== null) hideBuiltinFade(anchors.sidebarScrollport, restoredFades);
				syncScroll(anchors.sidebarList, anchors.sidebarScrollport);
				syncScroll(anchors.scrollBody, anchors.root);
				const topFade = ensureFadeOverlay(GB_FADE_TOP, ownedNodes);
				const bottomFade = ensureFadeOverlay(GB_FADE_BOTTOM, ownedNodes);
				const sidebarTopFade = ensureFadeOverlay(GB_FADE_SIDEBAR_TOP, ownedNodes);
				const sidebarBottomFade = ensureFadeOverlay(GB_FADE_SIDEBAR_BOTTOM, ownedNodes);
				if (anchors.scrollBody !== null) {
					const rect = anchors.scrollBody.getBoundingClientRect();
					const state = scrollState(anchors.scrollBody);
					if (anchors.header !== null) {
						const headerRect = anchors.header.getBoundingClientRect();
						positionFade(topFade, {
							left: rect.left,
							top: 0,
							width: rect.width,
							height: Math.max(0, headerRect.bottom)
						});
						topFade.style.opacity = state.top ? "1" : "0";
					}
					const card = document.querySelector("[data-composer-card]");
					const seat = document.querySelector("[data-composer-seat]");
					if (card !== null && seat !== null) {
						const cardRect = card.getBoundingClientRect();
						const seatRect = seat.getBoundingClientRect();
						const top = cardRect.top - FADE_HEIGHT;
						positionFade(bottomFade, {
							left: seatRect.left,
							top,
							width: seatRect.width,
							height: window.innerHeight - top
						});
						bottomFade.style.opacity = state.bottom ? "1" : "0";
					}
				}
				if (anchors.sidebarScrollport !== null) {
					const rect = anchors.sidebarScrollport.getBoundingClientRect();
					const width = Math.max(0, rect.width - SIDEBAR_FADE_GUTTER);
					positionFade(sidebarTopFade, {
						left: rect.left,
						top: rect.top,
						width,
						height: SIDEBAR_FADE_HEIGHT
					});
					positionFade(sidebarBottomFade, {
						left: rect.left,
						top: rect.bottom - SIDEBAR_FADE_HEIGHT,
						width,
						height: SIDEBAR_FADE_HEIGHT
					});
					const state = anchors.sidebarList !== null ? scrollState(anchors.sidebarList) : {
						top: false,
						bottom: false
					};
					sidebarTopFade.style.opacity = state.top ? "1" : "0";
					sidebarBottomFade.style.opacity = state.bottom ? "1" : "0";
				}
			};
			/** Debounced pass shared by mutation, scroll, and resize signals. */
			const schedule = () => {
				if (pending !== 0) return;
				pending = typeof requestAnimationFrame === "function" ? requestAnimationFrame(() => {
					pending = 0;
					pass();
				}) : window.setTimeout(() => {
					pending = 0;
					pass();
				}, 0);
			};
			const observer = new MutationObserver(schedule);
			observer.observe(document.documentElement, {
				childList: true,
				subtree: true
			});
			window.addEventListener("scroll", schedule, {
				passive: true,
				capture: true
			});
			window.addEventListener("resize", schedule, { passive: true });
			pass();
			return () => {
				if (typeof cancelAnimationFrame === "function" && pending !== 0) cancelAnimationFrame(pending);
				else if (pending !== 0) window.clearTimeout(pending);
				pending = 0;
				observer.disconnect();
				headerObserver?.disconnect();
				headerObserver = null;
				window.removeEventListener("scroll", schedule, { capture: true });
				window.removeEventListener("resize", schedule);
				for (const el of tracked) {
					for (const attr of GB_MARKERS) el.removeAttribute(attr);
					el.removeAttribute(GB_TOP);
					el.removeAttribute(GB_BOTTOM);
					el.style.removeProperty(GB_HEADER_BOTTOM_VAR);
				}
				for (const el of restoredFades) el.style.display = "";
				for (const el of ownedNodes) el.remove();
				tracked.clear();
				restoredFades.clear();
				ownedNodes.clear();
			};
		}
		//#endregion
		//#region src/client/locales.ts
		/**
		* `gaussianBlur` locale namespace: the settings row copy.
		* @module dsh-gaussian-blur/client/locales
		*/
		/** Dictionary namespace owned by this plugin (settings row copy). */
		const NS = "gaussianBlur";
		/** Simplified Chinese dictionary (the key-set source of truth). */
		const zh = {
			"blur.title": "悬浮卡片高斯模糊",
			"blur.description": "控制顶部会话栏与输入卡片的毛玻璃模糊强度（0-100，实时预览）"
		};
		/** English dictionary, checked complete against the zh key set. */
		const en = {
			"blur.title": "Floating card Gaussian blur",
			"blur.description": "How strongly the top session bar and the composer card frost their backdrop (0-100, live preview)"
		};
		//#endregion
		//#region src/shared/settings.ts
		/** Field carrying the composer-card Gaussian blur strength (0-100). */
		const CARD_BLUR_FIELD = "cardBlur";
		/** Map the 0-100 slider onto a blur radius in px. */
		function blurPx(value) {
			return Math.round(Math.max(0, Math.min(100, value)) / 100 * 30 * 10) / 10;
		}
		//#endregion
		//#region \0dsh-css:E:\ds\dsh-gaussian-blur\src\client\blurRow.module.css.mjs
		const css = ".d_GMua_row{border-bottom:1px solid var(--dsw-alias-border-l2);align-items:center;gap:8px;padding:16px 0;display:flex}.d_GMua_rowText{flex-direction:column;flex:1;gap:4px;min-width:0;padding-right:24px;display:flex}.d_GMua_title{color:var(--dsw-alias-label-primary);font-size:14px;font-weight:400;line-height:22px}.d_GMua_desc{color:var(--dsw-alias-label-tertiary);font-size:12px;font-weight:400;line-height:18px}.d_GMua_sliderWrap{flex:none;align-items:center;gap:10px;display:flex}.d_GMua_slider{cursor:pointer;width:168px;height:20px;accent-color:var(--dsw-alias-state-business-primary);margin:0}.d_GMua_sliderValue{text-align:right;min-width:44px;color:var(--dsw-alias-label-secondary);font-variant-numeric:tabular-nums;font-size:13px;line-height:20px}";
		const tagId = "dsh-gaussian-blur/blurRow.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "dsh-gaussian-blur";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var blurRow_module_css_default = {
			"title": "d_GMua_title",
			"row": "d_GMua_row",
			"desc": "d_GMua_desc",
			"sliderWrap": "d_GMua_sliderWrap",
			"slider": "d_GMua_slider",
			"sliderValue": "d_GMua_sliderValue",
			"rowText": "d_GMua_rowText"
		};
		//#endregion
		//#region src/client/blurRow.tsx
		/**
		* Render the blur-strength slider row.
		* @param props - framework props (see {@link BlurStrengthRowProps}).
		* @returns the General-section row.
		*/
		function BlurStrengthRow({ useCardBlur, setCardBlur, t }) {
			const value = useCardBlur((snapshot) => snapshot.value?.["cardBlur"] ?? 60);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: blurRow_module_css_default.row,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: blurRow_module_css_default.rowText,
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: blurRow_module_css_default.title,
						children: t("blur.title")
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: blurRow_module_css_default.desc,
						children: t("blur.description")
					})]
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: blurRow_module_css_default.sliderWrap,
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
						type: "range",
						className: blurRow_module_css_default.slider,
						min: 0,
						max: 100,
						step: 1,
						value,
						"aria-label": t("blur.title"),
						onChange: (event) => {
							const next = Number(event.currentTarget.value);
							if (Number.isFinite(next)) setCardBlur(next);
						}
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
						className: blurRow_module_css_default.sliderValue,
						children: [blurPx(value), "px"]
					})]
				})]
			});
		}
		//#endregion
		//#region src/client/blurStore.ts
		/**
		* Browser-local durable store for the card-blur preference.
		*
		* Why not the framework settings scope: the web API proxy
		* (`@deepseek-ai/dsh-host-apiproxy`) only serves settings namespaces on its
		* hard-coded allowlists (model providers plus a few product namespaces); a
		* third-party namespace answers `settings-not-exposed` on every read and
		* write even after `settings.register()`. Exposing third-party namespaces is
		* explicitly deferred work in the framework, so the slider persists through
		* localStorage — the same per-browser durability a visual theme preference
		* needs — and the host half keeps its namespace registration for the day the
		* seam opens.
		*
		* The store's surface (getSnapshot/subscribe/set) mirrors the settings scope
		* shape, so the settings row's injected selector hook consumes it unchanged.
		* @module dsh-gaussian-blur/client/blurStore
		*/
		/** localStorage key carrying the 0-100 preference. */
		const STORAGE_KEY = "dsh-gaussian-blur:cardBlur";
		/** Read the stored value, clamped into bounds, defaulting when absent/corrupt. */
		function readStored() {
			try {
				const raw = window.localStorage.getItem(STORAGE_KEY);
				if (raw === null) return 60;
				const parsed = Number(raw);
				if (Number.isFinite(parsed)) return Math.max(0, Math.min(100, Math.round(parsed)));
			} catch {}
			return 60;
		}
		/** Create the browser-local blur-preference store. */
		function createBlurStore() {
			let value = readStored();
			const listeners = /* @__PURE__ */ new Set();
			const getSnapshot = () => ({ value: { [CARD_BLUR_FIELD]: value } });
			return {
				getSnapshot,
				subscribe(listener) {
					listeners.add(listener);
					return () => {
						listeners.delete(listener);
					};
				},
				set(next) {
					const clamped = Math.max(0, Math.min(100, Math.round(next)));
					if (clamped === value) return;
					value = clamped;
					try {
						window.localStorage.setItem(STORAGE_KEY, String(clamped));
					} catch {}
					for (const listener of listeners) listener();
				}
			};
		}
		//#endregion
		//#region src/client/index.ts
		/** Services the always-on surface needs: the slot registry and the copy. */
		const inject = ["locale", "slots"];
		/**
		* Client plugin body: mount the DOM enhancer, project the durable blur
		* preference onto the `--dsh-gb-card-blur` variable, and register the
		* General-settings row.
		* @param ctx - client root context.
		*/
		function apply(ctx) {
			ctx.effect(() => ctx.locale.register(NS, {
				zh,
				en
			}), "dsh-gaussian-blur: dictionaries");
			ctx.effect(() => enhance(), "dsh-gaussian-blur: dom enhancer");
			const store = createBlurStore();
			ctx.effect(() => {
				const applyBlur = () => {
					const value = store.getSnapshot().value[CARD_BLUR_FIELD];
					document.documentElement.style.setProperty("--dsh-gb-card-blur", `${blurPx(value)}px`);
				};
				applyBlur();
				const unsubscribe = store.subscribe(applyBlur);
				return () => {
					unsubscribe();
					document.documentElement.style.removeProperty("--dsh-gb-card-blur");
				};
			}, "dsh-gaussian-blur: card blur preference");
			const t = ctx.locale.bind(NS);
			ctx.slots.inject("settings.general.item", () => ctx.slots.register({
				name: "settings.general.item",
				id: "gaussian-blur-card",
				order: 30,
				inject: () => ({
					hooks: { cardBlur: store },
					setCardBlur: (value) => {
						store.set(value);
					},
					t
				})
			}, BlurStrengthRow));
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map