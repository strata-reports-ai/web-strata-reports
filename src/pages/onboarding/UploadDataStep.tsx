import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from '@mui/material'
import UploadFileIcon from '@mui/icons-material/UploadFile'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import type { SelectChangeEvent } from '@mui/material'
import { OnboardingStepper } from '../../components/onboarding/OnboardingStepper'
import { useSeedSampleDataMutation } from '../../api/onboardingApi'
import {
  useGetUploadUrlMutation,
  useConfirmImportMutation,
  type ImportType,
} from '../../api/importSlice'
import { useGetPropertiesQuery } from '../../api/propertiesApi'

const IMPORT_TYPES: ImportType[] = ['Revenue', 'Expenses', 'Tasks', 'Reviews', 'Inspections']

export function UploadDataStep() {
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const { data: propertiesData } = useGetPropertiesQuery({
    pageSize: 1,
    sortBy: 'name',
    sortDir: 'asc',
  })
  const firstProperty = propertiesData?.items?.[0]

  const [seedSampleData, { isLoading: isSeeding }] = useSeedSampleDataMutation()
  const [getUploadUrl] = useGetUploadUrlMutation()
  const [confirmImport] = useConfirmImportMutation()

  const [importType, setImportType] = useState<ImportType>('Revenue')
  const [dragOver, setDragOver] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleTrySample = async () => {
    setError(null)
    try {
      const result = await seedSampleData().unwrap()
      navigate(
        `/onboarding/generate-report?propertyId=${encodeURIComponent(result.propertyId)}`,
      )
    } catch {
      setError('Failed to load sample data. Please try again.')
    }
  }

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    const file = files[0]
    if (!firstProperty) {
      setError('No property found. Please add a property first.')
      return
    }
    setError(null)
    setUploading(true)
    try {
      const { uploadUrl, importId } = await getUploadUrl({
        fileName: file.name,
        importType,
        propertyId: firstProperty.id,
      }).unwrap()
      const putResp = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'x-ms-blob-type': 'BlockBlob' },
        body: file,
      })
      if (!putResp.ok) throw new Error('Upload failed')
      await confirmImport(importId).unwrap()
      navigate('/onboarding/generate-report')
    } catch {
      setError('Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragOver(false)
    handleFiles(e.dataTransfer.files)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = () => {
    setDragOver(false)
  }

  const handleBrowseClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', width: '100%', p: { xs: 2, sm: 3 } }}>
      <OnboardingStepper activeStep={1} />

      <Card variant="outlined">
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Typography variant="h5" gutterBottom>
            Upload your data
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Bring in real data, or try the app with a sample dataset.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Button
            variant="contained"
            color="secondary"
            size="large"
            fullWidth
            startIcon={
              isSeeding ? <CircularProgress size={18} color="inherit" /> : <AutoAwesomeIcon />
            }
            onClick={handleTrySample}
            disabled={isSeeding || uploading}
            sx={{ mb: 3 }}
          >
            {isSeeding ? 'Loading sample data…' : 'Try with sample data'}
          </Button>

          <Divider sx={{ my: 2 }}>
            <Typography variant="caption" color="text.secondary">
              OR UPLOAD A CSV
            </Typography>
          </Divider>

          <Stack spacing={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Import Type</InputLabel>
              <Select
                value={importType}
                label="Import Type"
                onChange={(e: SelectChangeEvent) =>
                  setImportType(e.target.value as ImportType)
                }
              >
                {IMPORT_TYPES.map((t) => (
                  <MenuItem key={t} value={t}>
                    {t}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={handleBrowseClick}
              sx={{
                border: '2px dashed',
                borderColor: dragOver ? 'primary.main' : 'divider',
                bgcolor: dragOver ? 'action.hover' : 'background.default',
                borderRadius: 1,
                p: { xs: 3, sm: 4 },
                textAlign: 'center',
                cursor: uploading ? 'wait' : 'pointer',
                opacity: uploading ? 0.6 : 1,
                transition: 'border-color 0.2s, background-color 0.2s',
              }}
              role="button"
              tabIndex={0}
              aria-label="Upload CSV file"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                hidden
                onChange={(e) => handleFiles(e.target.files)}
              />
              <UploadFileIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
              <Typography variant="body1">
                {uploading ? 'Uploading…' : 'Drag & drop a CSV here, or click to browse'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                CSV files only
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  )
}
