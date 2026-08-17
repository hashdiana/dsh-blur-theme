// @vitest-environment jsdom
/**
 * dsh-gaussian-blur settings integration: the browser half owns a
 * browser-local (localStorage) blur-preference store, projects the
 * preference onto the `--dsh-gb-card-blur` variable, and registers the
 * General-settings row whose injected setter commits through that store
 * (the framework settings wire does not expose third-party namespaces yet).
 */
import { Context } from '@deepseek-ai/cordis'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { apply, inject } from '../src/client/index.ts'
import { CARD_BLUR_FIELD } from '../src/shared/settings.ts'

// The real primitives package drags katex/shiki stylesheets through Node's
// module loader (template pit #4); the settings row only needs inert stubs.
vi.mock('@deepseek-ai/dsh-client-ui-primitives', () => ({
  Menu: () => null,
  IconChevronDownOutline14: () => null,
}))

const VAR = '--dsh-gb-card-blur'
const STORAGE_KEY = 'dsh-gaussian-blur:cardBlur'

afterEach(() => {
  document.body.innerHTML = ''
  window.localStorage.clear()
})

interface Registration {
  options: {
    inject?: () => { setCardBlur: (value: number) => void }
  }
}

async function boot(initial?: number) {
  if (initial !== undefined) window.localStorage.setItem(STORAGE_KEY, String(initial))
  const ctx = new Context()
  const registrations: Registration[] = []
  ctx.provide('locale', { register: () => {}, bind: () => () => '' } as never)
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
  const fiber = ctx.plugin({ inject: [...inject], apply })
  await fiber.await()
  return { ctx, fiber, registrations }
}

/** The row's injected setter face, built by the row registration. */
function setterOf(registrations: Registration[]): (value: number) => void {
  const face = registrations[0]?.options.inject?.()
  if (face === undefined) throw new Error('row registration carries no inject face')
  return face.setCardBlur
}

describe('dsh-gaussian-blur settings integration', () => {
  it('publishes the default blur radius when nothing is stored', async () => {
    await boot()
    expect(document.documentElement.style.getPropertyValue(VAR)).toBe('18px')
  })

  it('restores a stored preference on boot', async () => {
    await boot(100)
    expect(document.documentElement.style.getPropertyValue(VAR)).toBe('30px')
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe('100')
  })

  it('clamps a corrupt stored value back into bounds', async () => {
    window.localStorage.setItem(STORAGE_KEY, 'not-a-number')
    await boot()
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

  it('projects a slider write onto the CSS variable and persists it', async () => {
    const { registrations } = await boot()
    const setCardBlur = setterOf(registrations)

    setCardBlur(100)
    expect(document.documentElement.style.getPropertyValue(VAR)).toBe('30px')
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe('100')

    setCardBlur(0)
    expect(document.documentElement.style.getPropertyValue(VAR)).toBe('0px')
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe('0')

    setCardBlur(30)
    expect(document.documentElement.style.getPropertyValue(VAR)).toBe('9px')
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe('30')
  })

  it('clamps out-of-range slider writes before persisting', async () => {
    const { registrations } = await boot()
    setterOf(registrations)(250)
    expect(document.documentElement.style.getPropertyValue(VAR)).toBe('30px')
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe('100')
  })

  it('withdraws the variable when the plugin fiber is disposed', async () => {
    const { fiber } = await boot()
    expect(document.documentElement.style.getPropertyValue(VAR)).toBe('18px')

    await fiber.dispose()

    expect(document.documentElement.style.getPropertyValue(VAR)).toBe('')
    // Durability survives disposal: a stored value would be read back on
    // reload; nothing was ever written here, so the key stays absent.
    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull()
  })

  it('ignores a stale field access through the snapshot shape', async () => {
    const { registrations } = await boot()
    const face = registrations[0]?.options.inject?.()
    const snapshot = (face as unknown as { hooks: { cardBlur: { getSnapshot: () => { value: Record<string, number> } } } })
      .hooks.cardBlur.getSnapshot()
    expect(snapshot.value[CARD_BLUR_FIELD]).toBe(60)
  })
})
