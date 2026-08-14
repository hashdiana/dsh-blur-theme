// @vitest-environment jsdom
/**
 * dsh-gaussian-blur settings integration: the browser half binds its durable
 * `dsh-gaussian-blur` settings scope, projects the blur preference onto the
 * `--dsh-gb-card-blur` variable, and registers the General-settings row —
 * all through stub services (the real transport is host-backed).
 */
import { Context } from '@deepseek-ai/cordis'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { apply, inject } from '../src/client/index.ts'
import { NS } from '../src/client/locales.ts'
import { CARD_BLUR_FIELD, SETTINGS_NAMESPACE } from '../src/shared/settings.ts'

// The real primitives package drags katex/shiki stylesheets through Node's
// module loader (template pit #4); the settings row only needs inert stubs.
vi.mock('@deepseek-ai/dsh-client-ui-primitives', () => ({
  Menu: () => null,
  IconChevronDownOutline14: () => null,
}))

const VAR = '--dsh-gb-card-blur'

afterEach(() => { document.body.innerHTML = '' })

/** In-memory stand-in for the host-backed settings scope. */
function fakeScope(initial: number) {
  let value: Record<string, number> = { [CARD_BLUR_FIELD]: initial }
  const listeners = new Set<() => void>()
  return {
    getSnapshot: () => ({ status: 'ready' as const, value, base: undefined, user: undefined, revision: 1, writable: true, mode: 'host' as const }),
    subscribe: (listener: () => void) => {
      listeners.add(listener)
      return () => { listeners.delete(listener) }
    },
    set: async (field: string, next: number) => {
      value = { ...value, [field]: next }
      for (const listener of listeners) listener()
    },
    unset: async () => {},
    load: async () => {},
    dispose: async () => {},
  }
}

async function boot(initial = 60) {
  const ctx = new Context()
  const registrations: Array<{ options: Record<string, unknown> }> = []
  let boundNamespace = ''
  const scope = fakeScope(initial)
  ctx.provide('locale', { register: () => {} } as never)
  ctx.provide('slots', {
    inject: (_key: string, callback: () => (() => void) | void) => {
      const disposer = callback()
      return () => { disposer?.() }
    },
    register: (options: Record<string, unknown>, _component: unknown) => {
      registrations.push({ options })
      return () => {}
    },
  } as never)
  ctx.provide('settingsScope', {
    bind: (spec: { namespace: string }) => {
      boundNamespace = spec.namespace
      return scope
    },
  } as never)
  const fiber = ctx.plugin({ inject: [...inject], apply })
  await fiber.await()
  return { ctx, fiber, scope, registrations, boundNamespace }
}

describe('dsh-gaussian-blur settings integration', () => {
  it('binds its settings namespace and publishes the default blur radius', async () => {
    const { boundNamespace } = await boot()

    expect(boundNamespace).toBe(SETTINGS_NAMESPACE)
    expect(document.documentElement.style.getPropertyValue(VAR)).toBe('18px')
  })

  it('registers the General-settings row with its id and order', async () => {
    const { registrations } = await boot()

    expect(registrations).toHaveLength(1)
    expect(registrations[0]?.options).toMatchObject({
      name: 'settings.general.item',
      id: 'gaussian-blur-card',
      order: 30,
    })
  })

  it('projects a preference change onto the CSS variable', async () => {
    const { scope } = await boot()
    await scope.set(CARD_BLUR_FIELD, 100)
    expect(document.documentElement.style.getPropertyValue(VAR)).toBe('30px')
    await scope.set(CARD_BLUR_FIELD, 0)
    expect(document.documentElement.style.getPropertyValue(VAR)).toBe('0px')
    await scope.set(CARD_BLUR_FIELD, 30)
    expect(document.documentElement.style.getPropertyValue(VAR)).toBe('9px')
  })

  it('withdraws the variable when the plugin fiber is disposed', async () => {
    const { fiber } = await boot()
    expect(document.documentElement.style.getPropertyValue(VAR)).toBe('18px')

    await fiber.dispose()

    expect(document.documentElement.style.getPropertyValue(VAR)).toBe('')
  })
})
