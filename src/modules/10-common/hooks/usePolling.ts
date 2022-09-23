/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { useEffect, useRef, useState, useLayoutEffect } from 'react'
import useTabVisible from './useTabVisible'

const DEFAULT_POLLING_INTERVAL_IN_MS = 5_000
const INACTIVE_TAB_POLLING_INTERVAL_IN_MS = 10_000

interface UsePollingOptions {
  // In milliseconds, default is 5s
  pollingInterval?: number
  // Start polling based on a condition Ex: poll only on first page
  startPolling?: boolean
  // In milliseconds, default is 60s
  inactiveTabPollingInterval?: number
  // Do polling even on inactive tabs with *inactiveTabPollingInterval*. Use with caution. This needs a stop condition from userland
  pollOnInactiveTab?: boolean
}

/**
 *
 * @param callback a promise returning function that will be called in every pollingInterval, ex: refetch
 * @param options: UsePollingOptions
 *
 * remembers last call and re-poll only after its resolved
 * @returns boolean
 */
export function usePolling(
  callback: () => Promise<void> | undefined,
  {
    startPolling = false,
    pollingInterval = DEFAULT_POLLING_INTERVAL_IN_MS,
    inactiveTabPollingInterval = INACTIVE_TAB_POLLING_INTERVAL_IN_MS,
    pollOnInactiveTab = false
  }: UsePollingOptions
): boolean {
  const savedCallback = useRef(callback)
  const [isPolling, setIsPolling] = useState(false)
  const tabVisible = useTabVisible()
  const interval = tabVisible ? pollingInterval : inactiveTabPollingInterval

  // Remember the latest callback if it changes.
  useLayoutEffect(() => {
    savedCallback.current = callback
  }, [callback])

  useEffect(() => {
    // Poll only if polling condition from component is met
    if (!startPolling) return
    // Poll only if tab is visible OR pollOnInactiveTab is true
    if (!tabVisible && !pollOnInactiveTab) return

    // Poll only when the current request is resolved
    if (!isPolling) {
      const timerId = setTimeout(() => {
        setIsPolling(true)
        savedCallback.current()?.finally(() => {
          setIsPolling(false)
        })
      }, interval)

      return () => clearTimeout(timerId)
    }
  }, [interval, isPolling, pollOnInactiveTab, startPolling, tabVisible])

  return isPolling
}
