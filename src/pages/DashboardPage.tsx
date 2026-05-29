import { Box, Button, Typography } from '@mui/material'
import AddchartIcon from '@mui/icons-material/Addchart'
import { useNavigate } from 'react-router-dom'

export function DashboardPage() {
  const navigate = useNavigate()
  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3 }}>Dashboard</Typography>
      <Button
        variant="contained"
        startIcon={<AddchartIcon />}
        onClick={() => navigate('/reports/new')}
      >
        Generate Report
      </Button>
    </Box>
  )
}
