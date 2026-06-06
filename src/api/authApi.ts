import { baseApi } from './baseApi'

export interface AuthUser {
  id: string
  email: string
  displayName: string | null
  role: string
  isEmailVerified: boolean
}

export type MeResponse = AuthUser

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  message: string
  redirectTo: string
}

export interface RegisterRequest {
  email: string
  password: string
  displayName: string
  organisationName: string
}

export interface RegisterResponse {
  message: string
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ForgotPasswordResponse {
  message: string
}

export interface ResetPasswordRequest {
  token: string
  newPassword: string
}

export interface ResetPasswordResponse {
  message: string
}

export interface VerifyEmailRequest {
  token: string
}

export interface VerifyEmailResponse {
  message: string
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMe: builder.query<MeResponse, void>({
      query: () => 'users/me',
      providesTags: ['Me'],
    }),
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (body) => ({
        url: 'auth/login',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Me'],
    }),
    register: builder.mutation<RegisterResponse, RegisterRequest>({
      query: (body) => ({
        url: 'auth/register',
        method: 'POST',
        body,
      }),
    }),
    forgotPassword: builder.mutation<ForgotPasswordResponse, ForgotPasswordRequest>({
      query: (body) => ({
        url: 'auth/forgot-password',
        method: 'POST',
        body,
      }),
    }),
    resetPassword: builder.mutation<ResetPasswordResponse, ResetPasswordRequest>({
      query: (body) => ({
        url: 'auth/reset-password',
        method: 'POST',
        body,
      }),
    }),
    verifyEmail: builder.mutation<VerifyEmailResponse, VerifyEmailRequest>({
      query: ({ token }) => ({
        url: `auth/verify-email?token=${encodeURIComponent(token)}`,
        method: 'GET',
      }),
    }),
  }),
})

export const {
  useGetMeQuery,
  useLoginMutation,
  useRegisterMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useVerifyEmailMutation,
} = authApi
