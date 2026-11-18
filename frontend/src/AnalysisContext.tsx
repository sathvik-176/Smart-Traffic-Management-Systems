import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'
import { uploadImages } from './api'
import type { AnalyzeResponse, Direction } from './api'

interface AnalysisState {
  files: Partial<Record<Direction, File>>
  setFile: (d: Direction, f: File | undefined) => void
  result: AnalyzeResponse | null
  loading: boolean
  error: string | null
  analyze: () => Promise<void>
}

const AnalysisContext = createContext<AnalysisState | null>(null)

const DIRECTIONS: Direction[] = ['north', 'south', 'east', 'west']

export function AnalysisProvider({ children }: { children: ReactNode }) {
  const [files, setFiles] = useState<Partial<Record<Direction, File>>>({})
  const [result, setResult] = useState<AnalyzeResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const setFile = (d: Direction, f: File | undefined) =>
    setFiles((prev) => ({ ...prev, [d]: f }))

  const analyze = async () => {
    if (!DIRECTIONS.every((d) => files[d])) return
    setLoading(true)
    setError(null)
    try {
      setResult(await uploadImages(files as Record<Direction, File>))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnalysisContext.Provider
      value={{ files, setFile, result, loading, error, analyze }}
    >
      {children}
    </AnalysisContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAnalysis() {
  const ctx = useContext(AnalysisContext)
  if (!ctx) throw new Error('useAnalysis must be used inside AnalysisProvider')
  return ctx
}