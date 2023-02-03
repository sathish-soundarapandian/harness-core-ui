import { apiFetch, getBaseUrl } from './fetcher'
import type { StoContext } from './stoContext'

const baseUrl = process.env.STO_API_URL || getBaseUrl('sto')

export type StoFetcherOptions<TBody, THeaders, TQueryParams, TPathParams> = {
  url: string
  method: string
  body?: TBody
  headers?: THeaders
  queryParams?: TQueryParams
  pathParams?: TPathParams
} & StoContext['fetcherOptions']

export async function stoFetch<
  TData,
  TError,
  TBody extends {} | undefined | null,
  THeaders extends {},
  TQueryParams extends {},
  TPathParams extends {}
>(options: StoFetcherOptions<TBody, THeaders, TQueryParams, TPathParams>): Promise<TData> {
  return apiFetch<TData, TError, TBody, THeaders, TQueryParams, TPathParams>({ ...options, baseUrl })
}
