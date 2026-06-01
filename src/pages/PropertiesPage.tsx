import { useState, useCallback, useEffect, useRef } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import {
  Alert,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  InputLabel,
  Link,
  MenuItem,
  Pagination,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableSortLabel,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import HomeWorkIcon from '@mui/icons-material/HomeWork'
import AddchartIcon from '@mui/icons-material/Addchart'
import {
  useGetPropertiesQuery,
  useGetPropertyFilterOptionsQuery,
  useDeletePropertyMutation,
  type PropertyListItem,
  type PropertyListParams,
} from '../api/propertiesApi'
import { useBillingGate } from '../hooks/useBillingGate'

type SortBy = 'name' | 'last_report_date' | 'last_import_date'
type SortDir = 'asc' | 'desc'

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined)
  useEffect(() => {
    timerRef.current = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timerRef.current)
  }, [value, delay])
  return debounced
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString()
}

interface DeleteDialogProps {
  open: boolean
  propertyName: string
  onConfirm: () => void
  onCancel: () => void
  loading: boolean
}

function DeleteDialog({ open, propertyName, onConfirm, onCancel, loading }: DeleteDialogProps) {
  return (
    <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth>
      <DialogTitle>Delete property?</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Are you sure you want to delete <strong>{propertyName}</strong>? This action cannot be undone.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} disabled={loading}>Cancel</Button>
        <Button onClick={onConfirm} color="error" disabled={loading} startIcon={loading ? <CircularProgress size={16} /> : undefined}>
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  )
}

interface PropertyCardProps {
  property: PropertyListItem
  onEdit: (id: string) => void
  onDelete: (property: PropertyListItem) => void
}

function PropertyCard({ property, onEdit, onDelete }: PropertyCardProps) {
  return (
    <Card variant="outlined" sx={{ mb: 1.5 }}>
      <CardContent sx={{ pb: 0 }}>
        <Typography variant="subtitle1" fontWeight={700}>{property.name}</Typography>
        <Typography variant="body2" color="text.secondary">{property.city}</Typography>
        <Typography variant="body2" color="text.secondary">{property.ownerName}</Typography>
        <Typography variant="body2">Units: {property.units}</Typography>
        <Typography variant="body2">Last Report: {formatDate(property.lastReportDate)}</Typography>
        <Typography variant="body2">Last Import: {formatDate(property.lastImportDate)}</Typography>
      </CardContent>
      <CardActions>
        <Button size="small" startIcon={<EditIcon />} onClick={() => onEdit(property.id)}>Edit</Button>
        <Button size="small" color="error" startIcon={<DeleteIcon />} onClick={() => onDelete(property)}>Delete</Button>
      </CardActions>
    </Card>
  )
}

export function PropertiesPage() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const navigate = useNavigate()

  const [searchInput, setSearchInput] = useState('')
  const [city, setCity] = useState('')
  const [ownerName, setOwnerName] = useState('')
  const [sortBy, setSortBy] = useState<SortBy>('name')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [page, setPage] = useState(1)

  const [deleteTarget, setDeleteTarget] = useState<PropertyListItem | null>(null)

  const debouncedSearch = useDebounce(searchInput, 300)

  const queryParams: PropertyListParams = {
    search: debouncedSearch || undefined,
    city: city || undefined,
    owner_name: ownerName || undefined,
    sortBy,
    sortDir,
    page,
    pageSize: 25,
  }

  const { data, isLoading, isFetching } = useGetPropertiesQuery(queryParams)
  const { data: filterOptions } = useGetPropertyFilterOptionsQuery()
  const [deleteProperty, { isLoading: isDeleting }] = useDeletePropertyMutation()
  const { isBlocked, blockReason, propertiesAtLimit, reportsAtLimit } = useBillingGate()
  const propertyCreateDisabled = isBlocked || propertiesAtLimit
  const reportCreateDisabled = isBlocked || reportsAtLimit

  const handleSort = useCallback((column: SortBy) => {
    if (sortBy === column) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortBy(column)
      setSortDir('asc')
    }
    setPage(1)
  }, [sortBy])

  const handleSearchChange = (value: string) => {
    setSearchInput(value)
    setPage(1)
  }

  const handleCityChange = (value: string) => {
    setCity(value)
    setPage(1)
  }

  const handleOwnerChange = (value: string) => {
    setOwnerName(value)
    setPage(1)
  }

  const handleEdit = (id: string) => {
    navigate(`/properties/${id}/edit`)
  }

  const handleDeleteClick = (property: PropertyListItem) => {
    setDeleteTarget(property)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    await deleteProperty(deleteTarget.id)
    setDeleteTarget(null)
  }

  const handleDeleteCancel = () => {
    setDeleteTarget(null)
  }

  const totalCount = data?.totalCount ?? 0
  const pageCount = Math.ceil(totalCount / 25)
  const items = data?.items ?? []
  const showPagination = totalCount > 25

  const sortLabel = (column: SortBy, label: string) => (
    <TableSortLabel
      active={sortBy === column}
      direction={sortBy === column ? sortDir : 'asc'}
      onClick={() => handleSort(column)}
    >
      {label}
    </TableSortLabel>
  )

  const loading = isLoading || isFetching

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="h5">Properties</Typography>
        <Stack direction="row" spacing={1}>
          <Tooltip title={reportCreateDisabled ? 'Upgrade your plan' : ''}>
            <span>
              <Button
                variant="outlined"
                startIcon={<AddchartIcon />}
                onClick={() => navigate('/reports/new')}
                size="medium"
                disabled={reportCreateDisabled}
              >
                Generate Report
              </Button>
            </span>
          </Tooltip>
          <Tooltip title={propertyCreateDisabled ? 'Upgrade your plan' : ''}>
            <span>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate('/properties/new')}
                size="medium"
                disabled={propertyCreateDisabled}
              >
                Add Property
              </Button>
            </span>
          </Tooltip>
        </Stack>
      </Box>

      {(isBlocked || propertiesAtLimit || reportsAtLimit) && blockReason && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {blockReason}{' '}
          <Link component={RouterLink} to="/settings/billing">
            Go to billing
          </Link>
        </Alert>
      )}


      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mb: 2 }}>
        <TextField
          label="Search"
          value={searchInput}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Name, address, or owner…"
          sx={{ minWidth: 200 }}
        />
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>City</InputLabel>
          <Select value={city} label="City" onChange={(e) => handleCityChange(e.target.value)}>
            <MenuItem value="">All cities</MenuItem>
            {filterOptions?.cities.map((c) => (
              <MenuItem key={c} value={c}>{c}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Owner</InputLabel>
          <Select value={ownerName} label="Owner" onChange={(e) => handleOwnerChange(e.target.value)}>
            <MenuItem value="">All owners</MenuItem>
            {filterOptions?.ownerNames.map((o) => (
              <MenuItem key={o} value={o}>{o}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      )}

      {!loading && items.length === 0 && (
        <Card variant="outlined" sx={{ textAlign: 'center', py: 6, px: 3 }}>
          <HomeWorkIcon sx={{ fontSize: 56, color: 'text.disabled', mb: 1 }} />
          <Typography variant="h6" gutterBottom>No properties yet</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Get started by adding your first property.
          </Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/properties/new')}>
            Add your first property
          </Button>
        </Card>
      )}

      {!loading && items.length > 0 && isMobile && (
        <Box>
          {items.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
            />
          ))}
        </Box>
      )}

      {!loading && items.length > 0 && !isMobile && (
        <Box sx={{ overflowX: 'auto' }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>{sortLabel('name', 'Name')}</TableCell>
                <TableCell>City</TableCell>
                <TableCell>Owner</TableCell>
                <TableCell align="right">Units</TableCell>
                <TableCell>{sortLabel('last_report_date', 'Last Report')}</TableCell>
                <TableCell>{sortLabel('last_import_date', 'Last Import')}</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((property) => (
                <TableRow key={property.id} hover>
                  <TableCell>{property.name}</TableCell>
                  <TableCell>{property.city}</TableCell>
                  <TableCell>{property.ownerName}</TableCell>
                  <TableCell align="right">{property.units}</TableCell>
                  <TableCell>{formatDate(property.lastReportDate)}</TableCell>
                  <TableCell>{formatDate(property.lastImportDate)}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={0.5}>
                      <Button size="small" startIcon={<EditIcon />} onClick={() => handleEdit(property.id)}>Edit</Button>
                      <Button size="small" color="error" startIcon={<DeleteIcon />} onClick={() => handleDeleteClick(property)}>Delete</Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      )}

      {showPagination && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={pageCount}
            page={page}
            onChange={(_, p) => setPage(p)}
            color="primary"
          />
        </Box>
      )}

      <DeleteDialog
        open={deleteTarget !== null}
        propertyName={deleteTarget?.name ?? ''}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        loading={isDeleting}
      />
    </Box>
  )
}
