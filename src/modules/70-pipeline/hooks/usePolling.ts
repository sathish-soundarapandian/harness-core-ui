/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { useEffect, useState } from 'react'
import useTabVisible from '@common/hooks/useTabVisible'

const POLLING_INTERVAL_IN_MS = 5_000

export function usePolling(
  fn: (props?: any) => Promise<void> | undefined,
  page: number | undefined,
  isLoading: boolean
) {
  const [isPolling, setIsPolling] = useState(false)
  const visible = useTabVisible()

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      if (page === 1 && !isLoading && visible) {
        setIsPolling(true)
        fn()?.then(
          () => setIsPolling(false),
          () => setIsPolling(false)
        )
      }
    }, POLLING_INTERVAL_IN_MS)

    return () => {
      window.clearTimeout(timeoutId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, isLoading, visible])

  return isPolling
}
