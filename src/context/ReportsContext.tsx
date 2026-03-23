import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { Report } from '../types/report'

interface ReportsContextValue {
  reports: Report[]
  addReport: (report: Report) => void
  /** Update an existing report's fields (e.g. merge peopleAffected) */
  updateReport: (id: string, patch: Partial<Report>) => void
}

const ReportsContext = createContext<ReportsContextValue>({
  reports: [],
  addReport: () => {},
  updateReport: () => {},
})

export const useSharedReports = () => useContext(ReportsContext)

export const ReportsProvider = ({ children }: { children: ReactNode }) => {
  const [reports, setReports] = useState<Report[]>([])

  const addReport = useCallback((report: Report) => {
    setReports(prev => [report, ...prev])
  }, [])

  const updateReport = useCallback((id: string, patch: Partial<Report>) => {
    setReports(prev =>
      prev.map(r => (r.id === id ? { ...r, ...patch } : r)),
    )
  }, [])

  return (
    <ReportsContext.Provider value={{ reports, addReport, updateReport }}>
      {children}
    </ReportsContext.Provider>
  )
}
