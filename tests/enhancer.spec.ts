// @vitest-environment jsdom
/**
 * dsh-gaussian-blur enhancer unit tests: the markup pass against a hand-built
 * skeleton of the shipped Web UI (stable data-* hooks only), scroll-state
 * projection, remount re-marking, and full dispose cleanup.
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { enhance, GB_BOTTOM, GB_CHAT_VIEWPORT, GB_FADE_BOTTOM, GB_FADE_SIDEBAR_BOTTOM, GB_FADE_SIDEBAR_TOP, GB_FADE_TOP, GB_HEADER, GB_HEADER_BOTTOM_VAR, GB_ROOT, GB_SIDEBAR_COL, GB_SIDEBAR_LIST, GB_SIDEBAR_ROOT, GB_SIDEBAR_SCROLLPORT, GB_TOP, scrollState } from '../src/client/enhancer.ts'

/** Active enhancer disposer; every test starts clean and tears itself down. */
let dispose: (() => void) | undefined

/** Flush the debounce (rAF when available, else setTimeout) and observers. */
function flush(): Promise<void> {
  return new Promise((resolve) => { setTimeout(resolve, 40) })
}

/** Build the shipped-UI skeleton the enhancer anchors on. */
function skeleton(): void {
  document.body.innerHTML = `
    <div id="frame">
      <div id="sidebarCol">
        <div class="sidebar-root">
          <div class="list-area">
            <div id="treeBody">
              <div id="tree" role="tree"><div>session rows</div></div>
              <div id="builtinFade" style="position:absolute;bottom:0;height:24px"></div>
            </div>
          </div>
        </div>
      </div>
      <div id="overlay" data-shell-overlay></div>
    </div>
    <div id="root" data-phase="active">
      <header id="hdr"><div>crumbs</div></header>
      <div id="scrollBody" data-conversation-scroll>
        <div id="viewArea"><div>messages</div></div>
        <div id="seat" data-composer-seat>
          <div id="composerStack"><div id="card" data-composer-card></div></div>
        </div>
      </div>
    </div>`
}

beforeEach(() => {
  skeleton()
  dispose = undefined
})
afterEach(() => {
  dispose?.()
  dispose = undefined
  document.body.innerHTML = ''
})

describe('enhancer markup pass', () => {
  it('stamps every data-gb marker through the stable framework hooks', async () => {
    dispose = enhance()
    await flush()

    expect(document.querySelector('#root')?.hasAttribute(GB_ROOT)).toBe(true)
    expect(document.querySelector('#sidebarCol')?.hasAttribute(GB_SIDEBAR_COL)).toBe(true)
    expect(document.querySelector('#treeBody')?.hasAttribute(GB_SIDEBAR_SCROLLPORT)).toBe(true)
    expect(document.querySelector('#tree')?.hasAttribute(GB_SIDEBAR_LIST)).toBe(true)
    expect(document.querySelector('#viewArea')?.hasAttribute(GB_CHAT_VIEWPORT)).toBe(true)
    expect(document.querySelector('.sidebar-root')?.hasAttribute(GB_SIDEBAR_ROOT)).toBe(true)
    expect(document.querySelector('#hdr')?.hasAttribute(GB_HEADER)).toBe(true)
  })

  it('mounts the pure-color edge fades (no blur) on the conversation and sidebar', async () => {
    dispose = enhance()
    await flush()

    const top = document.querySelector<HTMLElement>(`[${GB_FADE_TOP}]`)
    const bottom = document.querySelector<HTMLElement>(`[${GB_FADE_BOTTOM}]`)
    const sidebarTop = document.querySelector<HTMLElement>(`[${GB_FADE_SIDEBAR_TOP}]`)
    const sidebarBottom = document.querySelector<HTMLElement>(`[${GB_FADE_SIDEBAR_BOTTOM}]`)
    expect(top).not.toBeNull()
    expect(bottom).not.toBeNull()
    expect(sidebarTop).not.toBeNull()
    expect(sidebarBottom).not.toBeNull()

    // Plain single-element overlays: no bands, no backdrop-filter anywhere
    // (the gradients live in the stylesheet).
    expect(top?.children).toHaveLength(0)
    expect(bottom?.children).toHaveLength(0)
    expect(top?.style.backdropFilter).toBe('')

    // Hidden until the scroller can move in that direction (jsdom metrics
    // are all zero, so every fade starts hidden).
    expect(top?.style.opacity).toBe('0')
    expect(bottom?.style.opacity).toBe('0')
    expect(sidebarTop?.style.opacity).toBe('0')
    expect(sidebarBottom?.style.opacity).toBe('0')
  })

  it('walks through slot display:contents wrappers to the real boxes', async () => {
    // The slot system mounts entries through display:contents wrappers;
    // wrap the header and the view area accordingly before enhancing.
    const wrapIn = (el: HTMLElement): HTMLElement => {
      const wrap = document.createElement('div')
      wrap.style.display = 'contents'
      el.parentElement!.insertBefore(wrap, el)
      wrap.appendChild(el)
      return wrap
    }
    wrapIn(document.querySelector('#hdr')!)
    wrapIn(document.querySelector('#viewArea')!)
    const colRoot = wrapIn(document.querySelector('.sidebar-root')!)

    dispose = enhance()
    await flush()

    expect(document.querySelector('#hdr')?.hasAttribute(GB_HEADER)).toBe(true)
    expect(document.querySelector('#viewArea')?.hasAttribute(GB_CHAT_VIEWPORT)).toBe(true)
    expect(colRoot.querySelector('.sidebar-root')?.hasAttribute(GB_SIDEBAR_ROOT)).toBe(true)
    expect(document.querySelector('#root')?.style.getPropertyValue(GB_HEADER_BOTTOM_VAR)).toBe('8px')
  })

  it('publishes the header height variable on the conversation root', async () => {
    dispose = enhance()
    await flush()
    // jsdom has no layout: offsetHeight is 0, so only the 8px card top inset
    // contributes; the variable must still be set.
    expect(document.querySelector('#root')?.style.getPropertyValue(GB_HEADER_BOTTOM_VAR)).toBe('8px')
  })

  it('hides the built-in workspace bottom fade (superseded by the blurred fades)', async () => {
    dispose = enhance()
    await flush()
    expect(document.querySelector('#builtinFade')?.style.display).toBe('none')
  })

  it('does not hide the workspace list when the built-in fade is absent', async () => {
    document.querySelector('#builtinFade')?.remove()
    dispose = enhance()
    await flush()
    const tree = document.querySelector('#tree') as HTMLElement
    expect(tree.style.display).toBe('')
  })

  it('re-marks nodes after React replaces them', async () => {
    dispose = enhance()
    await flush()

    // Simulate a remount: fresh tree body and list inside the same column.
    const col = document.querySelector('#sidebarCol')!
    const listArea = col.querySelector('.list-area')!
    listArea.innerHTML = '<div id="treeBody2"><div id="tree2" role="tree"></div></div>'
    await flush()

    expect(document.querySelector('#treeBody2')?.hasAttribute(GB_SIDEBAR_SCROLLPORT)).toBe(true)
    expect(document.querySelector('#tree2')?.hasAttribute(GB_SIDEBAR_LIST)).toBe(true)
  })

  it('reflects the scroll state as data-gb-top / data-gb-bottom flags', async () => {
    dispose = enhance()
    await flush()

    const scrollBody = document.querySelector('#scrollBody') as HTMLElement
    Object.defineProperty(scrollBody, 'scrollTop', { value: 10, configurable: true })
    Object.defineProperty(scrollBody, 'clientHeight', { value: 50, configurable: true })
    Object.defineProperty(scrollBody, 'scrollHeight', { value: 100, configurable: true })
    window.dispatchEvent(new Event('scroll'))
    await flush()

    const root = document.querySelector('#root')!
    expect(root.hasAttribute(GB_TOP)).toBe(true)
    expect(root.hasAttribute(GB_BOTTOM)).toBe(true)
  })
})

describe('scrollState', () => {
  it('reports both edges while content overflows in both directions', () => {
    const el = document.createElement('div')
    Object.defineProperty(el, 'scrollTop', { value: 10, configurable: true })
    Object.defineProperty(el, 'clientHeight', { value: 50, configurable: true })
    Object.defineProperty(el, 'scrollHeight', { value: 100, configurable: true })
    expect(scrollState(el)).toEqual({ top: true, bottom: true })
  })

  it('reports no edges when the content fits or is at rest', () => {
    const el = document.createElement('div')
    Object.defineProperty(el, 'scrollTop', { value: 0, configurable: true })
    Object.defineProperty(el, 'clientHeight', { value: 0, configurable: true })
    Object.defineProperty(el, 'scrollHeight', { value: 0, configurable: true })
    expect(scrollState(el)).toEqual({ top: false, bottom: false })
  })
})

describe('enhancer dispose', () => {
  it('retracts every marker, restores the built-in fade, and stops observing', async () => {
    dispose = enhance()
    await flush()
    dispose()
    dispose = undefined
    await flush()

    expect(document.querySelector('#root')?.hasAttribute(GB_ROOT)).toBe(false)
    expect(document.querySelector('#sidebarCol')?.hasAttribute(GB_SIDEBAR_COL)).toBe(false)
    expect(document.querySelector('.sidebar-root')?.hasAttribute(GB_SIDEBAR_ROOT)).toBe(false)
    expect(document.querySelector('#treeBody')?.hasAttribute(GB_SIDEBAR_SCROLLPORT)).toBe(false)
    expect(document.querySelector('#tree')?.hasAttribute(GB_SIDEBAR_LIST)).toBe(false)
    expect(document.querySelector('#viewArea')?.hasAttribute(GB_CHAT_VIEWPORT)).toBe(false)
    expect(document.querySelector('#hdr')?.hasAttribute(GB_HEADER)).toBe(false)
    expect(document.querySelector('#builtinFade')?.style.display).toBe('')
    expect(document.querySelector('#root')?.style.getPropertyValue(GB_HEADER_BOTTOM_VAR)).toBe('')
    // The body-level fade overlays are removed with their owner.
    expect(document.querySelector(`[${GB_FADE_TOP}]`)).toBeNull()
    expect(document.querySelector(`[${GB_FADE_BOTTOM}]`)).toBeNull()
    expect(document.querySelector(`[${GB_FADE_SIDEBAR_TOP}]`)).toBeNull()
    expect(document.querySelector(`[${GB_FADE_SIDEBAR_BOTTOM}]`)).toBeNull()

    // After disposal the observer is gone: replaced nodes stay unmarked.
    document.querySelector('#sidebarCol')!.querySelector('.list-area')!.innerHTML =
      '<div id="treeBody3"><div id="tree3" role="tree"></div></div>'
    await flush()
    expect(document.querySelector('#treeBody3')?.hasAttribute(GB_SIDEBAR_SCROLLPORT)).toBe(false)
  })
})

