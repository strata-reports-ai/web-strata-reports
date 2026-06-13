import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  Skeleton,
  Alert,
} from '@mui/material'
import DownloadIcon from '@mui/icons-material/Download'
import ReplayIcon from '@mui/icons-material/Replay'
import UploadFileIcon from '@mui/icons-material/UploadFile'
import type { SelectChangeEvent } from '@mui/material'
import {
  useListImportsQuery,
  useReprocessImportMutation,
  useLazyGetDownloadUrlQuery,
} from '../api/importSlice'
import type { ImportStatus, ImportType, ImportRow } from '../api/importSlice'
import { ImportDetailDrawer } from '../components/ImportDetailDrawer'
import { EmptyState } from '../components/common/EmptyState'

const STATUS_COLOR: Record<ImportStatus, 'default' | 'info' | 'success' | 'error' | 'warning'> = {
  pending: 'default',
  processing: 'info',
  succeeded: 'success',
  failed: 'error',
  partial: 'warning',
}

const IMPORT_TYPES: ImportType[] = ['Revenue', 'Expenses', 'Tasks', 'Reviews', 'Inspections']

export function ImportsPage() {
  const [typeFilter, setTypeFilter] = useState<ImportType | ''>('')
  const [propertyFilter, setPropertyFilter] = useState('')
  const [selectedRow, setSelectedRow] = useState<ImportRow | null>(null)

  const { data: imports, isLoading, isError } = useListImportsQuery({
    type: typeFilter || undefined,
    propertyId: propertyFilter || undefined,
  })

  const navigate = useNavigate()
  const [reprocess] = useReprocessImportMutation()
  const [triggerDownload] = useLazyGetDownloadUrlQuery()

  const handleReprocess = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    await reprocess(id)
  }

  const handleDownload = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    const result = await triggerDownload(id)
    if (result.data?.url) {
      const url = result.data.url
      if (!url.startsWith('https://')) return
      const a = document.createElement('a')
      a.href = url
      a.download = ''
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    }
  }

  const propertyIds = imports
    ? [...new Set(imports.map((r) => r.propertyId))]
    : []

  const propertyNameById = imports
    ? Object.fromEntries(imports.map((r) => [r.propertyId, r.propertyName]))
    : {}

  return (
    <Box>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        flexWrap="wrap"
        gap={1}
        sx={{ mb: 2 }}
      >
        <Typography variant="h5">Import History</Typography>
        <Button
          variant="contained"
          startIcon={<UploadFileIcon />}
          onClick={() => navigate('/imports/upload')}
          sx={{ minHeight: 44 }}
        >
          Upload CSV
        </Button>
      </Stack>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }} useFlexGap flexWrap="wrap">
        <FormControl size="small" sx={{ width: { xs: '100%', sm: 'auto' }, minWidth: { sm: 160 } }}>
          <InputLabel>Type</InputLabel>
          <Select
            value={typeFilter}
            label="Type"
            onChange={(e: SelectChangeEvent) => setTypeFilter(e.target.value as ImportType | '')}
          >
            <MenuItem value="">All</MenuItem>
            {IMPORT_TYPES.map((t) => (
              <MenuItem key={t} value={t}>{t}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ width: { xs: '100%', sm: 'auto' }, minWidth: { sm: 180 } }}>
          <InputLabel>Property</InputLabel>
          <Select
            value={propertyFilter}
            label="Property"
            onChange={(e: SelectChangeEvent) => setPropertyFilter(e.target.value)}
          >
            <MenuItem value="">All</MenuItem>
            {propertyIds.map((pid) => (
              <MenuItem key={pid} value={pid}>{propertyNameById[pid]}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      {isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to load imports. Please try again.
        </Alert>
      )}

      {!isLoading && !isError && imports?.length === 0 && (
        <EmptyState
          icon={<UploadFileIcon sx={{ fontSize: 56 }} />}
          title="No imports yet"
          description="Upload your first CSV to bring revenue, expenses, or task data into Strata Reports."
          ctaLabel="Upload your first CSV"
          ctaHref="/imports/upload"
        />
      )}

      {(isLoading || (imports && imports.length > 0)) && (
        <TableContainer
          component={Paper}
          sx={{ overflowX: 'auto' }}
          data-tour="imports-table"
        >
          <Table size="small" aria-label="imports table">
            <TableHead>
              <TableRow>
                <TableCell>File Name</TableCell>
                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Type</TableCell>
                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Property</TableCell>
                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Uploaded At</TableCell>
                <TableCell>Status</TableCell>
                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Records</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 7 }).map((__, j) => (
                        <TableCell key={j}>
                          <Skeleton variant="text" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                : imports!.map((row) => (
                    <TableRow
                      key={row.id}
                      hover
                      onClick={() => setSelectedRow(row)}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell>
                        <Typography variant="body2" noWrap sx={{ maxWidth: { xs: 120, sm: 200 } }}>
                          {row.fileName}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                        {row.importType}
                      </TableCell>
                      <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                        {row.propertyName}
                      </TableCell>
                      <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                        {new Date(row.uploadedAt).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={row.status}
                          color={STATUS_COLOR[row.status]}
                          size="small"
                          sx={{ textTransform: 'capitalize' }}
                        />
                      </TableCell>
                      <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                        {row.recordsImported} / {row.totalRecords}
                      </TableCell>
                      <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                          <Tooltip title="Download original file">
                            <IconButton
                              size="small"
                              onClick={(e) => handleDownload(e, row.id)}
                              aria-label="download"
                            >
                              <DownloadIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          {(row.status === 'failed' || row.status === 'partial') && (
                            <Tooltip title="Re-process">
                              <IconButton
                                size="small"
                                onClick={(e) => handleReprocess(e, row.id)}
                                aria-label="reprocess"
                                color="warning"
                              >
                                <ReplayIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <ImportDetailDrawer
        importRow={selectedRow}
        onClose={() => setSelectedRow(null)}
      />
    </Box>
  )
}
