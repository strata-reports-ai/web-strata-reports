import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Box,
  Button,
  CircularProgress,
  Stack,
  TextField,
  Typography,
  Alert,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import {
  useCreatePropertyMutation,
  useUpdatePropertyMutation,
  useGetPropertiesQuery,
} from '../api/propertiesApi'

export function PropertyFormPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)

  const { data: listData } = useGetPropertiesQuery(
    { page: 1, pageSize: 1000 },
    { skip: !isEdit },
  )

  const existing = isEdit ? listData?.items.find((p) => p.id === id) : undefined

  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [ownerName, setOwnerName] = useState('')
  const [units, setUnits] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (existing) {
      setName(existing.name)
      setAddress(existing.address)
      setCity(existing.city)
      setOwnerName(existing.ownerName)
      setUnits(String(existing.units))
    }
  }, [existing])

  const [createProperty, { isLoading: isCreating }] = useCreatePropertyMutation()
  const [updateProperty, { isLoading: isUpdating }] = useUpdatePropertyMutation()

  const isLoading = isCreating || isUpdating

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      if (isEdit && id) {
        await updateProperty({ id, name, address, city, ownerName, units: Number(units) }).unwrap()
      } else {
        await createProperty({ name, address, city, ownerName, units: Number(units) }).unwrap()
      }
      navigate('/properties')
    } catch {
      setError('Failed to save property. Please try again.')
    }
  }

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/properties')}>
          Back
        </Button>
        <Typography variant="h5">{isEdit ? 'Edit Property' : 'Add Property'}</Typography>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 480 }}>
        <Stack spacing={2}>
          <TextField
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            fullWidth
          />
          <TextField
            label="Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
            fullWidth
          />
          <TextField
            label="City"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            required
            fullWidth
          />
          <TextField
            label="Owner Name"
            value={ownerName}
            onChange={(e) => setOwnerName(e.target.value)}
            required
            fullWidth
          />
          <TextField
            label="Units"
            value={units}
            onChange={(e) => setUnits(e.target.value)}
            type="number"
            required
            fullWidth
            inputProps={{ min: 1 }}
          />
          <Button
            type="submit"
            variant="contained"
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={16} /> : undefined}
          >
            {isEdit ? 'Save Changes' : 'Add Property'}
          </Button>
        </Stack>
      </Box>
    </Box>
  )
}
