import { Box, Typography } from '@mui/material'
import { useParams } from 'react-router-dom'

export function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>()
  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Typography variant="h5">Property Details</Typography>
      <Typography variant="body2" color="text.secondary">Property ID: {id}</Typography>
    </Box>
  )
}
