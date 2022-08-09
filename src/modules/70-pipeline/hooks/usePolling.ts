/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { useEffect, useRef, useState, useLayoutEffect } from 'react'

const POLLING_INTERVAL_IN_MS = 5_000

export function usePolling(callback: () => Promise<void> | undefined, startPolling: boolean): boolean {
  const savedCallback = useRef(callback)
  const [isPolling, setIsPolling] = useState(false)

  // Remember the latest callback if it changes.
  useLayoutEffect(() => {
    savedCallback.current = callback
  }, [callback])

  /**
   * At any moment of time, only one polling is done
   * Only do polling on first page
   * When component is loading, wait until loading is done
   * When polling call (API) is being processed, wait until it's done then re-schedule
   */
  useEffect(() => {
    if (!startPolling) {
      return
    }
    const timerId = setTimeout(() => {
      setIsPolling(true)
      savedCallback.current()?.finally(() => setIsPolling(false))
    }, POLLING_INTERVAL_IN_MS)

    return () => clearTimeout(timerId)
  }, [isPolling, startPolling])

  return isPolling
}
