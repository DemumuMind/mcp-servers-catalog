import { describe, expect, it } from 'vitest'

import { buildContentSecurityPolicy } from './security-headers'

describe('buildContentSecurityPolicy', () => {
  it('allows Next dev inline bootstrap scripts only in development', () => {
    expect(buildContentSecurityPolicy('development')).toMatch(/script-src[^;]*'unsafe-inline'/)
    expect(buildContentSecurityPolicy('production')).not.toMatch(/script-src[^;]*'unsafe-inline'/)
  })
})
