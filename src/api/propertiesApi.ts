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

export const propertiesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
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
  useGetPropertiesQuery,
  useGetPropertyFilterOptionsQuery,
  useDeletePropertyMutation,
} = propertiesApi
