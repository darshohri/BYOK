'use client'

import { Suspense, lazy } from 'react'
const Spline = lazy(() => import('@splinetool/react-spline'))

interface SplineSceneProps {
  scene: string
  className?: string
  onLoad?: (spline: any) => void
}

export function SplineScene({ scene, className, onLoad }: SplineSceneProps) {
  return (
    <Spline scene={scene} className={className} onLoad={onLoad} />
  )
}
