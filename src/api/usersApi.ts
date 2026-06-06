import { baseApi } from './baseApi'

export type InvitationRole = 'admin' | 'member'

export interface InviteUserRequest {
  email: string
  role: InvitationRole
}

export interface InviteUserResponse {
  id: string
  email: string
  role: InvitationRole
  invitedAt: string
  expiresAt: string
}

export interface PendingInvitation {
  id: string
  email: string
  role: InvitationRole
  invitedAt: string
  expiresAt: string
}

export interface PendingInvitationsResponse {
  items: PendingInvitation[]
}

export const usersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    inviteUser: builder.mutation<InviteUserResponse, InviteUserRequest>({
      query: (body) => ({
        url: 'users/invite',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Invitation'],
    }),
    getPendingInvitations: builder.query<PendingInvitationsResponse, void>({
      query: () => 'users/invite/pending',
      providesTags: ['Invitation'],
    }),
  }),
})

export const { useInviteUserMutation, useGetPendingInvitationsQuery } = usersApi
