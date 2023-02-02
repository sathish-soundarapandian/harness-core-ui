import { apiFetch, getBaseUrl } from '../sto/fetcher'
import type { TicketServiceContext } from './ticketServiceContext'

const baseUrl = process.env.STO_API_URL || getBaseUrl('ticket-service')

export type ErrorWrapper<TError> = TError | { status: 'unknown'; payload: string }

export type TicketServiceFetcherOptions<TBody, THeaders, TQueryParams, TPathParams> = {
  url: string
  method: string
  body?: TBody
  headers?: THeaders
  queryParams?: TQueryParams
  pathParams?: TPathParams
} & TicketServiceContext['fetcherOptions']

export async function ticketServiceFetch<
  TData,
  TError,
  TBody extends {} | undefined | null,
  THeaders extends {},
  TQueryParams extends {},
  TPathParams extends {}
>(options: TicketServiceFetcherOptions<TBody, THeaders, TQueryParams, TPathParams>): Promise<TData> {
  return apiFetch<TData, TError, TBody, THeaders, TQueryParams, TPathParams>({ ...options, baseUrl })
}
