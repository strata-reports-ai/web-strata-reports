import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from './store'

interface AuthUser {
  id: string
  email: string
  displayName: string
  organisationId: string
}

interface AuthState {
  token: string | null
  user: AuthUser | null
}

const initialState: AuthState = {
  token: localStorage.getItem('auth_token'),
  user: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, action: PayloadAction<{ token: string; user: AuthUser }>) {
      state.token = action.payload.token
      state.user = action.payload.user
      localStorage.setItem('auth_token', action.payload.token)
    },
    clearCredentials(state) {
      state.token = null
      state.user = null
      localStorage.removeItem('auth_token')
    },
  },
})

export const { setCredentials, clearCredentials } = authSlice.actions
export default authSlice.reducer

export const selectIsAuthenticated = (state: RootState) => state.auth.token !== null
export const selectCurrentUser = (state: RootState) => state.auth.user
