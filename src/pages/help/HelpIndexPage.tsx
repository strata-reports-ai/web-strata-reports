import { useMemo, useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import {
  Box,
  List,
  ListItemButton,
  ListItemText,
  TextField,
  Typography,
} from '@mui/material'
import {
  HELP_ARTICLES,
  HELP_CATEGORY_ORDER,
  type HelpArticle,
  type HelpCategory,
} from '../../content/help'
import { LegalFooter } from '../../components/layout/LegalFooter'

export function HelpIndexPage() {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return HELP_ARTICLES
    return HELP_ARTICLES.filter((article) => article.title.toLowerCase().includes(q))
  }, [query])

  const grouped = useMemo(() => {
    const map = new Map<HelpCategory, HelpArticle[]>()
    for (const category of HELP_CATEGORY_ORDER) {
      map.set(category, [])
    }
    for (const article of filtered) {
      map.get(article.category)?.push(article)
    }
    return map
  }, [filtered])

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', maxWidth: '100vw', overflowX: 'hidden' }}>
      <Box
        component="main"
        sx={{ flex: 1, minWidth: 0, maxWidth: 720, width: '100%', mx: 'auto', px: { xs: 2, sm: 3 }, py: { xs: 3, sm: 4 } }}
      >
        <Typography variant="h4" component="h1" fontWeight={700} sx={{ mb: 1 }}>
          Help center
        </Typography>
        <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
          Answers to the most common questions about StayRecap.
        </Typography>
        <TextField
          fullWidth
          placeholder="Search articles"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          inputProps={{ 'aria-label': 'Search help articles' }}
          sx={{ mb: 3 }}
        />
        {filtered.length === 0 ? (
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            No articles match your search.
          </Typography>
        ) : (
          HELP_CATEGORY_ORDER.map((category) => {
            const articles = grouped.get(category) ?? []
            if (articles.length === 0) return null
            return (
              <Box key={category} sx={{ mb: 3 }}>
                <Typography variant="h6" component="h2" fontWeight={600} sx={{ mb: 1 }}>
                  {category}
                </Typography>
                <List disablePadding>
                  {articles.map((article) => (
                    <ListItemButton
                      key={article.slug}
                      component={RouterLink}
                      to={`/help/${article.slug}`}
                      sx={{ minHeight: 44, borderRadius: 1 }}
                    >
                      <ListItemText primary={article.title} />
                    </ListItemButton>
                  ))}
                </List>
              </Box>
            )
          })
        )}
      </Box>
      <LegalFooter />
    </Box>
  )
}
