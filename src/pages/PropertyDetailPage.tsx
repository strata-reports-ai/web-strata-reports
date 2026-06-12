import type { ReactNode } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Alert,
  Box,
  Breadcrumbs,
  Button,
  Chip,
  Divider,
  Link,
  Paper,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'
import EditIcon from '@mui/icons-material/Edit'
import AddchartIcon from '@mui/icons-material/Addchart'
import { useGetPropertyQuery } from '../api/propertiesApi'
import { useListReportsQuery, type ReportStatus } from '../api/reportSlice'
import { useListImportsQuery, type ImportStatus } from '../api/importSlice'

const REPORT_STATUS_COLOR: Record<ReportStatus, 'default' | 'info' | 'success' | 'error' | 'warning'> = {
  queued: 'default',
  generating: 'info',
  processing: 'info',
  succeeded: 'success',
  failed: 'error',
}

function importStatusColor(status: ImportStatus): 'default' | 'success' | 'error' | 'warning' {
  switch (status) {
    case 'succeeded':
      return 'success'
    case 'failed':
      return 'error'
    case 'partial':
      return 'warning'
    default:
      return 'default'
  }
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString()
}

function periodLabel(periodStart: string): string {
  const dt = new Date(periodStart)
  return `Q${Math.floor(dt.getMonth() / 3) + 1} ${dt.getFullYear()}`
}

function MetaRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 0.25, sm: 2 }} sx={{ py: 1 }}>
      <Typography variant="body2" color="text.secondary" sx={{ minWidth: 140 }}>
        {label}
      </Typography>
      <Typography variant="body2">{value}</Typography>
    </Stack>
  )
}

export function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: property, isLoading, isError } = useGetPropertyQuery(id ?? '', { skip: !id })
  const { data: reportsData, isLoading: reportsLoading } = useListReportsQuery(
    { propertyId: id },
    { skip: !id },
  )
  const { data: imports, isLoading: importsLoading } = useListImportsQuery(
    { propertyId: id },
    { skip: !id },
  )

  const reports = reportsData?.items ?? []

  if (isError) {
    return <Alert severity="error">Failed to load property. Please try again.</Alert>
  }

  return (
    <Box sx={{ maxWidth: '100%', overflowX: 'hidden' }}>
      <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 2 }}>
        <Link component="button" variant="body2" underline="hover" color="inherit" onClick={() => navigate('/')}>
          Dashboard
        </Link>
        <Link
          component="button"
          variant="body2"
          underline="hover"
          color="inherit"
          onClick={() => navigate('/properties')}
        >
          Properties
        </Link>
        {isLoading ? (
          <Skeleton variant="text" width={120} />
        ) : (
          <Typography variant="body2" color="text.primary">
            {property?.name}
          </Typography>
        )}
      </Breadcrumbs>

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        spacing={1}
        sx={{ mb: 2 }}
      >
        <Typography variant="h5">{isLoading ? <Skeleton width={220} /> : property?.name}</Typography>
        {!isLoading && property && (
          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Button
              variant="outlined"
              startIcon={<AddchartIcon />}
              onClick={() => navigate('/reports/new')}
              sx={{ minHeight: 44 }}
            >
              Generate Report
            </Button>
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={() => navigate(`/properties/${property.id}/edit`)}
              sx={{ minHeight: 44 }}
            >
              Edit
            </Button>
          </Stack>
        )}
      </Stack>

      <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}>
        {isLoading ? (
          <Stack spacing={1}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} variant="text" />
            ))}
          </Stack>
        ) : property ? (
          <>
            <MetaRow label="Address" value={property.address} />
            <Divider />
            <MetaRow label="City" value={property.city} />
            <Divider />
            <MetaRow label="Owner" value={property.ownerName} />
            <Divider />
            <MetaRow label="Units" value={property.units} />
            <Divider />
            <MetaRow label="Last Report" value={formatDate(property.lastReportDate)} />
            <Divider />
            <MetaRow label="Last Import" value={formatDate(property.lastImportDate)} />
          </>
        ) : null}
      </Paper>

      <Typography variant="h6" sx={{ mb: 1.5 }}>
        Reports
      </Typography>
      <Paper variant="outlined" sx={{ mb: 3 }}>
        {reportsLoading ? (
          <Box sx={{ p: 2 }}>
            <Skeleton variant="text" />
            <Skeleton variant="text" />
          </Box>
        ) : reports.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No reports yet for this property.
            </Typography>
          </Box>
        ) : (
          <Stack divider={<Divider />}>
            {reports.map((r) => (
              <Stack
                key={r.id}
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                spacing={1}
                sx={{ p: 2, cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                onClick={() => navigate(`/reports/${r.id}`)}
              >
                <Box>
                  <Typography variant="body2" fontWeight={600}>
                    {periodLabel(r.periodStart)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Generated {formatDate(r.createdAt)}
                  </Typography>
                </Box>
                <Chip
                  label={r.status}
                  color={REPORT_STATUS_COLOR[r.status]}
                  size="small"
                  sx={{ textTransform: 'capitalize' }}
                />
              </Stack>
            ))}
          </Stack>
        )}
      </Paper>

      <Typography variant="h6" sx={{ mb: 1.5 }}>
        Recent imports
      </Typography>
      <Paper variant="outlined">
        {importsLoading ? (
          <Box sx={{ p: 2 }}>
            <Skeleton variant="text" />
            <Skeleton variant="text" />
          </Box>
        ) : !imports || imports.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No imports yet for this property.
            </Typography>
          </Box>
        ) : (
          <Stack divider={<Divider />}>
            {imports.map((imp) => (
              <Stack
                key={imp.id}
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                spacing={1}
                sx={{ p: 2 }}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="body2" fontWeight={600} noWrap>
                    {imp.fileName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {imp.importType} · {imp.recordsImported}/{imp.totalRecords} records ·{' '}
                    {formatDate(imp.uploadedAt)}
                  </Typography>
                </Box>
                <Chip
                  label={imp.status}
                  size="small"
                  color={importStatusColor(imp.status)}
                  sx={{ textTransform: 'capitalize' }}
                />
              </Stack>
            ))}
          </Stack>
        )}
      </Paper>
    </Box>
  )
}
