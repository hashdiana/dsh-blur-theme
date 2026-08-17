// @vitest-environment jsdom
/**
 * The shipped build artifact: lib/client.js is evaluated through the same
 * __ModuleLoader__ contract the browser uses (tests/loader-shim.ts), then its
 * exports apply over a bare cordis Context against the shipped-UI skeleton —
 * proving the package's "./client" export actually boots and marks the DOM.
 */
import { Context } from '@deepseek-ai/cordis'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { GB_ROOT } from '../src/client/enhancer.ts'
import { clientModule } from './loader-shim.ts'

beforeEach(() => {
  document.body.innerHTML = `
    <div id="frame">
      <div id="sidebarCol"><div id="treeBody"><div id="tree" role="tree"></div></div></div>
      <div data-shell-overlay></div>
    </div>
    <div id="root" data-phase="active">
      <header></header>
      <div data-conversation-scroll>
        <div id="viewArea"></div>
        <div data-composer-seat><div><div data-composer-card></div></div></div>
      </div>
    </div>`
})
afterEach(() => { document.body.innerHTML = '' })

describe('built client bundle', () => {
  it('loads through the module-loader contract and applies to the DOM', async () => {
    const bundle = clientModule('dsh-gaussian-blur') as { inject: string[]; apply: (ctx: Context) => void }
    expect(Array.isArray(bundle.inject)).toBe(true)

    const ctx = new Context()
    // Base service stubs the bundle's inject requires; the settings row
    // registers through the slot registry with a browser-local store.
    ctx.provide('locale', { register: () => {}, bind: () => () => '' } as never)
    ctx.provide('slots', { inject: () => {}, register: () => () => {} } as never)
    const fiber = ctx.plugin({ inject: [...bundle.inject], apply: bundle.apply })
    await fiber.await()

    expect(document.querySelector('#root')?.hasAttribute(GB_ROOT)).toBe(true)

    await fiber.dispose()
    expect(document.querySelector('#root')?.hasAttribute(GB_ROOT)).toBe(false)
  })
})
