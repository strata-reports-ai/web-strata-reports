import { Box } from '@mui/material'
import privacySource from '../../content/privacy.md?raw'
import { MarkdownView } from './MarkdownView'
import { LegalFooter } from '../../components/layout/LegalFooter'

export function PrivacyPage() {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', maxWidth: '100vw', overflowX: 'hidden' }}>
      <Box component="main" sx={{ flex: 1, minWidth: 0 }}>
        <MarkdownView source={privacySource} />
      </Box>
      <LegalFooter />
    </Box>
  )
}
