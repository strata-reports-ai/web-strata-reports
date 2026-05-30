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
}

const initialState: AuthState = {
  user: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, action: PayloadAction<{ user: AuthUser }>) {
      state.user = action.payload.user
    },
    clearCredentials(state) {
      state.user = null
    },
  },
})

export const { setCredentials, clearCredentials } = authSlice.actions
export default authSlice.reducer

export const selectIsAuthenticated = (state: RootState) => state.auth.user !== null
export const selectCurrentUser = (state: RootState) => state.auth.user
