import { useState, useCallback, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import {
  Alert,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Paper,
  Select,
  Skeleton,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import type { SelectChangeEvent } from '@mui/material'
import ArticleIcon from '@mui/icons-material/Article'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import ReplayIcon from '@mui/icons-material/Replay'
import DeleteIcon from '@mui/icons-material/Delete'
import { EmptyState } from '../components/common/EmptyState'
import {
  useListReportsQuery,
  useLazyGetReportQuery,
  useGenerateReportMutation,
  useDeleteReportMutation,
  type Report,
  type ReportStatus,
  type ListReportsParams,
} from '../api/reportSlice'
import { useGetPropertiesQuery } from '../api/propertiesApi'
import { parseDateOnly } from '../utils/dates'

const STATUS_COLOR: Record<ReportStatus, 'default' | 'info' | 'success' | 'error' | 'warning'> = {
  queued: 'default',
  generating: 'info',
  processing: 'info',
  succeeded: 'success',
  failed: 'error',
}

const STATUS_LABEL: Record<ReportStatus, string> = {
  queued: 'Queued',
  generating: 'Generating',
  processing: 'Generating',
  succeeded: 'Succeeded',
  failed: 'Failed',
}

const ALL_STATUSES: ReportStatus[] = ['queued', 'generating', 'succeeded', 'failed']

function formatPeriod(periodStart: string, periodEnd: string): string {
  const start = parseDateOnly(periodStart)
  const end = parseDateOnly(periodEnd)
  const startQ = Math.ceil((start.getMonth() + 1) / 3)
  const endQ = Math.ceil((end.getMonth() + 1) / 3)
  const startYear = start.getFullYear()
  const endYear = end.getFullYear()
  if (startYear === endYear && startQ === endQ) {
    return `Q${startQ} ${startYear}`
  }
  return `${start.toLocaleDateString(undefined, { month: 'short', year: 'numeric' })} – ${end.toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}`
}

interface RegenerateDialogProps {
  open: boolean
  onConfirm: () => void
  onCancel: () => void
  loading: boolean
}

function RegenerateDialog({ open, onConfirm, onCancel, loading }: RegenerateDialogProps) {
  return (
    <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth>
      <DialogTitle>Regenerate report?</DialogTitle>
      <DialogContent>
        <DialogContentText>
          This will replace the existing report. Continue?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} disabled={loading}>Cancel</Button>
        <Button
          onClick={onConfirm}
          color="primary"
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} /> : undefined}
        >
          Regenerate
        </Button>
      </DialogActions>
    </Dialog>
  )
}

interface ReportCardProps {
  report: Report
  onViewPdf: (id: string) => void
  onRegenerate: (report: Report) => void
  onDelete: (report: Report) => void
  regenerating: boolean
  deleting: boolean
}

function ReportCard({ report, onViewPdf, onRegenerate, onDelete, regenerating, deleting }: ReportCardProps) {
  const isActive = report.status === 'queued' || report.status === 'generating' || report.status === 'processing'

  return (
    <Card variant="outlined" sx={{ mb: 1.5 }}>
      <CardContent sx={{ pb: 0 }}>
        <Typography variant="subtitle1" fontWeight={700} noWrap>
          {report.propertyName}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {formatPeriod(report.periodStart, report.periodEnd)}
        </Typography>
        <Box sx={{ mt: 0.5 }}>
          <Chip
            label={STATUS_LABEL[report.status]}
            color={STATUS_COLOR[report.status]}
            size="small"
          />
        </Box>
      </CardContent>
      <CardActions>
        {report.status === 'succeeded' && (
          <Tooltip title="View PDF">
            <IconButton
              onClick={() => onViewPdf(report.id)}
              aria-label="view pdf"
              sx={{ minWidth: 44, minHeight: 44 }}
            >
              <PictureAsPdfIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
        <Tooltip title={isActive ? 'Already running' : 'Regenerate'}>
          <span>
            <IconButton
              onClick={() => onRegenerate(report)}
              disabled={isActive || regenerating || deleting}
              aria-label="regenerate"
              sx={{ minWidth: 44, minHeight: 44 }}
            >
              <ReplayIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title="Delete">
          <span>
            <IconButton
              color="error"
              onClick={() => onDelete(report)}
              disabled={deleting || regenerating}
              aria-label="delete"
              sx={{ minWidth: 44, minHeight: 44 }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
      </CardActions>
    </Card>
  )
}

export function ReportsListPage() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const propertyId = searchParams.get('propertyId') ?? ''
  const statusParam = searchParams.get('status') ?? ''
  const fromParam = searchParams.get('from') ?? ''
  const toParam = searchParams.get('to') ?? ''
  const cursorParam = searchParams.get('cursor') ?? undefined
  const dirParam = searchParams.get('dir') ?? 'next'

  const selectedStatuses: ReportStatus[] = statusParam
    ? (statusParam.split(',').filter((s) => ALL_STATUSES.includes(s as ReportStatus)) as ReportStatus[])
    : []

  const queryParams: ListReportsParams = {
    propertyId: propertyId || undefined,
    status: selectedStatuses.length > 0 ? selectedStatuses : undefined,
    from: fromParam || undefined,
    to: toParam || undefined,
    cursor: cursorParam,
    pageSize: 25,
  }

  const { data, isLoading, isError } = useListReportsQuery(queryParams)
  const { data: propertiesData } = useGetPropertiesQuery({ pageSize: 200 })
  const [triggerGetReport] = useLazyGetReportQuery()
  const [generateReport] = useGenerateReportMutation()
  const [deleteReport] = useDeleteReportMutation()

  const [regenerateTarget, setRegenerateTarget] = useState<Report | null>(null)
  const [regenerating, setRegenerating] = useState(false)

  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set())
  const [optimisticDeleted, setOptimisticDeleted] = useState<Set<string>>(new Set())
  const [undoTarget, setUndoTarget] = useState<Report | null>(null)
  const [undoTimerId, setUndoTimerId] = useState<ReturnType<typeof setTimeout> | null>(null)

  const [snackMessage, setSnackMessage] = useState<string | null>(null)

  const properties = propertiesData?.items ?? []
  const totalPropertyCount = propertiesData?.totalCount ?? properties.length
  const hasNoProperties = !!propertiesData && totalPropertyCount === 0
  const hasActiveFilters =
    !!propertyId || selectedStatuses.length > 0 || !!fromParam || !!toParam

  const updateFilter = useCallback(
    (updates: Record<string, string>) => {
      const next = new URLSearchParams(searchParams)
      Object.entries(updates).forEach(([key, val]) => {
        if (val) {
          next.set(key, val)
        } else {
          next.delete(key)
        }
      })
      next.delete('cursor')
      next.delete('dir')
      setSearchParams(next)
    },
    [searchParams, setSearchParams],
  )

  const handlePropertyChange = (e: SelectChangeEvent) => {
    updateFilter({ propertyId: e.target.value })
  }

  const handleStatusChange = (e: SelectChangeEvent<string[]>) => {
    const val = e.target.value
    const joined = Array.isArray(val) ? val.join(',') : val
    updateFilter({ status: joined })
  }

  const handleFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateFilter({ from: e.target.value })
  }

  const handleToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateFilter({ to: e.target.value })
  }

  const handleViewPdf = useCallback(
    async (id: string) => {
      const result = await triggerGetReport(id)
      if (result.data?.pdfUrl) {
        window.open(result.data.pdfUrl, '_blank', 'noopener,noreferrer')
      }
    },
    [triggerGetReport],
  )

  const handleRegenerateClick = (report: Report) => {
    setRegenerateTarget(report)
  }

  const handleRegenerateConfirm = async () => {
    if (!regenerateTarget) return
    setRegenerating(true)
    try {
      await generateReport({
        propertyId: regenerateTarget.propertyId,
        type: regenerateTarget.type,
        periodStart: regenerateTarget.periodStart,
        periodEnd: regenerateTarget.periodEnd,
      })
      setSnackMessage('Report queued for regeneration.')
    } catch {
      setSnackMessage('Failed to regenerate report.')
    } finally {
      setRegenerating(false)
      setRegenerateTarget(null)
    }
  }

  const handleRegenerateCancel = () => {
    setRegenerateTarget(null)
  }

  const handleDeleteClick = useCallback(
    (report: Report) => {
      setOptimisticDeleted((prev) => new Set([...prev, report.id]))
      setUndoTarget(report)

      if (undoTimerId) clearTimeout(undoTimerId)

      const timerId = setTimeout(async () => {
        setDeletingIds((prev) => new Set([...prev, report.id]))
        try {
          await deleteReport(report.id)
        } catch {
          setOptimisticDeleted((prev) => {
            const next = new Set(prev)
            next.delete(report.id)
            return next
          })
          setSnackMessage('Failed to delete report.')
        } finally {
          setDeletingIds((prev) => {
            const next = new Set(prev)
            next.delete(report.id)
            return next
          })
        }
        setUndoTarget(null)
        setUndoTimerId(null)
      }, 5000)

      setUndoTimerId(timerId)
    },
    [deleteReport, undoTimerId],
  )

  const handleUndo = useCallback(() => {
    if (undoTimerId) clearTimeout(undoTimerId)
    if (undoTarget) {
      setOptimisticDeleted((prev) => {
        const next = new Set(prev)
        next.delete(undoTarget.id)
        return next
      })
    }
    setUndoTarget(null)
    setUndoTimerId(null)
  }, [undoTimerId, undoTarget])

  useEffect(() => {
    return () => {
      if (undoTimerId) clearTimeout(undoTimerId)
    }
  }, [undoTimerId])

  const handleNextPage = () => {
    if (!data?.nextCursor) return
    const next = new URLSearchParams(searchParams)
    next.set('cursor', data.nextCursor)
    next.set('dir', 'next')
    setSearchParams(next)
  }

  const handlePrevPage = () => {
    if (!data?.prevCursor) return
    const next = new URLSearchParams(searchParams)
    next.set('cursor', data.prevCursor)
    next.set('dir', 'prev')
    setSearchParams(next)
  }

  const visibleReports = (data?.items ?? []).filter((r) => !optimisticDeleted.has(r.id))

  const isReportActive = (r: Report) =>
    r.status === 'queued' || r.status === 'generating' || r.status === 'processing'

  const hasCursor = Boolean(cursorParam)
  const hasNext = Boolean(data?.nextCursor)
  const hasPrev = Boolean(data?.prevCursor) || (hasCursor && dirParam === 'next')

  return (
    <Box>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', sm: 'center' }}
        spacing={1}
        sx={{ mb: 2 }}
      >
        <Typography variant="h5">Reports</Typography>
        <Button
          variant="contained"
          onClick={() => navigate('/reports/new')}
          sx={{ minHeight: 44, width: { xs: '100%', sm: 'auto' } }}
        >
          Generate Report
        </Button>
      </Stack>

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1.5}
        sx={{ mb: 2, flexWrap: 'wrap' }}
        useFlexGap
      >
        <FormControl size="small" sx={{ width: { xs: '100%', sm: 'auto' }, minWidth: { sm: 180 } }}>
          <InputLabel>Property</InputLabel>
          <Select
            value={propertyId}
            label="Property"
            onChange={handlePropertyChange}
          >
            <MenuItem value="">All properties</MenuItem>
            {properties.map((p) => (
              <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ width: { xs: '100%', sm: 'auto' }, minWidth: { sm: 180 } }}>
          <InputLabel>Status</InputLabel>
          <Select
            multiple
            value={selectedStatuses}
            label="Status"
            onChange={handleStatusChange}
            input={<OutlinedInput label="Status" />}
            renderValue={(selected) =>
              (selected as ReportStatus[]).map((s) => STATUS_LABEL[s]).join(', ')
            }
          >
            {ALL_STATUSES.map((s) => (
              <MenuItem key={s} value={s}>{STATUS_LABEL[s]}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          type="date"
          size="small"
          label="From"
          value={fromParam}
          onChange={handleFromChange}
          InputLabelProps={{ shrink: true }}
          sx={{ width: { xs: '100%', sm: 'auto' }, minWidth: { sm: 150 } }}
        />

        <TextField
          type="date"
          size="small"
          label="To"
          value={toParam}
          onChange={handleToChange}
          InputLabelProps={{ shrink: true }}
          sx={{ width: { xs: '100%', sm: 'auto' }, minWidth: { sm: 150 } }}
        />
      </Stack>

      {isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to load reports. Please try again.
        </Alert>
      )}

      {!isLoading && !isError && visibleReports.length === 0 && !hasCursor && !hasActiveFilters && (
        hasNoProperties ? (
          <EmptyState
            icon={<ArticleIcon sx={{ fontSize: 56 }} />}
            title="No reports yet"
            description="You need at least one property before you can generate a report."
            ctaLabel="Add a property first"
            ctaHref="/properties/new"
          />
        ) : (
          <EmptyState
            icon={<ArticleIcon sx={{ fontSize: 56 }} />}
            title="No reports yet"
            description="Generate your first quarterly report from your imported property data."
            ctaLabel="Generate your first report"
            ctaHref="/reports/new"
          />
        )
      )}

      {isMobile ? (
        <>
          {isLoading &&
            Array.from({ length: 5 }).map((_, i) => (
              <Card key={i} variant="outlined" sx={{ mb: 1.5 }}>
                <CardContent>
                  <Skeleton variant="text" width="60%" />
                  <Skeleton variant="text" width="40%" />
                  <Skeleton variant="rectangular" width={80} height={24} sx={{ mt: 0.5, borderRadius: 1 }} />
                </CardContent>
              </Card>
            ))}
          {!isLoading &&
            visibleReports.map((report) => (
              <ReportCard
                key={report.id}
                report={report}
                onViewPdf={handleViewPdf}
                onRegenerate={handleRegenerateClick}
                onDelete={handleDeleteClick}
                regenerating={regenerating}
                deleting={deletingIds.has(report.id)}
              />
            ))}
        </>
      ) : (
        (isLoading || visibleReports.length > 0) && (
          <TableContainer component={Paper} sx={{ overflowX: 'auto' }} data-tour="reports-table">
            <Table size="small" aria-label="reports table">
              <TableHead>
                <TableRow>
                  <TableCell>Property</TableCell>
                  <TableCell>Period</TableCell>
                  <TableCell>Generated At</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        {Array.from({ length: 5 }).map((_u, j) => (
                          <TableCell key={j}>
                            <Skeleton variant="text" />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  : visibleReports.map((report) => {
                      const active = isReportActive(report)
                      return (
                        <TableRow key={report.id} hover>
                          <TableCell>
                            <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                              {report.propertyName}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {formatPeriod(report.periodStart, report.periodEnd)}
                          </TableCell>
                          <TableCell>
                            {new Date(report.createdAt).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={STATUS_LABEL[report.status]}
                              color={STATUS_COLOR[report.status]}
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                              {report.status === 'succeeded' && (
                                <Tooltip title="View PDF">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleViewPdf(report.id)}
                                    aria-label="view pdf"
                                  >
                                    <PictureAsPdfIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}
                              <Tooltip title={active ? 'Already running' : 'Regenerate'}>
                                <span>
                                  <IconButton
                                    size="small"
                                    onClick={() => handleRegenerateClick(report)}
                                    disabled={active || regenerating}
                                    aria-label="regenerate"
                                  >
                                    <ReplayIcon fontSize="small" />
                                  </IconButton>
                                </span>
                              </Tooltip>
                              <Tooltip title="Delete">
                                <span>
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => handleDeleteClick(report)}
                                    disabled={deletingIds.has(report.id)}
                                    aria-label="delete"
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </span>
                              </Tooltip>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      )
                    })}
              </TableBody>
            </Table>
          </TableContainer>
        )
      )}

      {(hasNext || hasPrev) && (
        <Stack direction="row" spacing={1} justifyContent="center" sx={{ mt: 2 }}>
          <Button
            variant="outlined"
            size="small"
            onClick={handlePrevPage}
            disabled={!hasPrev}
          >
            Previous
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={handleNextPage}
            disabled={!hasNext}
          >
            Next
          </Button>
        </Stack>
      )}

      <RegenerateDialog
        open={regenerateTarget !== null}
        onConfirm={handleRegenerateConfirm}
        onCancel={handleRegenerateCancel}
        loading={regenerating}
      />

      <Snackbar
        open={undoTarget !== null}
        autoHideDuration={5000}
        onClose={handleUndo}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        message="Report deleted"
        action={
          <Button color="secondary" size="small" onClick={handleUndo}>
            UNDO
          </Button>
        }
      />

      <Snackbar
        open={snackMessage !== null}
        autoHideDuration={4000}
        onClose={() => setSnackMessage(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackMessage(null)} severity="info" sx={{ width: '100%' }}>
          {snackMessage}
        </Alert>
      </Snackbar>
    </Box>
  )
}
