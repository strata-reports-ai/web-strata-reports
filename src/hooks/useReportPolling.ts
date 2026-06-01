import { useState, useEffect, useRef } from 'react'
import { useGetReportQuery } from '../api/reportSlice'
import type { ReportStatus } from '../api/reportSlice'

const POLL_INTERVAL_MS = 3000
const POLL_TIMEOUT_MS = 5 * 60 * 1000

export type PollingState = 'polling' | 'succeeded' | 'failed' | 'timeout' | 'error'

export interface UseReportPollingResult {
  status: ReportStatus | undefined
  pollingState: PollingState
  errorMessage: string | null
}

export function useReportPolling(reportId: string | null): UseReportPollingResult {
  const [timedOut, setTimedOut] = useState(false)
  const [pollingState, setPollingState] = useState<PollingState>('polling')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const startTimeRef = useRef(Date.now())

  const { data: report, isError } = useGetReportQuery(reportId ?? '', {
    pollingInterval: timedOut || pollingState !== 'polling' ? 0 : POLL_INTERVAL_MS,
    skip: !reportId || timedOut || pollingState !== 'polling',
  })

  useEffect(() => {
    if (!report) return
    if (report.status === 'succeeded') {
      setPollingState('succeeded')
      return
    }
    if (report.status === 'failed') {
      setErrorMessage(report.errorMessage ?? 'Report generation failed.')
      setPollingState('failed')
      return
    }
    if (Date.now() - startTimeRef.current >= POLL_TIMEOUT_MS) {
      setTimedOut(true)
      setPollingState('timeout')
    }
  }, [report])

  useEffect(() => {
    if (!reportId) return
    const timer = setTimeout(() => {
      setTimedOut(true)
      setPollingState('timeout')
    }, POLL_TIMEOUT_MS)
    return () => clearTimeout(timer)
  }, [reportId])

  useEffect(() => {
    if (isError) {
      setPollingState('error')
    }
  }, [isError])

  return {
    status: report?.status,
    pollingState,
    errorMessage,
  }
}
