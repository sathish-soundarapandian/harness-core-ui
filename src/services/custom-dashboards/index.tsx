/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

/* Generated by restful-react */

import React from 'react'
import { Get, GetProps, useGet, UseGetProps, Mutate, MutateProps, useMutate, UseMutateProps } from 'restful-react'

import { getConfig, getUsingFetch, GetUsingFetchProps, mutateUsingFetch, MutateUsingFetchProps } from '../config'
export const SPEC_VERSION = '1.0.0'
export interface CloneDashboardRequestBody {
  dashboardId: string
  description?: string
  folderId?: string
  name?: string
}

export interface ClonedDashboardModel {
  description: string
  id: string
  resourceIdentifier: string
  title: string
}

export interface ClonedDashboardResponse {
  resource: ClonedDashboardModel
}

export interface CreateDashboardRequest {
  dashboardId?: number
  description?: string
  folderId: string
  name: string
}

export interface CreateDashboardResponse {
  resource?: number
}

export interface CreateFolderRequestBody {
  name: string
}

export interface CreateFolderResponse {
  resource: string
  responseMessages?: string
}

export interface DashboardFolderModel {
  created_at: string
  id: string
  title: string
}

export interface DashboardModel {
  created_at: string
  data_source: ('CI' | 'STO' | 'CE' | 'CD' | 'CF')[]
  description: string
  favorite_count: number
  folder: DashboardFolderModel
  id: string
  last_accessed_at: string
  resourceIdentifier: string
  title: string
  type: string
  view_count: number
}

export interface DeleteDashboardRequest {
  dashboardId: string
}

export interface DeleteDashboardResponse {
  resource: DeleteDashboardResponseResource
}

export interface DeleteDashboardResponseResource {
  id: string
}

export interface ErrorFolderParameters {
  accountId?: string
  folderId?: string
  name?: string
}

export interface ErrorResponse {
  error?: string
  responseMessages?: string
}

export interface FolderChildren {
  id: string
  name: string
}

export interface FolderErrorResponse {
  error?: string
  resource?: ErrorFolderParameters
  responseMessages?: string
}

export interface FolderModel {
  Children?: FolderChildren
  child_count: number
  created_at: string
  id: string
  name: string
  title: string
  type: string
}

export interface GetAllTagsResponse {
  resource: GetAllTagsResponseResource
}

export interface GetAllTagsResponseResource {
  tags: string
}

export interface GetDashboardDetailResponse {
  resource: boolean
  title: string
}

export interface GetFolderResponse {
  items?: number
  pages?: number
  resource?: FolderModel[]
  responseMessages?: string
}

export interface GetFoldersResponse {
  items: number
  pages: number
  resource?: FolderModel[]
  responseMessages?: string
}

export interface GetOotbFolderIdResponse {
  resource?: string
}

export interface PatchFolderRequestBody {
  folderId: string
  name: string
}

export interface PatchFolderResponse {
  resource: PatchFolderResponseResource
}

export interface PatchFolderResponseResource {
  accountId: string
  folderId: string
  name: string
}

export interface SearchResponse {
  error: string
  items: number
  pages: number
  resource: DashboardModel[]
  total: number
}

export interface SignedUrlResponse {
  resource: string
}

export interface UpdateDashboardResponse {
  resource: UpdateDashboardResponseResource
}

export interface UpdateDashboardResponseResource {
  description: string
  id: number
  resourceIdentifier: string
  title: string
}

export interface UpdateDashboardQueryParams {
  accountId: string
}

export type UpdateDashboardProps = Omit<
  MutateProps<UpdateDashboardResponse, unknown, UpdateDashboardQueryParams, CreateDashboardRequest, void>,
  'path' | 'verb'
>

/**
 * Update a dashboards name, tags or folder.
 */
export const UpdateDashboard = (props: UpdateDashboardProps) => (
  <Mutate<UpdateDashboardResponse, unknown, UpdateDashboardQueryParams, CreateDashboardRequest, void>
    verb="PATCH"
    path={`/`}
    base={getConfig('dashboard/')}
    {...props}
  />
)

export type UseUpdateDashboardProps = Omit<
  UseMutateProps<UpdateDashboardResponse, unknown, UpdateDashboardQueryParams, CreateDashboardRequest, void>,
  'path' | 'verb'
>

/**
 * Update a dashboards name, tags or folder.
 */
export const useUpdateDashboard = (props: UseUpdateDashboardProps) =>
  useMutate<UpdateDashboardResponse, unknown, UpdateDashboardQueryParams, CreateDashboardRequest, void>('PATCH', `/`, {
    base: getConfig('dashboard/'),
    ...props
  })

/**
 * Update a dashboards name, tags or folder.
 */
export const updateDashboardPromise = (
  props: MutateUsingFetchProps<
    UpdateDashboardResponse,
    unknown,
    UpdateDashboardQueryParams,
    CreateDashboardRequest,
    void
  >,
  signal?: RequestInit['signal']
) =>
  mutateUsingFetch<UpdateDashboardResponse, unknown, UpdateDashboardQueryParams, CreateDashboardRequest, void>(
    'PATCH',
    getConfig('dashboard/'),
    `/`,
    props,
    signal
  )

export interface CloneDashboardQueryParams {
  accountId: string
}

export type CloneDashboardProps = Omit<
  MutateProps<ClonedDashboardResponse, ErrorResponse, CloneDashboardQueryParams, CloneDashboardRequestBody, void>,
  'path' | 'verb'
>

/**
 * Clone a dashboard.
 */
export const CloneDashboard = (props: CloneDashboardProps) => (
  <Mutate<ClonedDashboardResponse, ErrorResponse, CloneDashboardQueryParams, CloneDashboardRequestBody, void>
    verb="POST"
    path={`/clone`}
    base={getConfig('dashboard/')}
    {...props}
  />
)

export type UseCloneDashboardProps = Omit<
  UseMutateProps<ClonedDashboardResponse, ErrorResponse, CloneDashboardQueryParams, CloneDashboardRequestBody, void>,
  'path' | 'verb'
>

/**
 * Clone a dashboard.
 */
export const useCloneDashboard = (props: UseCloneDashboardProps) =>
  useMutate<ClonedDashboardResponse, ErrorResponse, CloneDashboardQueryParams, CloneDashboardRequestBody, void>(
    'POST',
    `/clone`,
    { base: getConfig('dashboard/'), ...props }
  )

/**
 * Clone a dashboard.
 */
export const cloneDashboardPromise = (
  props: MutateUsingFetchProps<
    ClonedDashboardResponse,
    ErrorResponse,
    CloneDashboardQueryParams,
    CloneDashboardRequestBody,
    void
  >,
  signal?: RequestInit['signal']
) =>
  mutateUsingFetch<ClonedDashboardResponse, ErrorResponse, CloneDashboardQueryParams, CloneDashboardRequestBody, void>(
    'POST',
    getConfig('dashboard/'),
    `/clone`,
    props,
    signal
  )

export interface GeneratePublicDashboardSignedUrlQueryParams {
  accountId: string
  dashboard: string
  timezone?: string
}

export type GeneratePublicDashboardSignedUrlProps = Omit<
  GetProps<SignedUrlResponse, ErrorResponse, GeneratePublicDashboardSignedUrlQueryParams, void>,
  'path'
>

/**
 * Create a Signed URL for a dashboard.
 */
export const GeneratePublicDashboardSignedUrl = (props: GeneratePublicDashboardSignedUrlProps) => (
  <Get<SignedUrlResponse, ErrorResponse, GeneratePublicDashboardSignedUrlQueryParams, void>
    path={`/embed/public/dashboard/signed_url`}
    base={getConfig('dashboard/')}
    {...props}
  />
)

export type UseGeneratePublicDashboardSignedUrlProps = Omit<
  UseGetProps<SignedUrlResponse, ErrorResponse, GeneratePublicDashboardSignedUrlQueryParams, void>,
  'path'
>

/**
 * Create a Signed URL for a dashboard.
 */
export const useGeneratePublicDashboardSignedUrl = (props: UseGeneratePublicDashboardSignedUrlProps) =>
  useGet<SignedUrlResponse, ErrorResponse, GeneratePublicDashboardSignedUrlQueryParams, void>(
    `/embed/public/dashboard/signed_url`,
    { base: getConfig('dashboard/'), ...props }
  )

/**
 * Create a Signed URL for a dashboard.
 */
export const generatePublicDashboardSignedUrlPromise = (
  props: GetUsingFetchProps<SignedUrlResponse, ErrorResponse, GeneratePublicDashboardSignedUrlQueryParams, void>,
  signal?: RequestInit['signal']
) =>
  getUsingFetch<SignedUrlResponse, ErrorResponse, GeneratePublicDashboardSignedUrlQueryParams, void>(
    getConfig('dashboard/'),
    `/embed/public/dashboard/signed_url`,
    props,
    signal
  )

export interface GetFolderQueryParams {
  page?: number
  accountId: string
  isAdmin?: boolean
  pageSize?: number
}

export type GetFolderProps = Omit<GetProps<GetFolderResponse, ErrorResponse, GetFolderQueryParams, void>, 'path'>

/**
 * Get all sub-folders in account.
 */
export const GetFolder = (props: GetFolderProps) => (
  <Get<GetFolderResponse, ErrorResponse, GetFolderQueryParams, void>
    path={`/folder`}
    base={getConfig('dashboard/')}
    {...props}
  />
)

export type UseGetFolderProps = Omit<UseGetProps<GetFolderResponse, ErrorResponse, GetFolderQueryParams, void>, 'path'>

/**
 * Get all sub-folders in account.
 */
export const useGetFolder = (props: UseGetFolderProps) =>
  useGet<GetFolderResponse, ErrorResponse, GetFolderQueryParams, void>(`/folder`, {
    base: getConfig('dashboard/'),
    ...props
  })

/**
 * Get all sub-folders in account.
 */
export const getFolderPromise = (
  props: GetUsingFetchProps<GetFolderResponse, ErrorResponse, GetFolderQueryParams, void>,
  signal?: RequestInit['signal']
) =>
  getUsingFetch<GetFolderResponse, ErrorResponse, GetFolderQueryParams, void>(
    getConfig('dashboard/'),
    `/folder`,
    props,
    signal
  )

export interface PatchFolderQueryParams {
  accountId: string
}

export type PatchFolderProps = Omit<
  MutateProps<PatchFolderResponse, FolderErrorResponse, PatchFolderQueryParams, PatchFolderRequestBody, void>,
  'path' | 'verb'
>

/**
 * Update a folder's name.
 */
export const PatchFolder = (props: PatchFolderProps) => (
  <Mutate<PatchFolderResponse, FolderErrorResponse, PatchFolderQueryParams, PatchFolderRequestBody, void>
    verb="PATCH"
    path={`/folder`}
    base={getConfig('dashboard/')}
    {...props}
  />
)

export type UsePatchFolderProps = Omit<
  UseMutateProps<PatchFolderResponse, FolderErrorResponse, PatchFolderQueryParams, PatchFolderRequestBody, void>,
  'path' | 'verb'
>

/**
 * Update a folder's name.
 */
export const usePatchFolder = (props: UsePatchFolderProps) =>
  useMutate<PatchFolderResponse, FolderErrorResponse, PatchFolderQueryParams, PatchFolderRequestBody, void>(
    'PATCH',
    `/folder`,
    { base: getConfig('dashboard/'), ...props }
  )

/**
 * Update a folder's name.
 */
export const patchFolderPromise = (
  props: MutateUsingFetchProps<
    PatchFolderResponse,
    FolderErrorResponse,
    PatchFolderQueryParams,
    PatchFolderRequestBody,
    void
  >,
  signal?: RequestInit['signal']
) =>
  mutateUsingFetch<PatchFolderResponse, FolderErrorResponse, PatchFolderQueryParams, PatchFolderRequestBody, void>(
    'PATCH',
    getConfig('dashboard/'),
    `/folder`,
    props,
    signal
  )

export interface CreateFolderQueryParams {
  accountId: string
}

export type CreateFolderProps = Omit<
  MutateProps<CreateFolderResponse, ErrorResponse, CreateFolderQueryParams, CreateFolderRequestBody, void>,
  'path' | 'verb'
>

/**
 * Create a new folder.
 */
export const CreateFolder = (props: CreateFolderProps) => (
  <Mutate<CreateFolderResponse, ErrorResponse, CreateFolderQueryParams, CreateFolderRequestBody, void>
    verb="POST"
    path={`/folder`}
    base={getConfig('dashboard/')}
    {...props}
  />
)

export type UseCreateFolderProps = Omit<
  UseMutateProps<CreateFolderResponse, ErrorResponse, CreateFolderQueryParams, CreateFolderRequestBody, void>,
  'path' | 'verb'
>

/**
 * Create a new folder.
 */
export const useCreateFolder = (props: UseCreateFolderProps) =>
  useMutate<CreateFolderResponse, ErrorResponse, CreateFolderQueryParams, CreateFolderRequestBody, void>(
    'POST',
    `/folder`,
    { base: getConfig('dashboard/'), ...props }
  )

/**
 * Create a new folder.
 */
export const createFolderPromise = (
  props: MutateUsingFetchProps<
    CreateFolderResponse,
    ErrorResponse,
    CreateFolderQueryParams,
    CreateFolderRequestBody,
    void
  >,
  signal?: RequestInit['signal']
) =>
  mutateUsingFetch<CreateFolderResponse, ErrorResponse, CreateFolderQueryParams, CreateFolderRequestBody, void>(
    'POST',
    getConfig('dashboard/'),
    `/folder`,
    props,
    signal
  )

export interface GetOotbFolderIdQueryParams {
  accountId: string
}

export type GetOotbFolderIdProps = Omit<
  GetProps<GetOotbFolderIdResponse, ErrorResponse, GetOotbFolderIdQueryParams, void>,
  'path'
>

/**
 * Get out of the box folder ID.
 */
export const GetOotbFolderId = (props: GetOotbFolderIdProps) => (
  <Get<GetOotbFolderIdResponse, ErrorResponse, GetOotbFolderIdQueryParams, void>
    path={`/folder/ootb`}
    base={getConfig('dashboard/')}
    {...props}
  />
)

export type UseGetOotbFolderIdProps = Omit<
  UseGetProps<GetOotbFolderIdResponse, ErrorResponse, GetOotbFolderIdQueryParams, void>,
  'path'
>

/**
 * Get out of the box folder ID.
 */
export const useGetOotbFolderId = (props: UseGetOotbFolderIdProps) =>
  useGet<GetOotbFolderIdResponse, ErrorResponse, GetOotbFolderIdQueryParams, void>(`/folder/ootb`, {
    base: getConfig('dashboard/'),
    ...props
  })

/**
 * Get out of the box folder ID.
 */
export const getOotbFolderIdPromise = (
  props: GetUsingFetchProps<GetOotbFolderIdResponse, ErrorResponse, GetOotbFolderIdQueryParams, void>,
  signal?: RequestInit['signal']
) =>
  getUsingFetch<GetOotbFolderIdResponse, ErrorResponse, GetOotbFolderIdQueryParams, void>(
    getConfig('dashboard/'),
    `/folder/ootb`,
    props,
    signal
  )

export interface GetFolderDetailQueryParams {
  folderId: string
  accountId: string
}

export type GetFolderDetailProps = Omit<
  GetProps<CreateFolderResponse, ErrorResponse, GetFolderDetailQueryParams, void>,
  'path'
>

/**
 * Get a folders name.
 */
export const GetFolderDetail = (props: GetFolderDetailProps) => (
  <Get<CreateFolderResponse, ErrorResponse, GetFolderDetailQueryParams, void>
    path={`/folderDetail`}
    base={getConfig('dashboard/')}
    {...props}
  />
)

export type UseGetFolderDetailProps = Omit<
  UseGetProps<CreateFolderResponse, ErrorResponse, GetFolderDetailQueryParams, void>,
  'path'
>

/**
 * Get a folders name.
 */
export const useGetFolderDetail = (props: UseGetFolderDetailProps) =>
  useGet<CreateFolderResponse, ErrorResponse, GetFolderDetailQueryParams, void>(`/folderDetail`, {
    base: getConfig('dashboard/'),
    ...props
  })

/**
 * Get a folders name.
 */
export const getFolderDetailPromise = (
  props: GetUsingFetchProps<CreateFolderResponse, ErrorResponse, GetFolderDetailQueryParams, void>,
  signal?: RequestInit['signal']
) =>
  getUsingFetch<CreateFolderResponse, ErrorResponse, GetFolderDetailQueryParams, void>(
    getConfig('dashboard/'),
    `/folderDetail`,
    props,
    signal
  )

export interface DeleteDashboardQueryParams {
  folderId: string
  accountId: string
}

export type DeleteDashboardProps = Omit<
  MutateProps<DeleteDashboardResponse, unknown, DeleteDashboardQueryParams, DeleteDashboardRequest, void>,
  'path' | 'verb'
>

/**
 * Delete a dashboard.
 */
export const DeleteDashboard = (props: DeleteDashboardProps) => (
  <Mutate<DeleteDashboardResponse, unknown, DeleteDashboardQueryParams, DeleteDashboardRequest, void>
    verb="DELETE"
    path={`/remove`}
    base={getConfig('dashboard/')}
    {...props}
  />
)

export type UseDeleteDashboardProps = Omit<
  UseMutateProps<DeleteDashboardResponse, unknown, DeleteDashboardQueryParams, DeleteDashboardRequest, void>,
  'path' | 'verb'
>

/**
 * Delete a dashboard.
 */
export const useDeleteDashboard = (props: UseDeleteDashboardProps) =>
  useMutate<DeleteDashboardResponse, unknown, DeleteDashboardQueryParams, DeleteDashboardRequest, void>(
    'DELETE',
    `/remove`,
    { base: getConfig('dashboard/'), ...props }
  )

/**
 * Delete a dashboard.
 */
export const deleteDashboardPromise = (
  props: MutateUsingFetchProps<
    DeleteDashboardResponse,
    unknown,
    DeleteDashboardQueryParams,
    DeleteDashboardRequest,
    void
  >,
  signal?: RequestInit['signal']
) =>
  mutateUsingFetch<DeleteDashboardResponse, unknown, DeleteDashboardQueryParams, DeleteDashboardRequest, void>(
    'DELETE',
    getConfig('dashboard/'),
    `/remove`,
    props,
    signal
  )

export interface GetFoldersQueryParams {
  page: number
  pageSize: number
  searchTerm?: string
  accountId: string
  permission?: 'core_dashboards_view' | 'core_dashboards_edit'
  sortBy?: string
}

export type GetFoldersProps = Omit<GetProps<GetFoldersResponse, ErrorResponse, GetFoldersQueryParams, void>, 'path'>

/**
 * Get a list of folders filtered by search parameters.
 */
export const GetFolders = (props: GetFoldersProps) => (
  <Get<GetFoldersResponse, ErrorResponse, GetFoldersQueryParams, void>
    path={`/v1/folders`}
    base={getConfig('dashboard/')}
    {...props}
  />
)

export type UseGetFoldersProps = Omit<
  UseGetProps<GetFoldersResponse, ErrorResponse, GetFoldersQueryParams, void>,
  'path'
>

/**
 * Get a list of folders filtered by search parameters.
 */
export const useGetFolders = (props: UseGetFoldersProps) =>
  useGet<GetFoldersResponse, ErrorResponse, GetFoldersQueryParams, void>(`/v1/folders`, {
    base: getConfig('dashboard/'),
    ...props
  })

/**
 * Get a list of folders filtered by search parameters.
 */
export const getFoldersPromise = (
  props: GetUsingFetchProps<GetFoldersResponse, ErrorResponse, GetFoldersQueryParams, void>,
  signal?: RequestInit['signal']
) =>
  getUsingFetch<GetFoldersResponse, ErrorResponse, GetFoldersQueryParams, void>(
    getConfig('dashboard/'),
    `/v1/folders`,
    props,
    signal
  )

export interface SearchQueryParams {
  page: number
  folderId: string
  customTag: string
  tags: string
  pageSize: number
  searchTerm?: string
  accountId: string
  sortBy?: string
}

export type SearchProps = Omit<GetProps<SearchResponse, ErrorResponse, SearchQueryParams, void>, 'path'>

/**
 * Get list of dashboards that match the search criteria.
 */
export const Search = (props: SearchProps) => (
  <Get<SearchResponse, ErrorResponse, SearchQueryParams, void>
    path={`/v1/search`}
    base={getConfig('dashboard/')}
    {...props}
  />
)

export type UseSearchProps = Omit<UseGetProps<SearchResponse, ErrorResponse, SearchQueryParams, void>, 'path'>

/**
 * Get list of dashboards that match the search criteria.
 */
export const useSearch = (props: UseSearchProps) =>
  useGet<SearchResponse, ErrorResponse, SearchQueryParams, void>(`/v1/search`, {
    base: getConfig('dashboard/'),
    ...props
  })

/**
 * Get list of dashboards that match the search criteria.
 */
export const searchPromise = (
  props: GetUsingFetchProps<SearchResponse, ErrorResponse, SearchQueryParams, void>,
  signal?: RequestInit['signal']
) =>
  getUsingFetch<SearchResponse, ErrorResponse, SearchQueryParams, void>(
    getConfig('dashboard/'),
    `/v1/search`,
    props,
    signal
  )

export interface CreateSignedUrlQueryParams {
  src: string
  accountId: string
  dashboardId: string
  timezone?: string
}

export type CreateSignedUrlProps = Omit<
  MutateProps<SignedUrlResponse, ErrorResponse, CreateSignedUrlQueryParams, void, void>,
  'path' | 'verb'
>

/**
 * Create a Signed URL
 */
export const CreateSignedUrl = (props: CreateSignedUrlProps) => (
  <Mutate<SignedUrlResponse, ErrorResponse, CreateSignedUrlQueryParams, void, void>
    verb="POST"
    path={`/v1/signedUrl`}
    base={getConfig('dashboard/')}
    {...props}
  />
)

export type UseCreateSignedUrlProps = Omit<
  UseMutateProps<SignedUrlResponse, ErrorResponse, CreateSignedUrlQueryParams, void, void>,
  'path' | 'verb'
>

/**
 * Create a Signed URL
 */
export const useCreateSignedUrl = (props: UseCreateSignedUrlProps) =>
  useMutate<SignedUrlResponse, ErrorResponse, CreateSignedUrlQueryParams, void, void>('POST', `/v1/signedUrl`, {
    base: getConfig('dashboard/'),
    ...props
  })

/**
 * Create a Signed URL
 */
export const createSignedUrlPromise = (
  props: MutateUsingFetchProps<SignedUrlResponse, ErrorResponse, CreateSignedUrlQueryParams, void, void>,
  signal?: RequestInit['signal']
) =>
  mutateUsingFetch<SignedUrlResponse, ErrorResponse, CreateSignedUrlQueryParams, void, void>(
    'POST',
    getConfig('dashboard/'),
    `/v1/signedUrl`,
    props,
    signal
  )

export interface GetAllTagsQueryParams {
  accountId: string
}

export type GetAllTagsProps = Omit<GetProps<GetAllTagsResponse, ErrorResponse, GetAllTagsQueryParams, void>, 'path'>

/**
 * Get tags.
 */
export const GetAllTags = (props: GetAllTagsProps) => (
  <Get<GetAllTagsResponse, ErrorResponse, GetAllTagsQueryParams, void>
    path={`/v1/tags`}
    base={getConfig('dashboard/')}
    {...props}
  />
)

export type UseGetAllTagsProps = Omit<
  UseGetProps<GetAllTagsResponse, ErrorResponse, GetAllTagsQueryParams, void>,
  'path'
>

/**
 * Get tags.
 */
export const useGetAllTags = (props: UseGetAllTagsProps) =>
  useGet<GetAllTagsResponse, ErrorResponse, GetAllTagsQueryParams, void>(`/v1/tags`, {
    base: getConfig('dashboard/'),
    ...props
  })

/**
 * Get tags.
 */
export const getAllTagsPromise = (
  props: GetUsingFetchProps<GetAllTagsResponse, ErrorResponse, GetAllTagsQueryParams, void>,
  signal?: RequestInit['signal']
) =>
  getUsingFetch<GetAllTagsResponse, ErrorResponse, GetAllTagsQueryParams, void>(
    getConfig('dashboard/'),
    `/v1/tags`,
    props,
    signal
  )

export interface CreateDashboardQueryParams {
  accountId: string
}

export type CreateDashboardProps = Omit<
  MutateProps<CreateDashboardResponse, unknown, CreateDashboardQueryParams, CreateDashboardRequest, void>,
  'path' | 'verb'
>

/**
 * Creates a new looker dashboard which will be empty.
 */
export const CreateDashboard = (props: CreateDashboardProps) => (
  <Mutate<CreateDashboardResponse, unknown, CreateDashboardQueryParams, CreateDashboardRequest, void>
    verb="POST"
    path={`/v2/create`}
    base={getConfig('dashboard/')}
    {...props}
  />
)

export type UseCreateDashboardProps = Omit<
  UseMutateProps<CreateDashboardResponse, unknown, CreateDashboardQueryParams, CreateDashboardRequest, void>,
  'path' | 'verb'
>

/**
 * Creates a new looker dashboard which will be empty.
 */
export const useCreateDashboard = (props: UseCreateDashboardProps) =>
  useMutate<CreateDashboardResponse, unknown, CreateDashboardQueryParams, CreateDashboardRequest, void>(
    'POST',
    `/v2/create`,
    { base: getConfig('dashboard/'), ...props }
  )

/**
 * Creates a new looker dashboard which will be empty.
 */
export const createDashboardPromise = (
  props: MutateUsingFetchProps<
    CreateDashboardResponse,
    unknown,
    CreateDashboardQueryParams,
    CreateDashboardRequest,
    void
  >,
  signal?: RequestInit['signal']
) =>
  mutateUsingFetch<CreateDashboardResponse, unknown, CreateDashboardQueryParams, CreateDashboardRequest, void>(
    'POST',
    getConfig('dashboard/'),
    `/v2/create`,
    props,
    signal
  )

export interface GetDashboardDetailQueryParams {
  accountId: string
}

export interface GetDashboardDetailPathParams {
  dashboard_id: string
}

export type GetDashboardDetailProps = Omit<
  GetProps<GetDashboardDetailResponse, ErrorResponse, GetDashboardDetailQueryParams, GetDashboardDetailPathParams>,
  'path'
> &
  GetDashboardDetailPathParams

/**
 * Get the title of a Dashboard.
 */
export const GetDashboardDetail = ({ dashboard_id, ...props }: GetDashboardDetailProps) => (
  <Get<GetDashboardDetailResponse, ErrorResponse, GetDashboardDetailQueryParams, GetDashboardDetailPathParams>
    path={`/${dashboard_id}/detail`}
    base={getConfig('dashboard/')}
    {...props}
  />
)

export type UseGetDashboardDetailProps = Omit<
  UseGetProps<GetDashboardDetailResponse, ErrorResponse, GetDashboardDetailQueryParams, GetDashboardDetailPathParams>,
  'path'
> &
  GetDashboardDetailPathParams

/**
 * Get the title of a Dashboard.
 */
export const useGetDashboardDetail = ({ dashboard_id, ...props }: UseGetDashboardDetailProps) =>
  useGet<GetDashboardDetailResponse, ErrorResponse, GetDashboardDetailQueryParams, GetDashboardDetailPathParams>(
    (paramsInPath: GetDashboardDetailPathParams) => `/${paramsInPath.dashboard_id}/detail`,
    { base: getConfig('dashboard/'), pathParams: { dashboard_id }, ...props }
  )

/**
 * Get the title of a Dashboard.
 */
export const getDashboardDetailPromise = (
  {
    dashboard_id,
    ...props
  }: GetUsingFetchProps<
    GetDashboardDetailResponse,
    ErrorResponse,
    GetDashboardDetailQueryParams,
    GetDashboardDetailPathParams
  > & { dashboard_id: string },
  signal?: RequestInit['signal']
) =>
  getUsingFetch<GetDashboardDetailResponse, ErrorResponse, GetDashboardDetailQueryParams, GetDashboardDetailPathParams>(
    getConfig('dashboard/'),
    `/${dashboard_id}/detail`,
    props,
    signal
  )
