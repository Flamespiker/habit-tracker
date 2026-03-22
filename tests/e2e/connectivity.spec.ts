import { test, expect } from '@playwright/test'

test('can reach Supabase from CI network', async () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!url) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set')
  }

  console.log(`[connectivity] fetching ${url}`)
  const res = await fetch(url)
  console.log(`[connectivity] response status: ${res.status}`)

  expect(res.status).toBeGreaterThan(0)
})
