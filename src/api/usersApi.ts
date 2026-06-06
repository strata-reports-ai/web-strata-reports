import { baseApi } from './baseApi'

export type InvitationRole = 'admin' | 'member'

export type UserRole = 'owner' | 'admin' | 'member'

export type UpdatableUserRole = UserRole | 'deactivated'

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

export interface TenantUser {
  id: string
  email: string
  displayName: string | null
  role: UserRole
  lastLoginAt: string | null
}

export interface ListUsersResponse {
  items: TenantUser[]
}

export interface UpdateUserRoleRequest {
  id: string
  role: UpdatableUserRole
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
    listUsers: builder.query<ListUsersResponse, void>({
      query: () => 'users',
      providesTags: ['User'],
    }),
    updateUserRole: builder.mutation<TenantUser, UpdateUserRoleRequest>({
      query: ({ id, role }) => ({
        url: `users/${id}/role`,
        method: 'PATCH',
        body: { role },
      }),
      invalidatesTags: ['User'],
    }),
  }),
})

export const {
  useInviteUserMutation,
  useGetPendingInvitationsQuery,
  useListUsersQuery,
  useUpdateUserRoleMutation,
} = usersApi
