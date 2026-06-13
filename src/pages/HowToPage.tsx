import { useMemo, useState } from 'react'
import {
  Box,
  Button,
  Card,
  CardContent,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded'
import { HOW_TO_GUIDES } from '../demo/howToGuides'
import { startTour } from '../demo/tourSteps'

export function HowToPage() {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return HOW_TO_GUIDES
    return HOW_TO_GUIDES.filter((g) =>
      [g.title, g.description, g.category, ...g.keywords].join(' ').toLowerCase().includes(q),
    )
  }, [query])

  const categories = useMemo(
    () => [...new Set(filtered.map((g) => g.category))],
    [filtered],
  )

  return (
    <Box sx={{ maxWidth: 860, mx: 'auto' }}>
      <Typography variant="h5" sx={{ mb: 1 }}>
        How-To guides
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Pick something you want to do and StayRecap will walk you through it, step by step, right here
        in the app — no video required.
      </Typography>

      <TextField
        fullWidth
        placeholder="Search guides — e.g. “generate a report”, “import CSV”, “billing”…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 3 }}
      />

      {filtered.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No guides match “{query}”. Try another search.
        </Typography>
      ) : (
        <Stack spacing={3}>
          {categories.map((category) => (
            <Box key={category}>
              <Typography
                variant="overline"
                sx={{ color: 'primary.main', fontWeight: 700, letterSpacing: '0.08em' }}
              >
                {category}
              </Typography>
              <Stack spacing={1.5} sx={{ mt: 1 }}>
                {filtered
                  .filter((g) => g.category === category)
                  .map((guide) => (
                    <Card key={guide.id} variant="outlined">
                      <CardContent
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 2,
                          flexWrap: 'wrap',
                        }}
                      >
                        <Box sx={{ minWidth: 0, flex: 1 }}>
                          <Typography variant="subtitle1" fontWeight={700}>
                            {guide.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {guide.description}
                          </Typography>
                        </Box>
                        <Button
                          variant="contained"
                          startIcon={<PlayArrowRoundedIcon />}
                          onClick={() => startTour(guide.id)}
                          sx={{ flexShrink: 0, minHeight: 44 }}
                        >
                          Show me how
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
              </Stack>
            </Box>
          ))}
        </Stack>
      )}
    </Box>
  )
}
