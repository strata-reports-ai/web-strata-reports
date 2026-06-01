import { Box, Link, Stack, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'

export function LegalFooter() {
  return (
    <Box
      component="footer"
      sx={{
        py: 2,
        px: { xs: 2, sm: 3 },
        borderTop: 1,
        borderColor: 'divider',
        textAlign: 'center',
      }}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={{ xs: 1, sm: 2 }}
        justifyContent="center"
        alignItems="center"
      >
        <Typography variant="body2" color="text.secondary">
          &copy; {new Date().getFullYear()} StrataReport AI
        </Typography>
        <Link component={RouterLink} to="/legal/privacy" variant="body2" color="text.secondary" underline="hover">
          Privacy Policy
        </Link>
        <Link component={RouterLink} to="/legal/terms" variant="body2" color="text.secondary" underline="hover">
          Terms of Service
        </Link>
      </Stack>
    </Box>
  )
}
