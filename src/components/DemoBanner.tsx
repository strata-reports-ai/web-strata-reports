import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { Box, Button, Stack, Typography } from '@mui/material'
import ExploreOutlinedIcon from '@mui/icons-material/ExploreOutlined'
import { exitDemo, isDemo } from '../demo/demoMode'
import { START_TOUR_EVENT } from '../demo/tourSteps'
import { clearCredentials } from '../store/authSlice'
import type { AppDispatch } from '../store/store'

export function DemoBanner() {
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()

  if (!isDemo()) return null

  const handleSignUp = () => {
    exitDemo()
    dispatch(clearCredentials())
    navigate('/auth/signup')
  }

  return (
    <Box
      sx={{
        bgcolor: 'warning.light',
        color: 'warning.contrastText',
        px: 2,
        py: 1,
        position: 'sticky',
        top: 0,
        zIndex: 1200,
      }}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1}
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        justifyContent="space-between"
      >
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          You're viewing a demo with sample data
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <Button
            variant="text"
            size="small"
            color="inherit"
            startIcon={<ExploreOutlinedIcon />}
            onClick={() => window.dispatchEvent(new Event(START_TOUR_EVENT))}
            sx={{ minHeight: 36 }}
          >
            Take a tour
          </Button>
          <Button
            variant="contained"
            size="small"
            color="primary"
            onClick={handleSignUp}
            sx={{ minHeight: 36 }}
          >
            Sign up
          </Button>
        </Stack>
      </Stack>
    </Box>
  )
}
