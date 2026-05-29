import { baseApi } from './baseApi'

export interface PropertyListItem {
  id: string
  name: string
  address: string
  city: string
  ownerName: string
  units: number
  lastReportDate: string | null
  lastImportDate: string | null
}

export interface PropertyListResponse {
  items: PropertyListItem[]
  totalCount: number
  page: number
  pageSize: number
}

export interface PropertyListParams {
  search?: string
  city?: string
  owner_name?: string
  sortBy?: 'name' | 'last_report_date' | 'last_import_date'
  sortDir?: 'asc' | 'desc'
  page?: number
  pageSize?: number
}

export interface PropertyFilterOptions {
  cities: string[]
  ownerNames: string[]
}

export interface CreatePropertyRequest {
  name: string
  address: string
  city: string
  ownerName: string
  units: number
}

export interface UpdatePropertyRequest {
  id: string
  name: string
  address: string
  city: string
  ownerName: string
  units: number
}

export const propertiesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProperty: builder.query<PropertyListItem, string>({
      query: (id) => `properties/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Properties', id }],
      keepUnusedDataFor: 60,
    }),
    getProperties: builder.query<PropertyListResponse, PropertyListParams>({
      query: (params) => ({
        url: 'properties',
        params: {
          ...(params.search ? { search: params.search } : {}),
          ...(params.city ? { city: params.city } : {}),
          ...(params.owner_name ? { owner_name: params.owner_name } : {}),
          ...(params.sortBy ? { sortBy: params.sortBy } : {}),
          ...(params.sortDir ? { sortDir: params.sortDir } : {}),
          page: params.page ?? 1,
          pageSize: params.pageSize ?? 25,
        },
      }),
      providesTags: ['Properties'],
      keepUnusedDataFor: 60,
    }),
    getPropertyFilterOptions: builder.query<PropertyFilterOptions, void>({
      query: () => 'properties/filter-options',
      providesTags: ['Properties'],
    }),
    createProperty: builder.mutation<PropertyListItem, CreatePropertyRequest>({
      query: (body) => ({
        url: 'properties',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Properties'],
    }),
    updateProperty: builder.mutation<PropertyListItem, UpdatePropertyRequest>({
      query: ({ id, ...body }) => ({
        url: `properties/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Properties'],
    }),
    deleteProperty: builder.mutation<void, string>({
      query: (id) => ({
        url: `properties/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Properties'],
    }),
  }),
})

export const {
  useGetPropertyQuery,
  useGetPropertiesQuery,
  useGetPropertyFilterOptionsQuery,
  useCreatePropertyMutation,
  useUpdatePropertyMutation,
  useDeletePropertyMutation,
} = propertiesApi
