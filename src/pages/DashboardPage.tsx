import { useNavigate } from 'react-router-dom'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Grid2,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Skeleton,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import HomeWorkIcon from '@mui/icons-material/HomeWork'
import AssessmentIcon from '@mui/icons-material/Assessment'
import UploadFileIcon from '@mui/icons-material/UploadFile'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import AddchartIcon from '@mui/icons-material/Addchart'
import AddIcon from '@mui/icons-material/Add'
import EventNoteIcon from '@mui/icons-material/EventNote'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import { useGetDashboardSummaryQuery } from '../api/dashboardApi'

function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins} minute${mins === 1 ? '' : 's'} ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`
  const days = Math.floor(hours / 24)
  return `${days} day${days === 1 ? '' : 's'} ago`
}

interface KpiCardProps {
  icon: React.ReactNode
  label: string
  value: number | string
  loading: boolean
}

function KpiCard({ icon, label, value, loading }: KpiCardProps) {
  return (
    <Card variant="outlined" sx={{ height: '100%' }}>
      <CardContent>
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
          {icon}
          <Typography variant="body2" color="text.secondary">{label}</Typography>
        </Stack>
        {loading ? (
          <Skeleton variant="text" width={80} height={40} />
        ) : (
          <Typography variant="h4" fontWeight={700}>{value}</Typography>
        )}
      </CardContent>
    </Card>
  )
}

function EmptyStateChecklist() {
  const navigate = useNavigate()
  return (
    <Card variant="outlined" sx={{ mt: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>Get started in 3 steps</Typography>
        <List disablePadding>
          <ListItem disableGutters>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <CheckCircleOutlineIcon color="disabled" />
            </ListItemIcon>
            <ListItemText
              primary="Add a property"
              secondary="Register your first strata property"
            />
            <Button
              variant="contained"
              size="small"
              startIcon={<AddIcon />}
              onClick={() => navigate('/properties/new')}
              sx={{ minWidth: 44, minHeight: 44 }}
            >
              Add
            </Button>
          </ListItem>
          <ListItem disableGutters>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <CheckCircleOutlineIcon color="disabled" />
            </ListItemIcon>
            <ListItemText
              primary="Upload data"
              secondary="Import revenue, expenses or other records"
            />
            <Button
              variant="outlined"
              size="small"
              startIcon={<UploadFileIcon />}
              onClick={() => navigate('/imports/upload')}
              sx={{ minWidth: 44, minHeight: 44 }}
            >
              Upload
            </Button>
          </ListItem>
          <ListItem disableGutters>
            <ListItemIcon sx={{ minWidth: 36 }}>
              <CheckCircleOutlineIcon color="disabled" />
            </ListItemIcon>
            <ListItemText
              primary="Generate a report"
              secondary="Create a strata report for any period"
            />
            <Button
              variant="outlined"
              size="small"
              startIcon={<AddchartIcon />}
              onClick={() => navigate('/reports/generate')}
              sx={{ minWidth: 44, minHeight: 44 }}
            >
              Generate
            </Button>
          </ListItem>
        </List>
      </CardContent>
    </Card>
  )
}

export function DashboardPage() {
  const navigate = useNavigate()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const { data, isLoading, isError } = useGetDashboardSummaryQuery()

  const totalProperties = data?.totalProperties ?? 0
  const reportsThisQuarter = data?.reportsThisQuarter ?? 0
  const pendingImports = data?.pendingImports ?? 0
  const mrrAtStake = data?.mrrAtStake ?? 0
  const recentActivity = data?.recentActivity ?? []

  const kpiCards: KpiCardProps[] = [
    {
      icon: <HomeWorkIcon color="primary" />,
      label: 'Total Properties',
      value: totalProperties,
      loading: isLoading,
    },
    {
      icon: <AssessmentIcon color="secondary" />,
      label: 'Reports This Quarter',
      value: reportsThisQuarter,
      loading: isLoading,
    },
    {
      icon: <UploadFileIcon color="warning" />,
      label: 'Pending Imports',
      value: pendingImports,
      loading: isLoading,
    },
    {
      icon: <AttachMoneyIcon color="success" />,
      label: 'MRR-at-Stake',
      value: `$${mrrAtStake.toLocaleString()}`,
      loading: isLoading,
    },
  ]

  return (
    <Box sx={{ maxWidth: '100%', overflowX: 'hidden' }}>
      <Typography variant="h5" sx={{ mb: 3 }}>Dashboard</Typography>

      {isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to load dashboard data. Please refresh.
        </Alert>
      )}

      <Grid2 container spacing={2} sx={{ mb: 3 }}>
        {kpiCards.map((card) => (
          <Grid2
            key={card.label}
            size={{ xs: 6, lg: 3 }}
          >
            <KpiCard {...card} />
          </Grid2>
        ))}
      </Grid2>

      <Stack
        direction={isMobile ? 'column' : 'row'}
        spacing={1.5}
        sx={{ mb: 3 }}
      >
        <Button
          variant="contained"
          startIcon={<AddchartIcon />}
          onClick={() => navigate('/reports/generate')}
          sx={{ minHeight: 44 }}
          fullWidth={isMobile}
        >
          Generate Report
        </Button>
        <Button
          variant="outlined"
          startIcon={<UploadFileIcon />}
          onClick={() => navigate('/imports/upload')}
          sx={{ minHeight: 44 }}
          fullWidth={isMobile}
        >
          Upload Data
        </Button>
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={() => navigate('/properties/new')}
          sx={{ minHeight: 44 }}
          fullWidth={isMobile}
        >
          Add Property
        </Button>
      </Stack>

      <Card variant="outlined">
        <CardContent>
          <Typography variant="h6" sx={{ mb: 1 }}>Recent Activity</Typography>
          {isLoading && (
            <List disablePadding>
              {Array.from({ length: 5 }).map((_, i) => (
                <ListItem key={i} disableGutters>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <Skeleton variant="circular" width={24} height={24} />
                  </ListItemIcon>
                  <ListItemText
                    primary={<Skeleton variant="text" width="60%" />}
                    secondary={<Skeleton variant="text" width="30%" />}
                  />
                </ListItem>
              ))}
            </List>
          )}
          {!isLoading && recentActivity.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <EventNoteIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
              <Typography variant="body2" color="text.secondary">
                No activity yet.
              </Typography>
            </Box>
          )}
          {!isLoading && recentActivity.length > 0 && (
            <List disablePadding>
              {recentActivity.map((event) => (
                <ListItem key={event.id} disableGutters>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <EventNoteIcon fontSize="small" color="action" />
                  </ListItemIcon>
                  <ListItemText
                    primary={event.description}
                    secondary={formatRelativeTime(event.occurredAt)}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

      {!isLoading && totalProperties === 0 && <EmptyStateChecklist />}
    </Box>
  )
}
