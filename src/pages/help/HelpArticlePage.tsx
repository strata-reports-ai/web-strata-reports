import { Link as RouterLink, useParams, Navigate } from 'react-router-dom'
import { Box, Button, Typography } from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { findHelpArticle } from '../../content/help'
import { MarkdownView } from '../legal/MarkdownView'
import { LegalFooter } from '../../components/layout/LegalFooter'

export function HelpArticlePage() {
  const { slug } = useParams<{ slug: string }>()
  const article = slug ? findHelpArticle(slug) : undefined

  if (!article) {
    return <Navigate to="/help" replace />
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', maxWidth: '100vw', overflowX: 'hidden' }}>
      <Box component="main" sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ maxWidth: 720, mx: 'auto', px: { xs: 2, sm: 3 }, pt: { xs: 2, sm: 3 } }}>
          <Button
            component={RouterLink}
            to="/help"
            startIcon={<ArrowBackIcon />}
            size="small"
            sx={{ mb: 1 }}
          >
            Back to help center
          </Button>
          <Typography variant="overline" sx={{ color: 'text.secondary' }}>
            {article.category}
          </Typography>
        </Box>
        <MarkdownView source={article.source} />
      </Box>
      <LegalFooter />
    </Box>
  )
}
