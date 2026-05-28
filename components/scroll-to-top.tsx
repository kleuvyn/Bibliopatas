"use client"

import { useEffect, useState } from "react"
import { ArrowUp } from "lucide-react"

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener("scroll", toggleVisibility)
    return () => window.removeEventListener("scroll", toggleVisibility)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  if (!isVisible) return null

  return (
    <button
      onClick={scrollToTop}
      aria-label="Voltar para o topo"
      className="fixed bottom-8 right-8 z-50 flex h-12 w-12 items-center justify-center rounded-full border border-[#8C7B6E]/30 bg-[#FAFAF5] text-[#4A443F] shadow-sm backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-[#8C7B6E] hover:text-[#FAFAF5] focus:outline-none focus:ring-2 focus:ring-[#8C7B6E] focus:ring-offset-2 focus:ring-offset-[#FAFAF5]"
    >
      <ArrowUp className="h-5 w-5" />
    </button>
  )
}