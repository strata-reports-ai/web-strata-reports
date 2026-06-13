import { useEffect, useReducer, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { Box, Button, IconButton, Paper, Popper, Stack, Typography, useTheme } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { isDemo, exitDemo } from './demoMode'
import { TOUR_STEPS, START_TOUR_EVENT, type TourStep } from './tourSteps'
import { getGuide } from './howToGuides'
import { clearCredentials } from '../store/authSlice'
import type { AppDispatch } from '../store/store'

const TOUR_DONE_KEY = 'stayrecap:tour-done'
const SPOTLIGHT_PAD = 6

/**
 * A lightweight, dependency-free guided tour for demo mode. It spotlights one
 * feature at a time (dimming the rest of the page), explains it in a callout,
 * and walks the visitor across the key screens. Auto-starts once per demo
 * session; relaunchable from the demo banner; fully skippable.
 */
export function DemoTour() {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch<AppDispatch>()
  const theme = useTheme()
  const accent = theme.palette.primary.main

  const [active, setActive] = useState(false)
  const [stepIndex, setStepIndex] = useState(0)
  const [steps, setSteps] = useState<TourStep[]>(TOUR_STEPS)
  const [targetEl, setTargetEl] = useState<HTMLElement | null>(null)
  const [searchFailed, setSearchFailed] = useState(false)
  const [, reposition] = useReducer((x) => x + 1, 0)

  // Auto-start the full product tour once per demo session.
  useEffect(() => {
    if (!isDemo() || sessionStorage.getItem(TOUR_DONE_KEY)) return
    const t = setTimeout(() => {
      setSteps(TOUR_STEPS)
      setStepIndex(0)
      setActive(true)
    }, 800)
    return () => clearTimeout(t)
  }, [])

  // Launch on demand: the banner ("Take a tour" → full tour) or the How-To page
  // ("Show me how" → a specific guide), carried in the event's `guideId`.
  useEffect(() => {
    const start = (e: Event) => {
      const guideId = (e as CustomEvent<{ guideId?: string }>).detail?.guideId
      const guide = guideId ? getGuide(guideId) : undefined
      setSteps(guide && guide.steps.length > 0 ? guide.steps : TOUR_STEPS)
      sessionStorage.removeItem(TOUR_DONE_KEY)
      setTargetEl(null)
      setSearchFailed(false)
      setStepIndex(0)
      setActive(true)
    }
    window.addEventListener(START_TOUR_EVENT, start)
    return () => window.removeEventListener(START_TOUR_EVENT, start)
  }, [])

  // Locate the spotlight target for the current step (navigating there first).
  useEffect(() => {
    if (!active) return
    const step = steps[stepIndex]
    if (!step) return
    setTargetEl(null)
    setSearchFailed(false)
    if (step.route && location.pathname !== step.route) navigate(step.route)
    if (!step.selector) return // centered step, nothing to find

    let raf = 0
    let cancelled = false
    const startedAt = Date.now()
    const find = () => {
      if (cancelled) return
      const el = document.querySelector(`[data-tour="${step.selector}"]`) as HTMLElement | null
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        setTimeout(() => {
          if (!cancelled) {
            setTargetEl(el)
            reposition()
          }
        }, 350)
        return
      }
      if (Date.now() - startedAt > 2500) {
        setSearchFailed(true)
        return
      }
      raf = requestAnimationFrame(find)
    }
    const startTimer = setTimeout(() => {
      raf = requestAnimationFrame(find)
    }, 150)
    return () => {
      cancelled = true
      cancelAnimationFrame(raf)
      clearTimeout(startTimer)
    }
  }, [active, stepIndex, steps, location.pathname, navigate])

  // Keep the spotlight aligned while the page scrolls or resizes.
  useEffect(() => {
    if (!active) return
    const onChange = () => reposition()
    window.addEventListener('resize', onChange)
    window.addEventListener('scroll', onChange, true)
    return () => {
      window.removeEventListener('resize', onChange)
      window.removeEventListener('scroll', onChange, true)
    }
  }, [active])

  if (!active) return null

  const step = steps[stepIndex]
  if (!step) return null

  const isLast = stepIndex === steps.length - 1
  const rect = targetEl?.getBoundingClientRect()
  const showCard = Boolean(rect) || searchFailed || !step.selector
  const centered = !rect

  const finish = () => {
    sessionStorage.setItem(TOUR_DONE_KEY, '1')
    setActive(false)
    setStepIndex(0)
    setTargetEl(null)
  }
  const next = () => (isLast ? finish() : setStepIndex((i) => i + 1))
  const back = () => setStepIndex((i) => Math.max(0, i - 1))
  const handleSignUp = () => {
    finish()
    exitDemo()
    dispatch(clearCredentials())
    navigate('/auth/signup')
  }

  const card = (
    <Paper elevation={8} sx={{ p: 2.5, width: 360, maxWidth: 'calc(100vw - 32px)', borderRadius: 2 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1 }}>
        <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 700, letterSpacing: '0.08em' }}>
          Step {stepIndex + 1} of {steps.length}
        </Typography>
        <IconButton size="small" onClick={finish} aria-label="Close tour" sx={{ mt: -1, mr: -1 }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Stack>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
        {step.title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.6 }}>
        {step.body}
      </Typography>
      <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="center">
        <Button size="small" onClick={finish} sx={{ color: 'text.secondary' }}>
          Skip tour
        </Button>
        <Stack direction="row" spacing={1}>
          {stepIndex > 0 && (
            <Button size="small" onClick={back}>
              Back
            </Button>
          )}
          {step.cta === 'signup' ? (
            <Button size="small" variant="contained" onClick={handleSignUp}>
              Sign up
            </Button>
          ) : (
            <Button size="small" variant="contained" onClick={next}>
              {isLast ? 'Done' : 'Next'}
            </Button>
          )}
        </Stack>
      </Stack>
    </Paper>
  )

  return (
    <Box sx={{ position: 'fixed', inset: 0, zIndex: 1600, pointerEvents: 'auto' }}>
      {/* Dim everything, punch a transparent hole over the spotlighted element. */}
      <Box
        component="svg"
        width="100%"
        height="100%"
        sx={{ position: 'absolute', inset: 0, display: 'block', pointerEvents: 'none' }}
      >
        <defs>
          <mask id="sr-tour-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {rect && (
              <rect
                x={rect.left - SPOTLIGHT_PAD}
                y={rect.top - SPOTLIGHT_PAD}
                width={rect.width + SPOTLIGHT_PAD * 2}
                height={rect.height + SPOTLIGHT_PAD * 2}
                rx="10"
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect x="0" y="0" width="100%" height="100%" fill="rgba(8,12,20,0.62)" mask="url(#sr-tour-mask)" />
        {rect && (
          <rect
            x={rect.left - SPOTLIGHT_PAD}
            y={rect.top - SPOTLIGHT_PAD}
            width={rect.width + SPOTLIGHT_PAD * 2}
            height={rect.height + SPOTLIGHT_PAD * 2}
            rx="10"
            fill="none"
            stroke={accent}
            strokeWidth="2.5"
          />
        )}
      </Box>

      {showCard &&
        (centered ? (
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          >
            {card}
          </Box>
        ) : (
          <Popper
            open
            anchorEl={targetEl}
            placement={step.placement ?? 'bottom'}
            modifiers={[
              { name: 'offset', options: { offset: [0, 14] } },
              { name: 'preventOverflow', options: { padding: 12 } },
              { name: 'flip', options: { padding: 12 } },
            ]}
            sx={{ zIndex: 1700 }}
          >
            {card}
          </Popper>
        ))}
    </Box>
  )
}
