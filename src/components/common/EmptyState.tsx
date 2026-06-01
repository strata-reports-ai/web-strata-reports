import type { ReactNode } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { Box, Button, Typography } from '@mui/material'

export interface EmptyStateProps {
  title: string
  description: string
  ctaLabel: string
  ctaHref?: string
  onCtaClick?: () => void
  icon?: ReactNode
  ctaDisabled?: boolean
}

export function EmptyState({
  title,
  description,
  ctaLabel,
  ctaHref,
  onCtaClick,
  icon,
  ctaDisabled = false,
}: EmptyStateProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        py: { xs: 5, sm: 8 },
        px: 2,
        gap: 1.5,
      }}
    >
      {icon && (
        <Box sx={{ color: 'text.disabled', mb: 0.5, display: 'flex' }}>
          {icon}
        </Box>
      )}
      <Typography variant="h6" component="h2">
        {title}
      </Typography>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ maxWidth: 380, mb: 1 }}
      >
        {description}
      </Typography>
      {ctaHref ? (
        <Button
          variant="contained"
          size="medium"
          disabled={ctaDisabled}
          component={RouterLink}
          to={ctaHref}
        >
          {ctaLabel}
        </Button>
      ) : (
        <Button
          variant="contained"
          size="medium"
          disabled={ctaDisabled}
          onClick={onCtaClick}
        >
          {ctaLabel}
        </Button>
      )}
    </Box>
  )
}
