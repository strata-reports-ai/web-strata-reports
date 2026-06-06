import { useEffect, useRef, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Skeleton,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import SaveIcon from '@mui/icons-material/Save'
import {
  useGetBrandingQuery,
  useUpdateBrandingMutation,
  useGetLogoUploadUrlMutation,
} from '../api/brandingApi'

const DEFAULT_COLOR = '#1976d2'
const MAX_FOOTER_LENGTH = 500
const MAX_LOGO_BYTES = 2 * 1024 * 1024
const ACCEPTED_MIME = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml']
const ACCEPTED_ATTR = '.png,.jpg,.jpeg,.svg'

interface ErrorShape {
  status?: number
  data?: {
    detail?: string
    title?: string
    code?: string
  }
}

function extractErrorDetail(err: unknown): string {
  const e = err as ErrorShape
  return e?.data?.detail ?? e?.data?.title ?? 'Something went wrong. Please try again.'
}

function isValidImageType(file: File): boolean {
  if (ACCEPTED_MIME.includes(file.type)) return true
  const name = file.name.toLowerCase()
  return (
    name.endsWith('.png') ||
    name.endsWith('.jpg') ||
    name.endsWith('.jpeg') ||
    name.endsWith('.svg')
  )
}

export function SettingsBrandingPage() {
  const { data: branding, isLoading, isError, refetch } = useGetBrandingQuery()
  const [updateBranding, { isLoading: isSaving }] = useUpdateBrandingMutation()
  const [getLogoUploadUrl] = useGetLogoUploadUrlMutation()

  const [primaryColor, setPrimaryColor] = useState<string>(DEFAULT_COLOR)
  const [footerText, setFooterText] = useState<string>('')
  const [logoBlobPath, setLogoBlobPath] = useState<string | null>(null)
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null)

  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (branding) {
      setPrimaryColor(branding.primaryColorHex ?? DEFAULT_COLOR)
      setFooterText(branding.reportFooterText ?? '')
      setLogoBlobPath(branding.logoBlobPath ?? null)
      setLogoPreviewUrl(branding.logoUrl ?? null)
    }
  }, [branding])

  const handleLogoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null)
    const file = e.target.files?.[0]
    if (!file) return

    if (!isValidImageType(file)) {
      setUploadError('Please choose a PNG, JPG, or SVG file.')
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }
    if (file.size > MAX_LOGO_BYTES) {
      setUploadError('Logo must be 2 MB or smaller.')
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    setIsUploading(true)
    try {
      const { uploadUrl, blobPath } = await getLogoUploadUrl({
        contentType: file.type || 'application/octet-stream',
        fileName: file.name,
      }).unwrap()

      const putResp = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'x-ms-blob-type': 'BlockBlob',
          'Content-Type': file.type || 'application/octet-stream',
        },
        body: file,
      })
      if (!putResp.ok) {
        throw new Error(`Upload failed (${putResp.status})`)
      }

      await updateBranding({ logoBlobPath: blobPath }).unwrap()
      setLogoBlobPath(blobPath)

      const localPreview = URL.createObjectURL(file)
      setLogoPreviewUrl(localPreview)
      setSuccessMessage('Logo updated')
      refetch()
    } catch (err) {
      setUploadError(extractErrorDetail(err))
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleRemoveLogo = async () => {
    setUploadError(null)
    try {
      await updateBranding({ logoBlobPath: null }).unwrap()
      setLogoBlobPath(null)
      setLogoPreviewUrl(null)
      setSuccessMessage('Logo removed')
      refetch()
    } catch (err) {
      setErrorMessage(extractErrorDetail(err))
    }
  }

  const handleSave = async () => {
    if (!branding) return
    const changes: {
      primaryColorHex?: string | null
      reportFooterText?: string | null
    } = {}

    const currentColor = branding.primaryColorHex ?? DEFAULT_COLOR
    if (primaryColor !== currentColor) {
      changes.primaryColorHex = primaryColor
    }
    const currentFooter = branding.reportFooterText ?? ''
    if (footerText !== currentFooter) {
      changes.reportFooterText = footerText.length === 0 ? null : footerText
    }

    if (Object.keys(changes).length === 0) {
      setSuccessMessage('No changes to save')
      return
    }

    try {
      await updateBranding(changes).unwrap()
      setSuccessMessage('Branding saved')
      refetch()
    } catch (err) {
      setErrorMessage(extractErrorDetail(err))
    }
  }

  if (isLoading) {
    return (
      <Box sx={{ maxWidth: 720, mx: 'auto', p: { xs: 2, md: 3 } }}>
        <Skeleton variant="text" width={220} height={40} />
        <Skeleton variant="rectangular" height={180} sx={{ my: 2, borderRadius: 1 }} />
        <Skeleton variant="rectangular" height={120} sx={{ my: 2, borderRadius: 1 }} />
        <Skeleton variant="rectangular" height={180} sx={{ my: 2, borderRadius: 1 }} />
      </Box>
    )
  }

  if (isError) {
    return (
      <Box sx={{ maxWidth: 720, mx: 'auto', p: { xs: 2, md: 3 } }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Branding
        </Typography>
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => refetch()}>
              Retry
            </Button>
          }
        >
          We couldn't load your branding settings. Please try again.
        </Alert>
      </Box>
    )
  }

  const footerCount = footerText.length
  const footerOver = footerCount > MAX_FOOTER_LENGTH

  return (
    <Box sx={{ maxWidth: 720, mx: 'auto', p: { xs: 2, md: 3 }, overflowX: 'hidden' }}>
      <Typography variant="h5" sx={{ mb: 3 }}>
        Branding
      </Typography>

      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Logo
          </Typography>
          {uploadError && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setUploadError(null)}>
              {uploadError}
            </Alert>
          )}

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="flex-start">
            <Box
              sx={{
                width: { xs: '100%', sm: 160 },
                height: 120,
                borderRadius: 1,
                border: '1px dashed',
                borderColor: 'divider',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'background.default',
                overflow: 'hidden',
              }}
            >
              {logoPreviewUrl ? (
                <Box
                  component="img"
                  src={logoPreviewUrl}
                  alt="Logo preview"
                  sx={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                />
              ) : (
                <Typography variant="caption" color="text.secondary">
                  No logo uploaded
                </Typography>
              )}
            </Box>

            <Stack spacing={1} sx={{ width: { xs: '100%', sm: 'auto' } }}>
              <Button
                variant="outlined"
                component="label"
                startIcon={
                  isUploading ? (
                    <CircularProgress size={18} color="inherit" />
                  ) : (
                    <CloudUploadIcon />
                  )
                }
                disabled={isUploading || isSaving}
                sx={{ minHeight: 44 }}
              >
                {isUploading ? 'Uploading…' : 'Upload logo'}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ACCEPTED_ATTR}
                  hidden
                  onChange={handleLogoSelect}
                />
              </Button>
              {logoBlobPath && (
                <Button
                  variant="text"
                  color="error"
                  startIcon={<DeleteOutlineIcon />}
                  onClick={handleRemoveLogo}
                  disabled={isUploading || isSaving}
                  sx={{ minHeight: 44 }}
                >
                  Remove logo
                </Button>
              )}
              <Typography variant="caption" color="text.secondary">
                PNG, JPG, or SVG. Max 2 MB.
              </Typography>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Primary brand color
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
            <Box
              component="input"
              type="color"
              value={primaryColor}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setPrimaryColor(e.target.value)
              }
              sx={{
                width: 64,
                height: 44,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                p: 0,
                cursor: 'pointer',
                backgroundColor: 'transparent',
              }}
              aria-label="Primary color picker"
            />
            <TextField
              label="Hex value"
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              size="small"
              sx={{ width: { xs: '100%', sm: 160 } }}
              inputProps={{ maxLength: 7, 'aria-label': 'Hex color value' }}
            />
          </Stack>
        </CardContent>
      </Card>

      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Report footer text
          </Typography>
          <TextField
            label="Footer text"
            value={footerText}
            onChange={(e) => setFooterText(e.target.value)}
            multiline
            minRows={3}
            maxRows={8}
            fullWidth
            error={footerOver}
            helperText={`${footerCount}/${MAX_FOOTER_LENGTH}`}
            inputProps={{ maxLength: MAX_FOOTER_LENGTH }}
          />
        </CardContent>
      </Card>

      <Stack direction="row" justifyContent={{ xs: 'stretch', sm: 'flex-end' }}>
        <Button
          variant="contained"
          startIcon={
            isSaving ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />
          }
          onClick={handleSave}
          disabled={isSaving || isUploading || footerOver}
          sx={{ minHeight: 44, width: { xs: '100%', sm: 'auto' } }}
        >
          Save changes
        </Button>
      </Stack>

      <Snackbar
        open={successMessage !== null}
        autoHideDuration={4000}
        onClose={() => setSuccessMessage(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity="success"
          onClose={() => setSuccessMessage(null)}
          sx={{ width: '100%' }}
        >
          {successMessage}
        </Alert>
      </Snackbar>

      <Snackbar
        open={errorMessage !== null}
        autoHideDuration={6000}
        onClose={() => setErrorMessage(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity="error"
          onClose={() => setErrorMessage(null)}
          sx={{ width: '100%' }}
        >
          {errorMessage}
        </Alert>
      </Snackbar>
    </Box>
  )
}
