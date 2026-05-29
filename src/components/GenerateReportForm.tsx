import { useState, useEffect, useCallback } from 'react'
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import { useGetPropertiesQuery } from '../api/propertiesApi'
import { useLazyGetPreflightQuery, useGenerateReportMutation } from '../api/reportSlice'

const QUARTERS = [
  { label: 'Q1 (Jan–Mar)', value: 'Q1' },
  { label: 'Q2 (Apr–Jun)', value: 'Q2' },
  { label: 'Q3 (Jul–Sep)', value: 'Q3' },
  { label: 'Q4 (Oct–Dec)', value: 'Q4' },
]

const QUARTER_DATES: Record<string, { start: string; end: string }> = {
  Q1: { start: '-01-01', end: '-03-31' },
  Q2: { start: '-04-01', end: '-06-30' },
  Q3: { start: '-07-01', end: '-09-30' },
  Q4: { start: '-10-01', end: '-12-31' },
}

function getPeriodDates(quarter: string, year: number) {
  const q = QUARTER_DATES[quarter]
  return {
    periodStart: `${year}${q.start}`,
    periodEnd: `${year}${q.end}`,
  }
}

interface PropertyOption {
  id: string
  label: string
}

interface GenerateReportFormProps {
  onSuccess: (reportId: string) => void
  onError: (message: string) => void
}

export function GenerateReportForm({ onSuccess, onError }: GenerateReportFormProps) {
  const currentYear = new Date().getFullYear()

  const [propertySearch, setPropertySearch] = useState('')
  const [selectedProperty, setSelectedProperty] = useState<PropertyOption | null>(null)
  const [quarter, setQuarter] = useState<string>('Q1')
  const [year, setYear] = useState<number>(currentYear)
  const [customNote, setCustomNote] = useState('')
  const [showRegenerateDialog, setShowRegenerateDialog] = useState(false)

  const { data: propertiesData, isLoading: propertiesLoading } = useGetPropertiesQuery({
    search: propertySearch || undefined,
    pageSize: 50,
  })

  const propertyOptions: PropertyOption[] = (propertiesData?.items ?? []).map((p) => ({
    id: p.id,
    label: `${p.name} — ${p.city}`,
  }))

  const { periodStart, periodEnd } = selectedProperty
    ? getPeriodDates(quarter, year)
    : { periodStart: '', periodEnd: '' }

  const [triggerPreflight, { data: preflight, isFetching: preflightFetching, isUninitialized: preflightUninitialized }] =
    useLazyGetPreflightQuery()

  const [generateReport, { isLoading: isGenerating }] = useGenerateReportMutation()

  useEffect(() => {
    if (selectedProperty && quarter && year) {
      const { periodStart: ps, periodEnd: pe } = getPeriodDates(quarter, year)
      triggerPreflight({ propertyId: selectedProperty.id, periodStart: ps, periodEnd: pe })
    }
  }, [selectedProperty, quarter, year, triggerPreflight])

  const noData = preflight && !preflight.hasSomeData
  const someData = preflight && preflight.hasSomeData && preflight.missingTypes.length > 0
  const generateDisabled =
    !selectedProperty || preflightFetching || preflightUninitialized || noData || isGenerating

  const doGenerate = useCallback(
    async (force = false) => {
      if (!selectedProperty) return
      try {
        const result = await generateReport({
          propertyId: selectedProperty.id,
          type: 'quarterly',
          periodStart,
          periodEnd,
          customNote: customNote || undefined,
        }).unwrap()
        onSuccess(result.reportId)
      } catch (err: unknown) {
        const apiErr = err as { data?: { error_message?: string }; status?: number }
        if (apiErr?.status === 409 && !force) {
          setShowRegenerateDialog(true)
          return
        }
        const msg =
          apiErr?.data?.error_message ?? 'Failed to generate report. Please try again.'
        onError(msg)
      }
    },
    [selectedProperty, periodStart, periodEnd, customNote, generateReport, onSuccess, onError],
  )

  const handleGenerateClick = () => {
    doGenerate(false)
  }

  const handleRegenerateConfirm = () => {
    setShowRegenerateDialog(false)
    doGenerate(true)
  }

  const handleRegenerateCancel = () => {
    setShowRegenerateDialog(false)
  }

  const yearOptions = Array.from({ length: 10 }, (_, i) => currentYear - i)

  return (
    <Box component="form" noValidate>
      <Stack spacing={3}>
        <Autocomplete
          options={propertyOptions}
          getOptionLabel={(o) => o.label}
          isOptionEqualToValue={(a, b) => a.id === b.id}
          value={selectedProperty}
          onChange={(_e, val) => {
            setSelectedProperty(val)
          }}
          onInputChange={(_e, val) => setPropertySearch(val)}
          loading={propertiesLoading}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Property"
              required
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {propertiesLoading ? <CircularProgress size={18} /> : null}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
            />
          )}
          sx={{ width: '100%' }}
          ListboxProps={{ style: { maxHeight: 240 } }}
        />

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <FormControl fullWidth required>
            <InputLabel>Quarter</InputLabel>
            <Select
              value={quarter}
              label="Quarter"
              onChange={(e) => setQuarter(e.target.value)}
            >
              {QUARTERS.map((q) => (
                <MenuItem key={q.value} value={q.value}>
                  {q.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth required>
            <InputLabel>Year</InputLabel>
            <Select
              value={year}
              label="Year"
              onChange={(e) => setYear(Number(e.target.value))}
            >
              {yearOptions.map((y) => (
                <MenuItem key={y} value={y}>
                  {y}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>

        <Box>
          <TextField
            label="Custom Note (optional)"
            multiline
            minRows={3}
            value={customNote}
            onChange={(e) => setCustomNote(e.target.value.slice(0, 500))}
            inputProps={{ maxLength: 500 }}
          />
          <FormHelperText sx={{ textAlign: 'right', mr: 0 }}>
            {customNote.length}/500
          </FormHelperText>
        </Box>

        {preflightFetching && (
          <Stack direction="row" spacing={1} alignItems="center">
            <CircularProgress size={16} />
            <Typography variant="body2" color="text.secondary">
              Checking available data…
            </Typography>
          </Stack>
        )}

        {!preflightFetching && noData && (
          <Alert severity="error" icon={<WarningAmberIcon />}>
            No data found for this period. Upload CSVs first.
          </Alert>
        )}

        {!preflightFetching && someData && (
          <Alert severity="warning" icon={<WarningAmberIcon />}>
            Some data sources are missing: {preflight!.missingTypes.join(', ')}. You can still
            generate but the report may be incomplete.
          </Alert>
        )}

        <Button
          variant="contained"
          color="primary"
          onClick={handleGenerateClick}
          disabled={generateDisabled}
          startIcon={isGenerating ? <CircularProgress size={18} color="inherit" /> : undefined}
          fullWidth
        >
          {isGenerating ? 'Generating…' : 'Generate Report'}
        </Button>
      </Stack>

      <Dialog
        open={showRegenerateDialog}
        onClose={handleRegenerateCancel}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Report already exists</DialogTitle>
        <DialogContent>
          <DialogContentText>
            A report for this period already exists. Regenerate? This will replace the existing
            PDF.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleRegenerateCancel}>Cancel</Button>
          <Button onClick={handleRegenerateConfirm} color="primary" variant="contained">
            Regenerate
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  )
}
