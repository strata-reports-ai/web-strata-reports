import {
  Alert,
  Box,
  Button,
  Chip,
  Paper,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import ArticleIcon from '@mui/icons-material/Article'
import { useNavigate } from 'react-router-dom'
import { useListReportsQuery, type ReportStatus } from '../api/reportSlice'

const STATUS_COLOR: Record<ReportStatus, 'default' | 'info' | 'success' | 'error' | 'warning'> = {
  queued: 'default',
  generating: 'info',
  processing: 'info',
  succeeded: 'success',
  failed: 'error',
}

export function ReportsPage() {
  const navigate = useNavigate()
  const { data: reports, isLoading, isError } = useListReportsQuery()

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h5">Reports</Typography>
        <Button variant="contained" onClick={() => navigate('/reports/new')}>
          Generate Report
        </Button>
      </Stack>

      {isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to load reports. Please try again.
        </Alert>
      )}

      {!isLoading && !isError && reports?.length === 0 && (
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
            Generate Report
          </Button>
        </Box>
      )}

      {(isLoading || (reports && reports.length > 0)) && (
        <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
          <Table size="small" aria-label="reports table">
            <TableHead>
              <TableRow>
                <TableCell>Property</TableCell>
                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Type</TableCell>
                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Period</TableCell>
                <TableCell>Status</TableCell>
                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Created</TableCell>
                <TableCell align="right">PDF</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 6 }).map((_unused, j) => (
                        <TableCell key={j}>
                          <Skeleton variant="text" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                : reports!.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>
                        <Typography variant="body2" noWrap sx={{ maxWidth: { xs: 120, sm: 200 } }}>
                          {row.propertyName}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' }, textTransform: 'capitalize' }}>
                        {row.type}
                      </TableCell>
                      <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                        {row.periodStart} – {row.periodEnd}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={row.status}
                          color={STATUS_COLOR[row.status]}
                          size="small"
                          sx={{ textTransform: 'capitalize' }}
                        />
                      </TableCell>
                      <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                        {new Date(row.createdAt).toLocaleString()}
                      </TableCell>
                      <TableCell align="right">
                        {row.pdfUrl && (
                          <Button
                            size="small"
                            variant="outlined"
                            href={row.pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Download
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  )
}
