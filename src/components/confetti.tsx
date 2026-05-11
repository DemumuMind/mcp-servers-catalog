'use client'

import { useState, useEffect, useCallback } from 'react'

interface Particle {
  id: number
  x: number
  y: number
  color: string
  size: number
  rotation: number
  velocity: { x: number; y: number }
}

export function useConfetti() {
  const [particles, setParticles] = useState<Particle[]>([])
  const [active, setActive] = useState(false)

  const trigger = useCallback((x?: number, y?: number) => {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE']
    const newParticles: Particle[] = Array.from({ length: 30 }, (_, i) => ({
      id: Date.now() + i,
      x: x ?? window.innerWidth / 2,
      y: y ?? window.innerHeight / 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 8 + 4,
      rotation: Math.random() * 360,
      velocity: {
        x: (Math.random() - 0.5) * 10,
        y: (Math.random() - 0.5) * 10 - 5,
      },
    }))

    setParticles(newParticles)
    setActive(true)

    setTimeout(() => {
      setActive(false)
      setParticles([])
    }, 1500)
  }, [])

  return { particles, active, trigger }
}

export function ConfettiCanvas({ particles }: { particles: Particle[] }) {
  if (particles.length === 0) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute animate-confetti"
          style={{
            left: p.x,
            top: p.y,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: '2px',
            transform: `rotate(${p.rotation}deg)`,
            '--velocity-x': `${p.velocity.x}px`,
            '--velocity-y': `${p.velocity.y}px`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  )
}
