import { Box, Typography } from '@mui/material'
import { useParams } from 'react-router-dom'

export function ReportDetailPage() {
  const { id } = useParams<{ id: string }>()

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Typography variant="h5">Report {id}</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        Report details coming soon.
      </Typography>
    </Box>
  )
}
