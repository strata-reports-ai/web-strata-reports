import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
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
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  type SelectChangeEvent,
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
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import ArticleIcon from '@mui/icons-material/Article'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import ReplayIcon from '@mui/icons-material/Replay'
import DeleteIcon from '@mui/icons-material/Delete'
import {
  useListReportsQuery,
  useDeleteReportMutation,
  useGenerateReportMutation,
  useLazyGetReportQuery,
  type Report,
  type ReportStatus,
  type ListReportsParams,
} from '../api/reportSlice'
import { useGetPropertiesQuery } from '../api/propertiesApi'

const STATUS_COLOR: Record<ReportStatus, 'default' | 'info' | 'success' | 'error'> = {
  queued: 'default',
  generating: 'info',
  succeeded: 'success',
  failed: 'error',
}

const STATUS_LABEL: Record<ReportStatus, string> = {
  queued: 'Queued',
  generating: 'Generating',
  succeeded: 'Succeeded',
  failed: 'Failed',
}

const ALL_STATUSES: ReportStatus[] = ['queued', 'generating', 'succeeded', 'failed']

function formatPeriod(periodStart: string, periodEnd: string): string {
  if (!periodStart) return '—'
  const start = new Date(periodStart)
  const month = start.getMonth()
  const year = start.getFullYear()
  const quarter = Math.floor(month / 3) + 1
  const endYear = new Date(periodEnd).getFullYear()
  if (year === endYear) {
    return `Q${quarter} ${year}`
  }
  return `${periodStart} – ${periodEnd}`
}

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString()
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
          startIcon={loading ? <CircularProgress size={16} /> : <ReplayIcon />}
        >
          Regenerate
        </Button>
      </DialogActions>
    </Dialog>
  )
}

interface ReportCardProps {
  report: Report
  onViewPdf: (report: Report) => void
  onRegenerate: (report: Report) => void
  onDelete: (report: Report) => void
  deletingId: string | null
  regeneratingId: string | null
}

function ReportCard({ report, onViewPdf, onRegenerate, onDelete, deletingId, regeneratingId }: ReportCardProps) {
  const isActive = report.status === 'queued' || report.status === 'generating'
  return (
    <Card variant="outlined" sx={{ mb: 1.5 }}>
      <CardContent sx={{ pb: 0 }}>
        <Typography variant="subtitle1" fontWeight={700} noWrap>{report.propertyName}</Typography>
        <Typography variant="body2" color="text.secondary">{formatPeriod(report.periodStart, report.periodEnd)}</Typography>
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
          <Button
            size="small"
            startIcon={<PictureAsPdfIcon />}
            onClick={() => onViewPdf(report)}
          >
            PDF
          </Button>
        )}
        <Button
          size="small"
          startIcon={regeneratingId === report.id ? <CircularProgress size={14} /> : <ReplayIcon />}
          onClick={() => onRegenerate(report)}
          disabled={isActive || regeneratingId === report.id}
        >
          Regenerate
        </Button>
        <Button
          size="small"
          color="error"
          startIcon={deletingId === report.id ? <CircularProgress size={14} /> : <DeleteIcon />}
          onClick={() => onDelete(report)}
          disabled={deletingId === report.id}
        >
          Delete
        </Button>
      </CardActions>
    </Card>
  )
}

export function ReportsListPage() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const propertyIdParam = searchParams.get('propertyId') ?? ''
  const fromParam = searchParams.get('from') ?? ''
  const toParam = searchParams.get('to') ?? ''
  const statusParam = searchParams.get('status') ?? ''
  const cursorParam = searchParams.get('cursor') ?? ''

  const selectedStatuses: ReportStatus[] = statusParam
    ? (statusParam.split(',').filter((s) => ALL_STATUSES.includes(s as ReportStatus)) as ReportStatus[])
    : []

  const [cursorStack, setCursorStack] = useState<string[]>([])
  const [regenTarget, setRegenTarget] = useState<Report | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null)
  const [undoToast, setUndoToast] = useState<{ open: boolean; message: string }>({ open: false, message: '' })

  const queryParams: ListReportsParams = {
    propertyId: propertyIdParam || undefined,
    status: selectedStatuses.length > 0 ? selectedStatuses : undefined,
    from: fromParam || undefined,
    to: toParam || undefined,
    cursor: cursorParam || undefined,
    pageSize: 25,
  }

  const { data, isLoading, isError } = useListReportsQuery(queryParams)
  const { data: propertiesData } = useGetPropertiesQuery({ pageSize: 200 })
  const [deleteReport] = useDeleteReportMutation()
  const [generateReport] = useGenerateReportMutation()
  const [getReport] = useLazyGetReportQuery()

  const reports = data?.items ?? []
  const nextCursor = data?.nextCursor ?? null
  const prevCursor = cursorStack.length > 0 ? cursorStack[cursorStack.length - 1] : null

  const updateSearchParams = useCallback(
    (updates: Record<string, string>) => {
      const next = new URLSearchParams(searchParams)
      for (const [key, value] of Object.entries(updates)) {
        if (value) {
          next.set(key, value)
        } else {
          next.delete(key)
        }
      }
      next.delete('cursor')
      setCursorStack([])
      setSearchParams(next, { replace: true })
    },
    [searchParams, setSearchParams],
  )

  const handlePropertyChange = (value: string) => {
    updateSearchParams({ propertyId: value })
  }

  const handleFromChange = (value: string) => {
    updateSearchParams({ from: value })
  }

  const handleToChange = (value: string) => {
    updateSearchParams({ to: value })
  }

  const handleStatusChange = (event: SelectChangeEvent<ReportStatus[]>) => {
    const val = event.target.value
    const statuses = typeof val === 'string' ? (val.split(',') as ReportStatus[]) : val
    updateSearchParams({ status: statuses.join(',') })
  }

  const handleNextPage = () => {
    if (!nextCursor) return
    setCursorStack((prev) => [...prev, cursorParam])
    const next = new URLSearchParams(searchParams)
    next.set('cursor', nextCursor)
    setSearchParams(next, { replace: true })
  }

  const handlePrevPage = () => {
    const stack = [...cursorStack]
    const prev = stack.pop() ?? ''
    setCursorStack(stack)
    const next = new URLSearchParams(searchParams)
    if (prev) {
      next.set('cursor', prev)
    } else {
      next.delete('cursor')
    }
    setSearchParams(next, { replace: true })
  }

  const handleViewPdf = async (report: Report) => {
    try {
      const fresh = await getReport(report.id).unwrap()
      if (fresh.pdfUrl) {
        window.open(fresh.pdfUrl, '_blank', 'noopener,noreferrer')
      }
    } catch {
      // silently fail; URL may be unavailable
    }
  }

  const handleRegenerateClick = (report: Report) => {
    setRegenTarget(report)
  }

  const handleRegenerateConfirm = async () => {
    if (!regenTarget) return
    setRegeneratingId(regenTarget.id)
    setRegenTarget(null)
    try {
      await generateReport({
        propertyId: regenTarget.propertyId,
        type: regenTarget.type,
        periodStart: regenTarget.periodStart,
        periodEnd: regenTarget.periodEnd,
      }).unwrap()
    } finally {
      setRegeneratingId(null)
    }
  }

  const handleDelete = async (report: Report) => {
    setDeletingId(report.id)
    try {
      await deleteReport(report.id).unwrap()
      setUndoToast({ open: true, message: `Report deleted` })
    } finally {
      setDeletingId(null)
    }
  }

  useEffect(() => {
    setCursorStack([])
  }, [propertyIdParam, fromParam, toParam, statusParam])

  const isOnFirstPage = cursorStack.length === 0 && !cursorParam
  const hasPrev = !isOnFirstPage || prevCursor !== null
  const showPagination = nextCursor || hasPrev

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="h5">Reports</Typography>
        <Button variant="contained" onClick={() => navigate('/reports/new')}>
          Generate Report
        </Button>
      </Stack>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mb: 2, flexWrap: 'wrap' }}>
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>Property</InputLabel>
          <Select
            value={propertyIdParam}
            label="Property"
            onChange={(e) => handlePropertyChange(e.target.value)}
          >
            <MenuItem value="">All properties</MenuItem>
            {propertiesData?.items.map((p) => (
              <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          label="From"
          type="date"
          size="small"
          value={fromParam}
          onChange={(e) => handleFromChange(e.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
          sx={{ minWidth: 150 }}
        />

        <TextField
          label="To"
          type="date"
          size="small"
          value={toParam}
          onChange={(e) => handleToChange(e.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
          sx={{ minWidth: 150 }}
        />

        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>Status</InputLabel>
          <Select<ReportStatus[]>
            multiple
            value={selectedStatuses}
            onChange={handleStatusChange}
            input={<OutlinedInput label="Status" />}
            renderValue={(selected) => selected.map((s) => STATUS_LABEL[s]).join(', ')}
          >
            {ALL_STATUSES.map((s) => (
              <MenuItem key={s} value={s}>{STATUS_LABEL[s]}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      {isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to load reports. Please try again.
        </Alert>
      )}

      {!isLoading && !isError && reports.length === 0 && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            py: 8,
            gap: 2,
          }}
        >
          <ArticleIcon sx={{ fontSize: 64, color: 'text.disabled' }} />
          <Typography variant="h6" color="text.secondary">
            No reports yet
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Generate your first report to get started.
          </Typography>
          <Button variant="contained" onClick={() => navigate('/reports/new')}>
            Generate your first report
          </Button>
        </Box>
      )}

      {isMobile && !isLoading && reports.length > 0 && (
        <Box>
          {reports.map((report) => (
            <ReportCard
              key={report.id}
              report={report}
              onViewPdf={handleViewPdf}
              onRegenerate={handleRegenerateClick}
              onDelete={handleDelete}
              deletingId={deletingId}
              regeneratingId={regeneratingId}
            />
          ))}
        </Box>
      )}

      {(!isMobile || isLoading) && (isLoading || reports.length > 0) && (
        <TableContainer component={Card} variant="outlined" sx={{ overflowX: 'auto' }}>
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
                      {Array.from({ length: 5 }).map((_c, j) => (
                        <TableCell key={j}>
                          <Skeleton variant="text" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                : reports.map((report) => {
                    const isActive = report.status === 'queued' || report.status === 'generating'
                    return (
                      <TableRow key={report.id} hover>
                        <TableCell>
                          <Typography variant="body2" noWrap sx={{ maxWidth: { xs: 100, sm: 200, md: 280 } }}>
                            {report.propertyName}
                          </Typography>
                        </TableCell>
                        <TableCell>{formatPeriod(report.periodStart, report.periodEnd)}</TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatDateTime(report.createdAt)}</TableCell>
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
                              <Button
                                size="small"
                                variant="outlined"
                                startIcon={<PictureAsPdfIcon />}
                                onClick={() => handleViewPdf(report)}
                              >
                                View PDF
                              </Button>
                            )}
                            <Button
                              size="small"
                              startIcon={regeneratingId === report.id ? <CircularProgress size={14} /> : <ReplayIcon />}
                              onClick={() => handleRegenerateClick(report)}
                              disabled={isActive || regeneratingId === report.id}
                            >
                              Regenerate
                            </Button>
                            <Button
                              size="small"
                              color="error"
                              startIcon={deletingId === report.id ? <CircularProgress size={14} /> : <DeleteIcon />}
                              onClick={() => handleDelete(report)}
                              disabled={deletingId === report.id}
                            >
                              Delete
                            </Button>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    )
                  })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {showPagination && (
        <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mt: 2 }}>
          <Button
            variant="outlined"
            size="small"
            onClick={handlePrevPage}
            disabled={isOnFirstPage && !prevCursor}
          >
            Previous
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={handleNextPage}
            disabled={!nextCursor}
          >
            Next
          </Button>
        </Stack>
      )}

      <RegenerateDialog
        open={regenTarget !== null}
        onConfirm={handleRegenerateConfirm}
        onCancel={() => setRegenTarget(null)}
        loading={regeneratingId !== null}
      />

      <Snackbar
        open={undoToast.open}
        autoHideDuration={5000}
        onClose={() => setUndoToast({ open: false, message: '' })}
        message={undoToast.message}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  )
}
