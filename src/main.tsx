import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { RouterProvider } from 'react-router-dom'
import { ThemeProvider, CssBaseline } from '@mui/material'
import { store } from './store/store'
import { router } from './router'
import { theme } from './theme'
import { AuthInitialiser } from './components/AuthInitialiser'
import { initAnalytics } from './services/analytics'

initAnalytics(import.meta.env.VITE_POSTHOG_KEY, import.meta.env.VITE_POSTHOG_HOST)

// After a new version is deployed, the hashed JS chunks referenced by an
// already-open tab (or a stale-cached index.html) no longer exist, so the next
// lazy route import fails with "Failed to fetch dynamically imported module".
// Reload once to pull the fresh build instead of crashing the route. The
// timestamp guard prevents a reload loop if the failure is for another reason.
window.addEventListener('vite:preloadError', () => {
  const RELOAD_KEY = 'stayrecap:chunk-reload-at'
  const last = Number(sessionStorage.getItem(RELOAD_KEY) || 0)
  if (Date.now() - last < 10_000) return
  sessionStorage.setItem(RELOAD_KEY, String(Date.now()))
  window.location.reload()
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthInitialiser />
        <RouterProvider router={router} />
      </ThemeProvider>
    </Provider>
  </StrictMode>,
)
