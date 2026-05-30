import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { AuthUser } from '../api/authApi'

export interface TenantInfo {
  id: string
  name: string
}

interface AuthState {
  user: AuthUser | null
  tenant: TenantInfo | null
  isAuthenticated: boolean
  initialised: boolean
}

const initialState: AuthState = {
  user: null,
  tenant: null,
  isAuthenticated: false,
  initialised: false,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, action: PayloadAction<{ user: AuthUser; tenant?: TenantInfo }>) {
      state.user = action.payload.user
      state.tenant = action.payload.tenant ?? null
      state.isAuthenticated = true
      state.initialised = true
    },
    clearCredentials(state) {
      state.user = null
      state.tenant = null
      state.isAuthenticated = false
      state.initialised = true
    },
  },
})

export const { setCredentials, clearCredentials } = authSlice.actions
export default authSlice.reducer
