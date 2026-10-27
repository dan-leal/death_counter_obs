'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Minus, Plus, RotateCcw, Settings2, Radio, Copy, Check, Skull } from 'lucide-react'

export default function Page() {
  const router = useRouter()
  const [deaths, setDeaths] = useState(0)
  const [copied, setCopied] = useState(false)
  const [overlayMode, setOverlayMode] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [counterLabel, setCounterLabel] = useState('MORTES')
  const [overlayUrl, setOverlayUrl] = useState('/overlay')

  useEffect(() => {
    setOverlayUrl(`${window.location.origin}/overlay`)
  }, [])

  useEffect(() => {
    let active = true
    const loadDeaths = async () => {
      const result = await fetch('/api/deaths', { cache: 'no-store' })
      if (!result.ok) throw new Error('Não foi possível carregar o contador.')
      const data = await result.json()
      if (active) setDeaths(data.deaths)
    }
    loadDeaths().catch((error) => console.error(error))
    const interval = window.setInterval(() => loadDeaths().catch((error) => console.error(error)), 1000)
    return () => {
      active = false
      window.clearInterval(interval)
    }
  }, [])

  const applyAction = async (action: 'increment' | 'decrement' | 'reset') => {
    const result = await fetch('/api/deaths', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    })
    if (!result.ok) throw new Error('Não foi possível atualizar o contador.')
    const data = await result.json()
    setDeaths(data.deaths)
  }

  const changeDeaths = (amount: number) => {
    applyAction(amount > 0 ? 'increment' : 'decrement').catch((error) => console.error(error))
  }
  const resetDeaths = () => applyAction('reset').catch((error) => console.error(error))

  const copyUrl = async () => {
    await navigator.clipboard?.writeText(`${window.location.origin}/overlay`)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }

  if (overlayMode) {
    return (
      <main className="overlay-page">
        <div className="overlay-counter" aria-label={`${deaths} mortes`}>
          <div className="overlay-label"><Skull size={18} /> {counterLabel || 'MORTES'}</div>
          <div className="overlay-number">{String(deaths).padStart(2, '0')}</div>
          <div className="overlay-line" />
        </div>
        <button className="overlay-exit" onClick={() => { setOverlayMode(false); router.push('/') }}>Voltar ao painel</button>
      </main>
    )
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark"><Skull size={17} /></span><span>DEATH<span className="brand-accent">/</span>COUNT</span></div>
        <div className="sidebar-status"><span className="live-dot" /> Overlay ativo</div>
        <nav className="nav-list" aria-label="Navegação principal">
          <button className={`nav-item ${!settingsOpen ? 'active' : ''}`} onClick={() => setSettingsOpen(false)}><Radio size={17} /> Contador</button>
          <button className={`nav-item ${settingsOpen ? 'active' : ''}`} onClick={() => setSettingsOpen(true)}><Settings2 size={17} /> Configurações</button>
        </nav>
        <div className="sidebar-footer"><span className="status-dot" /> Pronto para stream</div>
      </aside>

      <section className="content">
        <header className="topbar"><div><p className="eyebrow">PAINEL DE CONTROLE</p><h1>Death counter</h1></div><button className="ghost-button" onClick={() => setOverlayMode(true)}><Radio size={16} /> Abrir overlay</button></header>
        {settingsOpen ? (
          <section className="settings-card">
            <div className="section-title"><span className="step">01</span><div><h2>Personalizar overlay</h2><p>Escolha o texto que aparece ao lado do contador no OBS.</p></div></div>
            <label className="settings-field" htmlFor="counter-label"><span>Texto do contador</span><small>Exemplo: Mortes:, Kills ou Tentativas</small><input id="counter-label" value={counterLabel} onChange={(event) => setCounterLabel(event.target.value)} maxLength={24} placeholder="MORTES" /></label>
            <div className="settings-preview"><p className="eyebrow">PRÉVIA</p><div className="mini-overlay"><span>{counterLabel || 'MORTES'}</span><strong>{String(deaths).padStart(2, '0')}</strong></div></div>
            <p className="settings-note">O rótulo será atualizado automaticamente no overlay que você adicionou ao OBS.</p>
          </section>
        ) : (
        <>
        <div className="workspace">
          <section className="counter-card">
            <div className="card-header"><div><p className="eyebrow">CONTADOR ATUAL</p><p className="helper">Este número aparece no seu overlay do OBS.</p></div><span className="live-pill"><span className="live-dot" /> LIVE</span></div>
            <div className="big-number">{String(deaths).padStart(2, '0')}</div>
            <div className="counter-actions"><button className="action-button decrease" onClick={() => changeDeaths(-1)} aria-label="Diminuir uma morte"><Minus size={24} /></button><button className="action-button increase" onClick={() => changeDeaths(1)} aria-label="Adicionar uma morte"><Plus size={24} /></button></div>
            <button className="reset-button" onClick={resetDeaths}><RotateCcw size={15} /> Zerar contador</button>
          </section>
          <section className="setup-card">
            <div className="section-title"><span className="step">01</span><div><h2>Conectar ao OBS</h2><p>Adicione este overlay como fonte de navegador.</p></div></div>
            <div className="instruction"><span>1</span><p>No OBS, clique em <strong>+</strong> em Fontes e escolha <strong>Navegador</strong>.</p></div>
            <div className="instruction"><span>2</span><p>Use a URL abaixo e defina o tamanho como <strong>800 × 240</strong>.</p></div>
            <div className="url-box"><code>{overlayUrl}</code><button onClick={copyUrl} aria-label="Copiar URL">{copied ? <Check size={16} /> : <Copy size={16} />}</button></div>
            <button className="preview-button" onClick={() => setOverlayMode(true)}><Radio size={16} /> Visualizar overlay</button>
          </section>
        </div>
        <section className="shortcuts"><p className="eyebrow">ATALHOS RÁPIDOS</p><div className="shortcut-row"><span><kbd>+</kbd> Adicionar morte</span><span><kbd>−</kbd> Remover morte</span><span><kbd>R</kbd> Zerar contador</span></div></section>
        </>
        )}
      </section>
    </main>
  )
}
