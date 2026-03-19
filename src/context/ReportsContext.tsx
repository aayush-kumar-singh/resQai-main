import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { Report } from '../types/report'

interface ReportsContextValue {
  reports: Report[]
  addReport: (report: Report) => void
}

const ReportsContext = createContext<ReportsContextValue>({
  reports: [],
  addReport: () => {},
})

export const useSharedReports = () => useContext(ReportsContext)

export const ReportsProvider = ({ children }: { children: ReactNode }) => {
  const [reports, setReports] = useState<Report[]>([])

  const addReport = useCallback((report: Report) => {
    setReports(prev => [report, ...prev])
  }, [])

  return (
    <ReportsContext.Provider value={{ reports, addReport }}>
      {children}
    </ReportsContext.Provider>
  )
}
