import { Link as RouterLink } from 'react-router-dom'
import { useSelector } from 'react-redux'
import {
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  Typography,
} from '@mui/material'
import Grid from '@mui/material/Grid2'
import CheckIcon from '@mui/icons-material/Check'
import { PLANS, OVERAGE_RATE_PER_REPORT, type Plan } from '../config/plans'
import { LegalFooter } from '../components/layout/LegalFooter'
import { RootState } from '../store/store'

function PlanCard({ plan, ctaHref }: { plan: Plan; ctaHref: string }) {
  return (
    <Card
      variant="outlined"
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h6" fontWeight={700}>
          {plan.name}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {plan.description}
        </Typography>
        <Stack direction="row" alignItems="baseline" spacing={0.5} sx={{ mb: 2 }}>
          <Typography variant="h4" fontWeight={700}>
            ${plan.priceMonthly}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            /mo
          </Typography>
        </Stack>

        <Stack spacing={1} sx={{ mb: 2 }}>
          {plan.features.map((feature) => (
            <Stack key={feature} direction="row" spacing={1} alignItems="flex-start">
              <CheckIcon fontSize="small" color="primary" sx={{ mt: '2px' }} />
              <Typography variant="body2">{feature}</Typography>
            </Stack>
          ))}
        </Stack>

        {!plan.unlimitedReports && (
          <Typography variant="caption" color="text.secondary" sx={{ mb: 2 }}>
            Additional reports beyond your quota are billed at $
            {OVERAGE_RATE_PER_REPORT}/report.
          </Typography>
        )}

        <Box sx={{ flex: 1 }} />

        <Button
          component={RouterLink}
          to={ctaHref}
          variant="contained"
          fullWidth
          sx={{ minHeight: 44, mt: 1 }}
        >
          Get started
        </Button>
      </CardContent>
    </Card>
  )
}

export function PricingPage() {
  const user = useSelector((state: RootState) => state.auth.user)
  const isAuthenticated = user !== null

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        maxWidth: '100vw',
        overflowX: 'hidden',
      }}
    >
      <Box
        component="main"
        sx={{
          flex: 1,
          px: { xs: 2, sm: 3 },
          py: { xs: 4, md: 6 },
          maxWidth: 1100,
          mx: 'auto',
          width: '100%',
        }}
      >
        <Stack spacing={1} sx={{ mb: { xs: 3, md: 5 }, textAlign: 'center' }}>
          <Typography variant="h4" fontWeight={700}>
            Pricing
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Simple monthly plans. Cancel anytime.
          </Typography>
        </Stack>

        <Grid container spacing={{ xs: 2, md: 3 }}>
          {PLANS.map((plan) => {
            const ctaHref = isAuthenticated
              ? '/settings/billing'
              : `/auth/register?plan=${encodeURIComponent(plan.id)}`
            return (
              <Grid key={plan.id} size={{ xs: 12, md: 4 }}>
                <PlanCard plan={plan} ctaHref={ctaHref} />
              </Grid>
            )
          })}
        </Grid>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: { xs: 3, md: 5 }, textAlign: 'center' }}
        >
          All plans include core report generation. Overage rate of $
          {OVERAGE_RATE_PER_REPORT}/report applies once your included quarterly
          quota is used.
        </Typography>
      </Box>
      <LegalFooter />
    </Box>
  )
}
