<div align="center">

# dsh-gaussian-blur

**A frosted-glass theme for the DeepSeek Harness web UI.**

[![GitHub stars](https://img.shields.io/github/stars/hashdiana/dsh-blur-theme?style=flat-square&logo=github)](https://github.com/hashdiana/dsh-blur-theme/stargazers)
[![License: MIT](https://img.shields.io/github/license/hashdiana/dsh-blur-theme?style=flat-square&color=4EAA25)](https://github.com/hashdiana/dsh-blur-theme/blob/main/LICENSE)
[![DSH Plugin](https://img.shields.io/badge/DSH%20Plugin-topic-3178C6?style=flat-square)](https://github.com/topics/dsh-plugin)

🌐 English · [中文](README_CN.md)

</div>

The shipped web UI keeps every bar opaque and every edge hard. **dsh-gaussian-blur restyles it as a glass theme**: the sidebar becomes a rounded floating card, the session header turns into a frosted bar that conversation text melts under all the way to the browser's top edge, and the composer band floats over content that now reaches the very bottom of the window.

🎯 Bars should float over content — not chop it off.

## Screenshots

<p align="center">
  <img src="p1.png" alt="dsh-gaussian-blur conversation view" height="420">
</p>
<p align="center"><em>The glass conversation view: rounded sidebar card, frosted header, floating composer card.</em></p>

<p align="center">
  <img src="p2.png" alt="dsh-gaussian-blur edge melts while scrolling" height="420">
</p>
<p align="center"><em>Mid-scroll: messages melt into the window's top and bottom edges instead of vanishing at hard bars.</em></p>

<details>
<summary><b>Contents</b></summary>

- [Screenshots](#screenshots)
- [Highlights](#highlights)
- [What it changes](#what-it-changes)
- [Install](#install)
- [Uninstall / Disable](#uninstall--disable)
- [Build & develop](#build--develop)
- [How it works](#how-it-works)
- [License](#license)

</details>

## Highlights

- **Floating rounded sidebar** — the sidebar reads as a card (22px radius, hairline border, soft shadow, theme background) with symmetric insets; the collapsed rail becomes an edge-hugging pill.
- **Frosted header card** — the session bar (session name, agent preset, tabs) is a translucent blurred card that floats over the conversation.
- **Content melts at the window edges** — messages scroll beneath the frosted header all the way to the browser's **top** edge and disappear exactly there, and extend to the **bottom** edge under the composer band. Nothing hard-clips at the bars.
- **Floating composer** — the composer card is a uniform frosted glass panel (no gradient, no halo) riding above the scrollport.
- **Edge fades, no blur artifacts** — the melts are pure-color gradients; no backdrop-filter on the fades, so no subpixel fringing.
- **A live blur slider** — General settings → *Card Gaussian blur* (0–100; 0 = off, 100 = 30px, default 60 = 18px) drives **both** glass cards in real time and persists.
- **Theme-adaptive and bilingual** — styled only with `--dsw-*` tokens (light/dark), shipped in Chinese and English.

## What it changes

| Surface | Effect |
|---|---|
| Sidebar column | Rounded floating card, hairline border + shadow, background matched to the header card |
| Sidebar tree edges | Pure-color fades top/bottom (40px) while scrollable; replaces the built-in bottom fade |
| Session header | Translucent + blurred floating card; utilities pill pinned at the viewport top-right |
| Conversation top edge | Content scrolls under the frosted header to the browser's top edge; a solid-at-edge gradient melts it exactly there |
| Conversation bottom edge | Content extends to the browser's bottom edge; a solid-at-bottom gradient melts it up into the composer band |
| Composer card | Uniform frosted glass (blur + saturate + translucent fill), no halo |
| Settings | *悬浮卡片高斯模糊* slider row in General settings, persisted via `dsh-settings` |

## Install

**From GitHub (recommended):**

```sh
npx -p @deepseek-ai/dsh dsh plugin --profile web add github:hashdiana/dsh-blur-theme
```

**From a local checkout:**

```sh
npx -p @deepseek-ai/dsh dsh plugin --profile web add <path-to-this-repo>
```

Then restart the profile:

```sh
dsh web
```

> The Git path ships the built `lib/` (see Build & develop), so no build script runs at install time. Plugin-set changes require a restart; later client-bundle-only updates take effect on a page refresh.

## Uninstall / Disable

Temporarily disable without uninstalling — add to `$DSH_HOME/profiles/web/cordis.patch.yml`:

```yaml
- id: dsh-gaussian-blur
  disabled: true
```

Restart `dsh web`; the stock chrome returns. Remove those lines to re-enable.

## Build & develop

```sh
pnpm install
pnpm typecheck   # tsc -b
pnpm build       # tsc -b + tsdown → lib/index.js (host) + lib/client.js (browser)
pnpm test        # vitest: enhancer markup/pass, settings row, plugin contract, bundle purity
```

The client bundle is emitted as `window.__ModuleLoader__.load({ id, factory })`; CSS Modules are hashed by lightningcss and injected as a `<style data-plugin="dsh-gaussian-blur">` tag. **Commit `lib/`** — Git installs consume the built output, not `src/`.

## How it works

- **Pure client plugin** — the host half registers the persisted blur setting (`dsh-settings`, schema via `@deepseek-ai/schemastery`); the browser half ships via `exports["./client"]`.
- **Stable hooks only** — anchors come from the shipped UI's stable `data-*` attributes (`data-shell-overlay`, `data-conversation-scroll`, `data-composer-seat`/`data-composer-card`, `div[data-phase]`, `[role="tree"]`); the enhancer stamps its own `data-gb-*` markers (walking through slot `display: contents` wrappers) and one stylesheet does all the visual work. No hashed class names.
- **Body-level fades** — the edge melts are `position: fixed` overlays appended to `document.body` (React never touches body children), pure solid→transparent gradients, `pointer-events: none`, `z-index: 5` below every floating control.
- **Glass without breaking the pill** — the header's backdrop-filter lives on a `::before` layer; if it sat on the card itself, Chromium would make it the containing block for the fixed utilities pill and drag it out of the viewport corner.
- **Idempotent + self-healing** — the markup pass re-runs from a debounced MutationObserver plus scroll/resize events; dispose (HMR/unload) removes every marker and overlay, restores the built-in sidebar fade, and disconnects all observers.

## License

[MIT](LICENSE)
