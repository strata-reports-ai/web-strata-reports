import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from './store'

interface AuthUser {
  id: string
  email: string
  displayName: string
  organisationId: string
}

interface AuthState {
  user: AuthUser | null
  initialised: boolean
}

const initialState: AuthState = {
  user: null,
  initialised: false,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, action: PayloadAction<{ user: AuthUser }>) {
      state.user = action.payload.user
      state.initialised = true
    },
    clearCredentials(state) {
      state.user = null
      state.initialised = true
    },
  },
})

export const { setCredentials, clearCredentials } = authSlice.actions
export default authSlice.reducer

export const selectIsAuthenticated = (state: RootState) => state.auth.user !== null
export const selectCurrentUser = (state: RootState) => state.auth.user
export const selectIsInitialised = (state: RootState) => state.auth.initialised
