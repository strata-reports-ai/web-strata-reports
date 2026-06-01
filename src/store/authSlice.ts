import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { AuthUser } from '../api/authApi'

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
    setCredentials(state, action: PayloadAction<AuthUser>) {
      state.user = action.payload
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
