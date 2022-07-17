/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { Reducer } from 'react'
import { useParams } from 'react-router-dom'
import { defaultTo } from 'lodash-es'
import { EventSourcePolyfill } from 'event-source-polyfill'

import type { ExecutionPathProps } from '@common/interfaces/RouteInterfaces'
import { PQueue } from '@common/utils/PQueue'
import { useGetToken, logBlobPromise } from 'services/logs'
import SessionToken from 'framework/utils/SessionToken'
import { useExecutionContext } from '@pipeline/context/ExecutionContext'
import { useDeepCompareEffect } from '@common/hooks'

import type { ActionType, State, Action } from './LogsState/types'
import { reducer } from './LogsState'
import { useActionCreator, UseActionCreatorReturn } from './LogsState/actions'
import { getDefaultReducerState, logsCache } from './LogsState/utils'

type LogsReducer = Reducer<State, Action<ActionType>>

export interface UseLogsContentReturn {
  state: State
  actions: UseActionCreatorReturn
}

export interface StartStreamProps {
  queryParams: {
    key: string
    accountId: string
  }
  headers: Record<string, string>
  key: string
  throttleTime?: number
}

const STREAM_ENDPOINT = `${window.apiUrl || ''}/log-service/stream`

export function useLogsContent(): UseLogsContentReturn {
  const requestQueue = React.useRef(new PQueue())
  const { accountId } = useParams<ExecutionPathProps>()
  const [state, dispatch] = React.useReducer<LogsReducer>(reducer, getDefaultReducerState())
  const actions = useActionCreator(dispatch)
  const { logsToken, setLogsToken } = useExecutionContext()
  const { data: tokenData } = useGetToken({ queryParams: { accountID: accountId }, lazy: !!logsToken })
  const eventSource = React.useRef<null | EventSource>(null)

  const closeStream = React.useCallback(() => {
    eventSource.current?.close()
    eventSource.current = null
  }, [])

  const startStream = React.useCallback(
    (props: StartStreamProps): void => {
      closeStream()
      actions.updateSectionData({ data: '', id: props.key })

      const currentEventSource: EventSource = new EventSourcePolyfill(
        `${STREAM_ENDPOINT}?accountID=${props.queryParams.accountId}&key=${props.queryParams.key}`,
        { headers: props.headers }
      )

      eventSource.current = currentEventSource

      currentEventSource.onmessage = (e: MessageEvent) => {
        if (e.type === 'error') {
          currentEventSource.close()
        }

        /* istanbul ignore else */
        if (e.data) {
          actions.updateSectionData({ data: e.data, id: props.key, append: true })
        }
      }

      currentEventSource.onerror = (e: Event) => {
        /* istanbul ignore else */
        if (e.type === 'error') {
          closeStream()
        }
      }
    },
    [closeStream, actions]
  )

  // need to save token in a ref due to scoping issues
  const logsTokenRef = React.useRef('')
  const timerRef = React.useRef<null | number>(null)

  function getBlobData(id: string): void {
    requestQueue.current.add(async (signal: AbortSignal) => {
      if (logsCache.has(id)) {
        actions.updateSectionData({ data: defaultTo(logsCache.get(id), ''), id })
        return
      }

      // if token is not found, schedule the call for later
      if (!logsTokenRef.current) {
        timerRef.current = window.setTimeout(() => getBlobData(id), 300)
        return
      }

      actions.fetchingSectionData(id)

      try {
        const data = (await logBlobPromise(
          {
            queryParams: {
              accountID: accountId,
              'X-Harness-Token': '',
              key: id
            },
            requestOptions: {
              headers: {
                'X-Harness-Token': logsTokenRef.current
              }
            }
          },
          signal
        )) as unknown

        if (typeof data === 'string') {
          logsCache.set(id, data)
          actions.updateSectionData({ id, data })
        } else {
          actions.resetSection(id)
        }
      } catch (e) {
        actions.resetSection(id)
      }
    })
  }

  function getStream(logKey: string): void {
    // if token is not found, schedule the call for later
    if (!logsTokenRef.current) {
      timerRef.current = window.setTimeout(() => getStream(logKey), 300)
      return
    }
    actions.fetchingSectionData(logKey)
    startStream({
      queryParams: {
        accountId,
        key: encodeURIComponent(logKey)
      },
      headers: {
        'X-Harness-Token': logsTokenRef.current,
        Authorization: SessionToken.getToken()
      },
      key: logKey
    })
  }

  React.useEffect(() => {
    // use the existing token if present
    if (logsToken) {
      logsTokenRef.current = logsToken
    }

    // if `logsToken` is not present, `tokenData` is fetched
    // as we set the lazy flag based on it's presence
    /* istanbul ignore else */
    if (tokenData) {
      setLogsToken(tokenData)
      logsTokenRef.current = tokenData
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokenData, logsToken])

  // This fetches data for sections
  useDeepCompareEffect(() => {
    state.logKeys.forEach(logKey => {
      const section = state.dataMap[logKey]
      /* istanbul ignore else */
      if (section && section.status === 'LOADING') {
        /* istanbul ignore else */
        if (section.dataSource === 'blob') {
          getBlobData(logKey)
        } else if (section.dataSource === 'stream') {
          getStream(logKey)
        }
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.selectedStep, state.dataMap])

  // on unmount
  React.useEffect(() => {
    const queue = requestQueue.current

    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current)
      }
      queue.cancel()
      closeStream()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { state, actions }
}
