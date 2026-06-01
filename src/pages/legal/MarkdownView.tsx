import { Box, Typography } from '@mui/material'

interface MarkdownViewProps {
  source: string
}

type Block =
  | { kind: 'h1'; text: string }
  | { kind: 'h2'; text: string }
  | { kind: 'p'; text: string }
  | { kind: 'ul'; items: string[] }

function parseMarkdown(source: string): Block[] {
  const lines = source.replace(/\r\n/g, '\n').split('\n')
  const blocks: Block[] = []
  let paragraph: string[] = []
  let listItems: string[] = []

  const flushParagraph = () => {
    if (paragraph.length > 0) {
      blocks.push({ kind: 'p', text: paragraph.join(' ').trim() })
      paragraph = []
    }
  }
  const flushList = () => {
    if (listItems.length > 0) {
      blocks.push({ kind: 'ul', items: listItems })
      listItems = []
    }
  }

  for (const raw of lines) {
    const line = raw.trimEnd()
    if (line.trim() === '') {
      flushParagraph()
      flushList()
      continue
    }
    if (line.startsWith('# ')) {
      flushParagraph()
      flushList()
      blocks.push({ kind: 'h1', text: line.slice(2).trim() })
      continue
    }
    if (line.startsWith('## ')) {
      flushParagraph()
      flushList()
      blocks.push({ kind: 'h2', text: line.slice(3).trim() })
      continue
    }
    if (line.startsWith('- ')) {
      flushParagraph()
      listItems.push(line.slice(2).trim())
      continue
    }
    flushList()
    paragraph.push(line.trim())
  }
  flushParagraph()
  flushList()
  return blocks
}

export function MarkdownView({ source }: MarkdownViewProps) {
  const blocks = parseMarkdown(source)
  return (
    <Box sx={{ maxWidth: 720, mx: 'auto', px: { xs: 2, sm: 3 }, py: { xs: 3, sm: 4 } }}>
      {blocks.map((block, index) => {
        if (block.kind === 'h1') {
          return (
            <Typography
              key={index}
              variant="h4"
              component="h1"
              fontWeight={700}
              sx={{ mt: index === 0 ? 0 : 4, mb: 2, wordBreak: 'break-word' }}
            >
              {block.text}
            </Typography>
          )
        }
        if (block.kind === 'h2') {
          return (
            <Typography
              key={index}
              variant="h6"
              component="h2"
              fontWeight={600}
              sx={{ mt: 3, mb: 1.5, wordBreak: 'break-word' }}
            >
              {block.text}
            </Typography>
          )
        }
        if (block.kind === 'ul') {
          return (
            <Box key={index} component="ul" sx={{ pl: 3, my: 1.5 }}>
              {block.items.map((item, i) => (
                <Typography key={i} component="li" variant="body1" sx={{ mb: 0.5, wordBreak: 'break-word' }}>
                  {item}
                </Typography>
              ))}
            </Box>
          )
        }
        return (
          <Typography key={index} variant="body1" sx={{ mb: 1.5, wordBreak: 'break-word' }}>
            {block.text}
          </Typography>
        )
      })}
    </Box>
  )
}
