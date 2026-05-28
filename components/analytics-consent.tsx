'use client'

import { useEffect, useState } from 'react'
import { Analytics } from '@vercel/analytics/next'

const CONSENT_KEY = 'bibliopatas_cookie_consent'

export function AnalyticsConsent() {
  const [consentGiven, setConsentGiven] = useState(false)

  useEffect(() => {
    const saved = window.localStorage.getItem(CONSENT_KEY)
    setConsentGiven(saved === 'accepted')
  }, [])

  if (!consentGiven) {
    return null
  }

  return <Analytics />
}
