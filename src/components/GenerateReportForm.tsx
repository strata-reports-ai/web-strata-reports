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
  FormLabel,
  InputLabel,
  Link,
  MenuItem,
  Select,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import { Link as RouterLink } from 'react-router-dom'
import { useGetPropertiesQuery } from '../api/propertiesApi'
import { useLazyGetPreflightQuery, useGenerateReportMutation } from '../api/reportSlice'
import { useBillingGate } from '../hooks/useBillingGate'

type ReportPeriodType = 'quarterly' | 'monthly'
type QuarterValue = 'Q1' | 'Q2' | 'Q3' | 'Q4'

const QUARTERS: { label: string; value: QuarterValue }[] = [
  { label: 'Q1 (Jan–Mar)', value: 'Q1' },
  { label: 'Q2 (Apr–Jun)', value: 'Q2' },
  { label: 'Q3 (Jul–Sep)', value: 'Q3' },
  { label: 'Q4 (Oct–Dec)', value: 'Q4' },
]

const MONTHS = [
  { label: 'Jan', value: 1 },
  { label: 'Feb', value: 2 },
  { label: 'Mar', value: 3 },
  { label: 'Apr', value: 4 },
  { label: 'May', value: 5 },
  { label: 'Jun', value: 6 },
  { label: 'Jul', value: 7 },
  { label: 'Aug', value: 8 },
  { label: 'Sep', value: 9 },
  { label: 'Oct', value: 10 },
  { label: 'Nov', value: 11 },
  { label: 'Dec', value: 12 },
]

const QUARTER_DATES: Record<QuarterValue, { start: string; end: string }> = {
  Q1: { start: '-01-01', end: '-03-31' },
  Q2: { start: '-04-01', end: '-06-30' },
  Q3: { start: '-07-01', end: '-09-30' },
  Q4: { start: '-10-01', end: '-12-31' },
}

function pad2(n: number) {
  return n < 10 ? `0${n}` : `${n}`
}

function getQuarterPeriodDates(quarter: QuarterValue, year: number) {
  const q = QUARTER_DATES[quarter]
  return {
    periodStart: `${year}${q.start}`,
    periodEnd: `${year}${q.end}`,
  }
}

function getMonthPeriodDates(month: number, year: number) {
  const start = `${year}-${pad2(month)}-01`
  const lastDay = new Date(year, month, 0).getDate()
  const end = `${year}-${pad2(month)}-${pad2(lastDay)}`
  return { periodStart: start, periodEnd: end }
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
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1

  const [propertySearch, setPropertySearch] = useState('')
  const [selectedProperty, setSelectedProperty] = useState<PropertyOption | null>(null)
  const [periodType, setPeriodType] = useState<ReportPeriodType>('quarterly')
  const [quarter, setQuarter] = useState<QuarterValue>('Q1')
  const [month, setMonth] = useState<number>(currentMonth)
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

  const computePeriod = useCallback(() => {
    if (periodType === 'monthly') {
      return getMonthPeriodDates(month, year)
    }
    return getQuarterPeriodDates(quarter, year)
  }, [periodType, quarter, month, year])

  const { periodStart, periodEnd } = selectedProperty
    ? computePeriod()
    : { periodStart: '', periodEnd: '' }

  const [triggerPreflight, { data: preflight, isFetching: preflightFetching, isUninitialized: preflightUninitialized }] =
    useLazyGetPreflightQuery()

  const [generateReport, { isLoading: isGenerating }] = useGenerateReportMutation()

  const { isBlocked, blockReason, reportsAtLimit } = useBillingGate()
  const gated = isBlocked || reportsAtLimit

  useEffect(() => {
    if (!selectedProperty) return
    if (periodType === 'quarterly' && quarter && year) {
      const { periodStart: ps, periodEnd: pe } = getQuarterPeriodDates(quarter, year)
      triggerPreflight({ propertyId: selectedProperty.id, periodStart: ps, periodEnd: pe })
    } else if (periodType === 'monthly' && month && year) {
      const { periodStart: ps, periodEnd: pe } = getMonthPeriodDates(month, year)
      triggerPreflight({ propertyId: selectedProperty.id, periodStart: ps, periodEnd: pe })
    }
  }, [selectedProperty, periodType, quarter, month, year, triggerPreflight])

  const noData = preflight && !preflight.hasSomeData
  const someData = preflight && preflight.hasSomeData && preflight.missingTypes.length > 0
  const generateDisabled =
    !selectedProperty || preflightFetching || preflightUninitialized || noData || isGenerating || gated

  const doGenerate = useCallback(
    async (force = false) => {
      if (!selectedProperty) return
      try {
        const payload =
          periodType === 'monthly'
            ? {
                propertyId: selectedProperty.id,
                reportType: 'monthly_owner' as const,
                month,
                year,
                periodStart,
                periodEnd,
                customNote: customNote || undefined,
              }
            : {
                propertyId: selectedProperty.id,
                reportType: 'quarterly_owner' as const,
                quarter,
                year,
                periodStart,
                periodEnd,
                customNote: customNote || undefined,
              }
        const result = await generateReport(payload).unwrap()
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
    [
      selectedProperty,
      periodType,
      quarter,
      month,
      year,
      periodStart,
      periodEnd,
      customNote,
      generateReport,
      onSuccess,
      onError,
    ],
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
    <Box component="form" noValidate data-tour="generate-form">
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

        <FormControl>
          <FormLabel id="report-period-label" sx={{ mb: 1 }}>
            Report period
          </FormLabel>
          <ToggleButtonGroup
            aria-labelledby="report-period-label"
            value={periodType}
            exclusive
            color="primary"
            onChange={(_e, val: ReportPeriodType | null) => {
              if (val) setPeriodType(val)
            }}
            fullWidth
          >
            <ToggleButton value="quarterly">Quarterly</ToggleButton>
            <ToggleButton value="monthly">Monthly</ToggleButton>
          </ToggleButtonGroup>
        </FormControl>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          {periodType === 'quarterly' ? (
            <FormControl fullWidth required>
              <InputLabel>Quarter</InputLabel>
              <Select
                value={quarter}
                label="Quarter"
                onChange={(e) => setQuarter(e.target.value as QuarterValue)}
              >
                {QUARTERS.map((q) => (
                  <MenuItem key={q.value} value={q.value}>
                    {q.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : (
            <FormControl fullWidth required>
              <InputLabel>Month</InputLabel>
              <Select
                value={month}
                label="Month"
                onChange={(e) => setMonth(Number(e.target.value))}
              >
                {MONTHS.map((m) => (
                  <MenuItem key={m.value} value={m.value}>
                    {m.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

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
            fullWidth
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

        {gated && blockReason && (
          <Alert severity="warning" icon={<WarningAmberIcon />}>
            {blockReason}{' '}
            <Link component={RouterLink} to="/settings/billing">
              Go to billing
            </Link>
          </Alert>
        )}

        <Tooltip title={gated ? 'Upgrade your plan' : ''}>
          <span>
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
          </span>
        </Tooltip>
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
