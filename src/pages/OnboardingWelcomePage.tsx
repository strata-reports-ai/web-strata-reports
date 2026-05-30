import { Box, Button, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'

export function OnboardingWelcomePage() {
  const navigate = useNavigate()

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        p: { xs: 2, md: 3 },
        textAlign: 'center',
      }}
    >
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Welcome to StrataReport AI
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 480 }}>
        Let's get you set up. Add your first property, upload data, and generate your first report.
      </Typography>
      <Button variant="contained" size="large" onClick={() => navigate('/dashboard')}>
        Get Started
      </Button>
    </Box>
  )
}
