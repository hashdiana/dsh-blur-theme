/**
 * Test-side double of the browser module loader (window.__ModuleLoader__):
 * evaluates installed plugin client bundles (the closure-factory artifacts in
 * the '@deepseek-ai/dsh-client-<pkg>/lib/client.js' files) against the real
 * platform modules, so specs can mount the real SlotRegistry / LocaleRuntime
 * on a cordis Context. The platform table mirrors PLATFORM_MODULES plus the
 * runtime exemption; plugin specifiers resolve to their bundles exactly like
 * the browser's frozen table.
 */
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import * as cordisModule from '@deepseek-ai/cordis'
import * as slotsModule from '@deepseek-ai/dsh-client-ui-slots'
import * as reactModule from 'react'
import * as jsxRuntimeModule from 'react/jsx-runtime'

const nodeRequire = createRequire(import.meta.url)

/**
 * Specifier → real module (the frozen platform table's test double).
 * ui-primitives is stubbed: the locale bundle binds it at factory time but
 * the LocaleRuntime path never reads it, and importing the real package
 * drags katex/shiki CSS through Node's module loader.
 */
const PLATFORM: Record<string, unknown> = {
  '@deepseek-ai/cordis': cordisModule,
  '@deepseek-ai/dsh-client-ui-slots': slotsModule,
  'react': reactModule,
  'react/jsx-runtime': jsxRuntimeModule,
  '@deepseek-ai/dsh-client-ui-primitives': {},
}

const loaded = new Map<string, Record<string, unknown>>()

/**
 * Load one plugin bundle by package name (the './client' export).
 * @param id - package name, e.g. '@deepseek-ai/dsh-client-runtime'.
 * @returns the bundle's exports object.
 */
export function clientModule(id: string): Record<string, unknown> {
  const existing = loaded.get(id)
  if (existing !== undefined) return existing

  const file = nodeRequire.resolve(`${id}/client`)
  const code = readFileSync(file, 'utf8')
  const exportsObject: Record<string, unknown> = {}
  loaded.set(id, exportsObject)

  const loader = {
    load({ factory }: { id: string; factory: (require: (spec: string) => unknown) => Record<string, unknown> }) {
      const requireFromTable = (spec: string): unknown => {
        const platform = PLATFORM[spec]
        if (platform !== undefined) return platform
        // '@deepseek-ai/dsh-x/client' specifiers resolve to that package's bundle.
        if (spec.endsWith('/client')) return clientModule(spec.slice(0, -'/client'.length))
        throw new Error(`test loader: unknown specifier ${spec}`)
      }
      Object.assign(exportsObject, factory(requireFromTable))
      return exportsObject
    },
  }
  ;(globalThis as { window: { __ModuleLoader__: unknown } }).window.__ModuleLoader__ = loader
  // The bundle text is plain JS; indirect eval keeps its vars out of this scope.
  ;(0, eval)(code)
  return exportsObject
}
