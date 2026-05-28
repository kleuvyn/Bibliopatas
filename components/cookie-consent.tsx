'use client'

import { useEffect, useState } from 'react'

const CONSENT_KEY = 'bibliopatas_cookie_consent'

export function CookieConsent() {
  const [status, setStatus] = useState<'accepted' | 'declined' | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const saved = window.localStorage.getItem(CONSENT_KEY)
    if (saved === 'accepted' || saved === 'declined') {
      setStatus(saved)
      setVisible(false)
    } else {
      setVisible(true)
    }
  }, [])

  const handleChoice = (choice: 'accepted' | 'declined') => {
    window.localStorage.setItem(CONSENT_KEY, choice)
    setStatus(choice)
    setVisible(false)
    setTimeout(() => setVisible(false), 100)
  }

  if (!visible) {
    return null
  }

  return (
    <div className="fixed inset-x-4 bottom-4 z-50 rounded-3xl border border-border/80 bg-background/95 p-4 shadow-xl backdrop-blur-xl sm:inset-x-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2 text-sm text-foreground/90">
          <p className="font-medium">Proteção de dados e LGPD</p>
          <p className="text-xs text-muted-foreground">
            Este é um catálogo de livros usados e valores. Usamos cookies apenas para salvar sua escolha e melhorar a navegação.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 justify-end">
          <button
            type="button"
            onClick={() => handleChoice('declined')}
            className="rounded-full border border-border bg-transparent px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground transition hover:bg-border/50"
          >
            Recusar
          </button>
          <button
            type="button"
            onClick={() => handleChoice('accepted')}
            className="rounded-full bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-background transition hover:brightness-110"
          >
            Aceitar
          </button>
        </div>
      </div>
    </div>
  )
}
