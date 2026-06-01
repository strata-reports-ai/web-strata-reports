import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Collapse,
  Link,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import { OnboardingStepper } from '../../components/onboarding/OnboardingStepper'
import { useCreatePropertyMutation } from '../../api/propertiesApi'

export function AddPropertyStep() {
  const navigate = useNavigate()
  const [createProperty, { isLoading }] = useCreatePropertyMutation()

  const [name, setName] = useState('')
  const [city, setCity] = useState('')
  const [stateName, setStateName] = useState('')
  const [ownerName, setOwnerName] = useState('')
  const [address, setAddress] = useState('')
  const [units, setUnits] = useState('')
  const [showMore, setShowMore] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!name.trim()) {
      setError('Property name is required.')
      return
    }
    try {
      const cityValue = stateName
        ? `${city}${city && stateName ? ', ' : ''}${stateName}`
        : city
      await createProperty({
        name: name.trim(),
        address: address.trim(),
        city: cityValue.trim(),
        ownerName: ownerName.trim(),
        ...(units ? { units: Number(units) } : {}),
      }).unwrap()
      navigate('/onboarding/upload-data')
    } catch {
      setError('Failed to save property. Please try again.')
    }
  }

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', width: '100%', p: { xs: 2, sm: 3 } }}>
      <OnboardingStepper activeStep={0} />

      <Card variant="outlined">
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Typography variant="h5" gutterBottom>
            Add your first property
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Tell us about a property you manage. You can add more later.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={2}>
              <TextField
                label="Property Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                fullWidth
                autoFocus
              />
              <TextField
                label="City"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                fullWidth
              />
              <TextField
                label="State"
                value={stateName}
                onChange={(e) => setStateName(e.target.value)}
                fullWidth
              />
              <TextField
                label="Owner Name"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                fullWidth
              />

              <Link
                component="button"
                type="button"
                onClick={() => setShowMore((v) => !v)}
                underline="hover"
                sx={{
                  alignSelf: 'flex-start',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.5,
                }}
              >
                {showMore ? (
                  <ExpandLessIcon fontSize="small" />
                ) : (
                  <ExpandMoreIcon fontSize="small" />
                )}
                {showMore ? 'Hide extra fields' : 'Show more fields'}
              </Link>

              <Collapse in={showMore} unmountOnExit>
                <Stack spacing={2}>
                  <TextField
                    label="Address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    fullWidth
                  />
                  <TextField
                    label="Units"
                    value={units}
                    onChange={(e) => setUnits(e.target.value)}
                    type="number"
                    fullWidth
                    inputProps={{ min: 0 }}
                  />
                </Stack>
              </Collapse>

              <Button
                type="submit"
                variant="contained"
                disabled={isLoading || !name.trim()}
                startIcon={isLoading ? <CircularProgress size={16} /> : undefined}
                fullWidth
              >
                {isLoading ? 'Saving…' : 'Continue'}
              </Button>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}
