// @vitest-environment jsdom
/**
 * dsh-gaussian-blur browser half on a real cordis Context: the enhancer rides
 * the plugin fiber (HMR safety — dispose withdraws every marker, reload
 * re-applies them), the settings surface is an optional child fiber, and the
 * node half registers its settings namespace only through an optional
 * settings provider.
 */
import { Context } from '@deepseek-ai/cordis'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { GB_ROOT, GB_SIDEBAR_COL } from '../src/client/enhancer.ts'
import { apply, inject } from '../src/client/index.ts'

// The real primitives package drags katex/shiki stylesheets through Node's
// module loader (template pit #4); the settings row only needs inert stubs.
vi.mock('@deepseek-ai/dsh-client-ui-primitives', () => ({
  Menu: () => null,
  IconChevronDownOutline14: () => null,
}))

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

/** Minimal service stubs the browser plugin's base inject requires. */
async function boot() {
  const ctx = new Context()
  ctx.provide('locale', { register: () => {} } as never)
  ctx.provide('slots', { inject: () => {}, register: () => () => {} } as never)
  const fiber = ctx.plugin({ inject: [...inject], apply })
  await fiber.await()
  return { ctx, fiber }
}

describe('dsh-gaussian-blur browser plugin', () => {
  it('marks the anchored surfaces once the fiber activates', async () => {
    const { fiber } = await boot()
    await fiber.await()

    expect(document.querySelector('#root')?.hasAttribute(GB_ROOT)).toBe(true)
    expect(document.querySelector('#sidebarCol')?.hasAttribute(GB_SIDEBAR_COL)).toBe(true)
  })

  it('withdraws every marker when the plugin fiber is disposed', async () => {
    const { fiber } = await boot()
    await fiber.await()
    expect(document.querySelector('#root')?.hasAttribute(GB_ROOT)).toBe(true)

    await fiber.dispose()

    expect(document.querySelector('#root')?.hasAttribute(GB_ROOT)).toBe(false)
    expect(document.querySelector('#sidebarCol')?.hasAttribute(GB_SIDEBAR_COL)).toBe(false)
  })

  it('re-applies cleanly when the plugin is reloaded', async () => {
    const { ctx, fiber } = await boot()
    await fiber.await()
    await fiber.dispose()

    const reloaded = ctx.plugin({ inject: [...inject], apply })
    await reloaded.await()

    expect(document.querySelector('#root')?.hasAttribute(GB_ROOT)).toBe(true)
    expect(document.querySelector('#sidebarCol')?.hasAttribute(GB_SIDEBAR_COL)).toBe(true)
  })

  it('stays pending (no crash) when the optional settings surface is absent', async () => {
    // The boot stubs above already omit settingsScope; awaiting activation
    // succeeds because the settings integration rides a child fiber.
    const { fiber } = await boot()
    await fiber.await()
    expect(fiber.state).toBeGreaterThanOrEqual(2)
  })

  it('the node half registers its settings namespace only through a settings provider', async () => {
    const { apply: nodeApply } = await import('../src/index.ts')
    const registered: unknown[] = []
    const fakeCtx = {
      inject: (_deps: string[], callback: (child: unknown) => void) => {
        callback({ settings: { register: (...args: unknown[]) => { registered.push(args) } } })
      },
    }
    expect(() => { nodeApply(fakeCtx as never) }).not.toThrow()
    expect(registered).toHaveLength(1)
    expect((registered[0] as unknown[])[1]).toBeDefined()
  })

  it('the node half never blocks boot without a settings provider', async () => {
    const { apply: nodeApply } = await import('../src/index.ts')
    const never = { inject: () => {} }
    expect(() => { nodeApply(never as never) }).not.toThrow()
  })
})
