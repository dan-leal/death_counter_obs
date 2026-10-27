'use client'

import { useEffect, useState } from 'react'
import { Skull } from 'lucide-react'

export default function OverlayPage() {
  const [deaths, setDeaths] = useState(0)

  useEffect(() => {
    let active = true

    const loadDeaths = async () => {
      try {
        const result = await fetch('/api/deaths', { cache: 'no-store' })
        if (!result.ok) throw new Error('Não foi possível carregar o contador.')
        const data = await result.json()
        if (active && Number.isInteger(data.deaths) && data.deaths >= 0) {
          setDeaths(data.deaths)
        }
      } catch (error) {
        console.error(error)
      }
    }

    loadDeaths()
    const interval = window.setInterval(loadDeaths, 1000)
    return () => {
      active = false
      window.clearInterval(interval)
    }
  }, [])

  return (
    <main className="overlay-page">
      <div className="overlay-counter" aria-label={`${deaths} mortes`}>
        <div className="overlay-label"><Skull size={18} /> MORTES</div>
        <div className="overlay-number">{String(deaths).padStart(2, '0')}</div>
        <div className="overlay-line" />
      </div>
    </main>
  )
}
