import { Box } from '@mui/material'
import termsSource from '../../content/terms.md?raw'
import { MarkdownView } from './MarkdownView'
import { LegalFooter } from '../../components/layout/LegalFooter'

export function TermsPage() {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', maxWidth: '100vw', overflowX: 'hidden' }}>
      <Box component="main" sx={{ flex: 1, minWidth: 0 }}>
        <MarkdownView source={termsSource} />
      </Box>
      <LegalFooter />
    </Box>
  )
}
