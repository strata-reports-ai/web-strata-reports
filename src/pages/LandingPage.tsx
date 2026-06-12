import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AppBar,
  Box,
  Button,
  Chip,
  Container,
  Stack,
  Toolbar,
  Typography,
  useTheme,
} from '@mui/material'
import InsightsOutlinedIcon from '@mui/icons-material/InsightsOutlined'
import PlayCircleFilledRoundedIcon from '@mui/icons-material/PlayCircleFilledRounded'
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined'
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined'
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined'
import SpeedOutlinedIcon from '@mui/icons-material/SpeedOutlined'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import CreditCardOutlinedIcon from '@mui/icons-material/CreditCardOutlined'
import LayersOutlinedIcon from '@mui/icons-material/LayersOutlined'

type Feature = { icon: ReactNode; title: string; body: string }

const STEPS: { n: string; title: string; body: string }[] = [
  { n: '01', title: 'Upload your data', body: 'Drop in CSV exports from your PMS, accounting, and review platforms — revenue, expenses, reviews, tasks, and inspections.' },
  { n: '02', title: 'AI writes the narrative', body: 'StayRecap computes the numbers in code, then has AI write a clear quarterly story bound to those verified figures.' },
  { n: '03', title: 'Send a branded PDF', body: 'Download a polished, owner-ready PDF with charts and your branding — ready to send in about two minutes.' },
]

export function LandingPage() {
  const theme = useTheme()
  const navigate = useNavigate()
  const primary = theme.palette.primary.main

  const FEATURES: Feature[] = [
    { icon: <VerifiedOutlinedIcon />, title: 'Numbers you can trust', body: 'Figures are computed deterministically in code. The AI only narrates verified values — it never invents a number.' },
    { icon: <LayersOutlinedIcon />, title: 'Multi-source ingestion', body: 'Combine revenue, expenses, guest reviews, tasks, and inspections into one coherent owner report.' },
    { icon: <PictureAsPdfOutlinedIcon />, title: 'Owner-ready PDFs', body: 'Professional, branded 4–8 page reports with charts and a narrative that justifies the management fee.' },
    { icon: <SpeedOutlinedIcon />, title: 'Minutes, not hours', body: 'Replace 10–20 hours of spreadsheet wrangling per cycle with a report generated in under two minutes.' },
    { icon: <LockOutlinedIcon />, title: 'Secure & multi-tenant', body: 'Strict per-tenant isolation enforced at the database layer, so your data is never visible across accounts.' },
    { icon: <CreditCardOutlinedIcon />, title: 'Simple billing', body: 'Straightforward subscription plans powered by Stripe. Scale from a handful of properties to a full portfolio.' },
  ]

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* Nav */}
      <AppBar position="sticky" elevation={0} color="transparent" sx={{ backdropFilter: 'blur(8px)', backgroundColor: 'rgba(255,255,255,0.8)', borderBottom: '1px solid', borderColor: 'divider' }}>
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ gap: 1 }}>
            <InsightsOutlinedIcon sx={{ color: primary, mr: 1 }} />
            <Typography variant="h6" sx={{ fontWeight: 800, flexGrow: 1, letterSpacing: '-0.02em' }}>
              StayRecap
            </Typography>
            <Button color="inherit" onClick={() => navigate('/pricing')} sx={{ display: { xs: 'none', sm: 'inline-flex' } }}>
              Pricing
            </Button>
            <Button color="inherit" onClick={() => navigate('/auth/signin')}>
              Sign in
            </Button>
            <Button variant="contained" disableElevation onClick={() => navigate('/auth/signup')}>
              Get started
            </Button>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Hero */}
      <Box sx={{ background: `radial-gradient(1100px 480px at 50% -10%, ${primary}22, transparent 70%)` }}>
        <Container maxWidth="md" sx={{ textAlign: 'center', pt: { xs: 8, md: 14 }, pb: { xs: 8, md: 12 } }}>
          <Chip label="AI-powered owner reporting" sx={{ mb: 3, fontWeight: 600, color: primary, bgcolor: `${primary}14`, border: `1px solid ${primary}33` }} />
          <Typography variant="h2" sx={{ fontWeight: 800, letterSpacing: '-0.03em', fontSize: { xs: '2.4rem', md: '3.6rem' }, lineHeight: 1.1, mb: 2.5 }}>
            Owner reports that{' '}
            <Box component="span" sx={{ color: primary }}>write themselves.</Box>
          </Typography>
          <Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 400, maxWidth: 720, mx: 'auto', mb: 4 }}>
            StayRecap turns messy short-term-rental data — PMS exports, expense sheets, guest reviews — into a
            polished, owner-ready quarterly PDF with an AI-written narrative bound to verified numbers. In under two minutes.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center" alignItems="center">
            <Button
              variant="contained"
              size="large"
              disableElevation
              startIcon={<PlayCircleFilledRoundedIcon />}
              onClick={() => navigate('/demo')}
              sx={{
                px: 5,
                py: 1.6,
                fontSize: '1.1rem',
                fontWeight: 700,
                boxShadow: `0 10px 30px ${primary}55`,
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': { transform: 'translateY(-2px)', boxShadow: `0 14px 36px ${primary}66` },
              }}
            >
              Try the live demo
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/auth/signup')}
              sx={{ px: 4, py: 1.4, fontSize: '1rem' }}
            >
              Get started free
            </Button>
            <Button
              variant="text"
              size="large"
              onClick={() => navigate('/auth/signin')}
              sx={{ px: 2, py: 1.4, fontSize: '1rem' }}
            >
              Sign in
            </Button>
          </Stack>
          <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', mt: 2 }}>
            No sign-up required — explore a fully interactive demo with sample data.
          </Typography>
        </Container>
      </Box>

      {/* How it works */}
      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
        <Typography variant="overline" sx={{ color: primary, letterSpacing: '0.18em', fontWeight: 700, display: 'block', textAlign: 'center' }}>
          How it works
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 700, textAlign: 'center', mb: 6 }}>
          From data dump to owner report in three steps
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3 }}>
          {STEPS.map((s) => (
            <Box key={s.n} sx={{ p: 3.5, borderRadius: 3, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
              <Typography sx={{ fontWeight: 800, color: primary, fontSize: '1.5rem', mb: 1 }}>{s.n}</Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>{s.title}</Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>{s.body}</Typography>
            </Box>
          ))}
        </Box>
      </Container>

      {/* Features */}
      <Box sx={{ bgcolor: 'background.paper', borderTop: '1px solid', borderBottom: '1px solid', borderColor: 'divider' }}>
        <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
          <Typography variant="h4" sx={{ fontWeight: 700, textAlign: 'center', mb: 1.5 }}>
            Everything you need to impress owners
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', textAlign: 'center', mb: 6, maxWidth: 640, mx: 'auto' }}>
            Purpose-built for short-term-rental managers who want to spend less time in spreadsheets and more time growing.
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 3 }}>
            {FEATURES.map((f) => (
              <Box key={f.title} sx={{ p: 3.5, borderRadius: 3, border: '1px solid', borderColor: 'divider', bgcolor: 'background.default' }}>
                <Box sx={{ width: 44, height: 44, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', color: primary, bgcolor: `${primary}14`, mb: 2 }}>
                  {f.icon}
                </Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.75 }}>{f.title}</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>{f.body}</Typography>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* CTA band */}
      <Container maxWidth="md" sx={{ py: { xs: 8, md: 12 }, textAlign: 'center' }}>
        <AutoAwesomeOutlinedIcon sx={{ color: primary, fontSize: 40, mb: 2 }} />
        <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.02em', mb: 2 }}>
          Give your owners a report they'll actually read.
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4, maxWidth: 560, mx: 'auto' }}>
          Generate your first quarterly owner report today — start free and see the difference in minutes.
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
          <Button variant="contained" size="large" disableElevation onClick={() => navigate('/auth/signup')} sx={{ px: 4, py: 1.25 }}>
            Get started free
          </Button>
          <Button variant="text" size="large" onClick={() => navigate('/pricing')} sx={{ px: 2 }}>
            See pricing
          </Button>
        </Stack>
      </Container>

      {/* Footer */}
      <Box component="footer" sx={{ borderTop: '1px solid', borderColor: 'divider', py: 4 }}>
        <Container maxWidth="lg">
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between" alignItems="center">
            <Stack direction="row" spacing={1} alignItems="center">
              <InsightsOutlinedIcon sx={{ color: primary, fontSize: 20 }} />
              <Typography variant="body2" sx={{ fontWeight: 700 }}>StayRecap</Typography>
            </Stack>
            <Stack direction="row" spacing={3}>
              <Button size="small" color="inherit" onClick={() => navigate('/pricing')} sx={{ color: 'text.secondary' }}>Pricing</Button>
              <Button size="small" color="inherit" onClick={() => navigate('/legal/privacy')} sx={{ color: 'text.secondary' }}>Privacy</Button>
              <Button size="small" color="inherit" onClick={() => navigate('/legal/terms')} sx={{ color: 'text.secondary' }}>Terms</Button>
              <Button size="small" color="inherit" onClick={() => navigate('/help')} sx={{ color: 'text.secondary' }}>Help</Button>
            </Stack>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              © {new Date().getFullYear()} StayRecap
            </Typography>
          </Stack>
        </Container>
      </Box>
    </Box>
  )
}
