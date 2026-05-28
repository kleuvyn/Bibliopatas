'use client'

import { useEffect, useState } from 'react'
import { BookOpen, Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface CatalogStatsResponse {
  total: number
  available: number
  sold: number
}

const initialStats: CatalogStatsResponse = {
  total: 0,
  available: 0,
  sold: 0,
}

export function CatalogStats() {
  const [stats, setStats] = useState<CatalogStatsResponse>(initialStats)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    let intervalId: ReturnType<typeof setInterval> | undefined

    const loadStats = async () => {
      try {
        const response = await fetch('/api/books/stats', { cache: 'no-store' })
        const data = (await response.json()) as CatalogStatsResponse
        if (active && typeof data?.total === 'number') {
          setStats({
            total: data.total,
            available: data.available,
            sold: data.sold,
          })
        }
      } catch {
        // Mantem o ultimo valor exibido.
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void loadStats()
    intervalId = setInterval(loadStats, 30000)

    return () => {
      active = false
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [])

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
      <Card>
        <CardContent className="p-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">total no acervo</p>
            <p className="text-3xl font-serif text-foreground mt-1">{loading ? '...' : stats.total}</p>
          </div>
          <BookOpen className="w-7 h-7 text-primary/70" />
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">disponíveis agora</p>
          <p className="text-3xl font-serif text-green-600 mt-1">{loading ? '...' : stats.available}</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">vendidos</p>
          <p className="text-3xl font-serif text-muted-foreground mt-1">{loading ? '...' : stats.sold}</p>
        </CardContent>
      </Card>
    </div>
  )
}
