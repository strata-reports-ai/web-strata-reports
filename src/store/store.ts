import { configureStore } from '@reduxjs/toolkit'
import { baseApi } from '../api/baseApi'
import authReducer from './authSlice'
import onboardingReducer from './onboardingSlice'
import billingReducer from './billingSlice'
import { billingErrorMiddleware } from './billingErrorMiddleware'

export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
    auth: authReducer,
    onboarding: onboardingReducer,
    billing: billingReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware, billingErrorMiddleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
