import type { QueryKey, UseQueryOptions } from '@tanstack/react-query'
import { useRequestContext } from '../sto/context'
import type { RequestContext } from '../sto/context'
import type { QueryOperation } from './ticketServiceComponents'

export type TicketServiceContext = RequestContext<QueryOperation>

/**
 * Context injected into every react-query hook wrappers
 *
 * @param queryOptions options from the useQuery wrapper
 */
export function useTicketServiceContext<
  TQueryFnData = unknown,
  TError = unknown,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey
>(
  queryOptions?: Omit<UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>, 'queryKey' | 'queryFn'>
): TicketServiceContext {
  return useRequestContext<TQueryFnData, TError, TData, TQueryKey, QueryOperation>(queryOptions)
}
