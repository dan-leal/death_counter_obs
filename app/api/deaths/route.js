import { kv } from '@vercel/kv'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const DEATHS_KEY = 'deaths'

function response(deaths) {
  return Response.json({ deaths }, {
    headers: {
      'Cache-Control': 'no-store, max-age=0',
    },
  })
}

function normalizeDeaths(value) {
  const deaths = Number(value)
  return Number.isInteger(deaths) && deaths >= 0 ? deaths : null
}

export async function GET() {
  const deaths = normalizeDeaths(await kv.get(DEATHS_KEY)) ?? 0
  return response(deaths)
}

export async function POST(request) {
  const body = await request.json().catch(() => null)
  const action = body?.action

  if (!['increment', 'decrement', 'reset', 'set'].includes(action)) {
    return Response.json({ error: 'Ação inválida.' }, { status: 400 })
  }

  if (action === 'increment') {
    await kv.incr(DEATHS_KEY)
  } else if (action === 'decrement') {
    const current = normalizeDeaths(await kv.get(DEATHS_KEY)) ?? 0
    await kv.set(DEATHS_KEY, Math.max(0, current - 1))
  } else if (action === 'reset') {
    await kv.set(DEATHS_KEY, 0)
  } else {
    const deaths = normalizeDeaths(body?.value)
    if (deaths === null) {
      return Response.json({ error: 'O valor deve ser um inteiro maior ou igual a zero.' }, { status: 400 })
    }
    await kv.set(DEATHS_KEY, deaths)
  }

  return response(normalizeDeaths(await kv.get(DEATHS_KEY)) ?? 0)
}
