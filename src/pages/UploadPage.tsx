import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Alert,
  Box,
  Breadcrumbs,
  Button,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Link,
  MenuItem,
  Select,
  Snackbar,
  Stack,
  Typography,
} from '@mui/material'
import UploadFileIcon from '@mui/icons-material/UploadFile'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'
import type { SelectChangeEvent } from '@mui/material'
import {
  useGetUploadUrlMutation,
  useConfirmImportMutation,
  type ImportType,
} from '../api/importSlice'
import { useGetPropertiesQuery } from '../api/propertiesApi'
import { track, ANALYTICS_EVENTS } from '../services/analytics'

const IMPORT_TYPES: ImportType[] = ['Revenue', 'Expenses', 'Tasks', 'Reviews', 'Inspections']

export function UploadPage() {
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const { data: propertiesData } = useGetPropertiesQuery({
    pageSize: 100,
    sortBy: 'name',
    sortDir: 'asc',
  })
  const properties = propertiesData?.items ?? []

  const [getUploadUrl] = useGetUploadUrlMutation()
  const [confirmImport] = useConfirmImportMutation()

  const [propertyId, setPropertyId] = useState('')
  const [importType, setImportType] = useState<ImportType>('Revenue')
  const [dragOver, setDragOver] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Default to the first property once the list loads.
  useEffect(() => {
    const first = propertiesData?.items?.[0]
    if (first && !propertyId) setPropertyId(first.id)
  }, [propertiesData, propertyId])

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    const file = files[0]
    if (!propertyId) {
      setError('Please choose a property first.')
      return
    }
    if (!/\.csv$/i.test(file.name)) {
      setError('Please choose a .csv file.')
      return
    }
    setError(null)
    setUploading(true)
    try {
      const apiImportType = importType.toLowerCase() as ImportType
      const { uploadUrl, importId } = await getUploadUrl({
        fileName: file.name,
        importType: apiImportType,
        propertyId,
      }).unwrap()
      const putResp = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'x-ms-blob-type': 'BlockBlob' },
        body: file,
      })
      if (!putResp.ok) throw new Error('Upload failed')
      await confirmImport(importId).unwrap()
      track(ANALYTICS_EVENTS.csv_uploaded, { import_type: apiImportType })
      setSuccess(`${file.name} uploaded — we're processing it now.`)
      setTimeout(() => navigate('/imports'), 1300)
    } catch (err) {
      const apiErr = err as { data?: unknown }
      setError(
        typeof apiErr?.data === 'string'
          ? apiErr.data
          : 'Upload failed. Please check the file and try again.',
      )
      setUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragOver(false)
    if (!uploading) handleFiles(e.dataTransfer.files)
  }

  return (
    <Box sx={{ maxWidth: 640, mx: 'auto' }}>
      <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 2 }}>
        <Link
          component="button"
          variant="body2"
          underline="hover"
          color="inherit"
          onClick={() => navigate('/imports')}
        >
          Imports
        </Link>
        <Typography variant="body2" color="text.primary">
          Upload
        </Typography>
      </Breadcrumbs>

      <Typography variant="h5" sx={{ mb: 1 }}>
        Upload data
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Import a CSV export from your PMS, accounting, or review tools. StayRecap maps the columns and
        brings the records in automatically.
      </Typography>

      <Card variant="outlined">
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <Stack spacing={2.5}>
            <FormControl fullWidth>
              <InputLabel>Property</InputLabel>
              <Select
                value={propertyId}
                label="Property"
                onChange={(e: SelectChangeEvent) => setPropertyId(e.target.value)}
              >
                {properties.length === 0 && (
                  <MenuItem value="" disabled>
                    No properties yet
                  </MenuItem>
                )}
                {properties.map((p) => (
                  <MenuItem key={p.id} value={p.id}>
                    {p.name} — {p.city}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Data type</InputLabel>
              <Select
                value={importType}
                label="Data type"
                onChange={(e: SelectChangeEvent) => setImportType(e.target.value as ImportType)}
              >
                {IMPORT_TYPES.map((t) => (
                  <MenuItem key={t} value={t}>
                    {t}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box
              data-tour="upload-dropzone"
              onDrop={handleDrop}
              onDragOver={(e) => {
                e.preventDefault()
                setDragOver(true)
              }}
              onDragLeave={() => setDragOver(false)}
              onClick={() => !uploading && fileInputRef.current?.click()}
              role="button"
              tabIndex={0}
              aria-label="Upload CSV file"
              sx={{
                border: '2px dashed',
                borderColor: dragOver ? 'primary.main' : 'divider',
                bgcolor: dragOver ? 'action.hover' : 'background.default',
                borderRadius: 1,
                p: { xs: 4, sm: 5 },
                textAlign: 'center',
                cursor: uploading ? 'wait' : 'pointer',
                opacity: uploading ? 0.6 : 1,
                transition: 'border-color 0.2s, background-color 0.2s',
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                hidden
                onChange={(e) => handleFiles(e.target.files)}
              />
              <UploadFileIcon sx={{ fontSize: 44, color: 'text.secondary', mb: 1 }} />
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {uploading ? 'Uploading…' : 'Drag & drop a CSV here, or click to browse'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                CSV files only
              </Typography>
            </Box>

            <Button variant="text" onClick={() => navigate('/imports')} sx={{ alignSelf: 'flex-start' }}>
              Cancel
            </Button>
          </Stack>
        </CardContent>
      </Card>

      <Snackbar
        open={success !== null}
        autoHideDuration={3000}
        onClose={() => setSuccess(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setSuccess(null)} sx={{ width: '100%' }}>
          {success}
        </Alert>
      </Snackbar>
    </Box>
  )
}
