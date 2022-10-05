/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import moment from 'moment'
import { useMemo, useState } from 'react'
import { useInterval } from '@common/hooks/useInterval'

const ONE_MINUTE = 60_000

// runs a continuous timer check to calculate if the current time falls in between the given range
export const useCurrentActiveTime = (start?: number, end?: number, isEnabled?: boolean): boolean => {
  const now = moment()
  const [startTime, endTime] = useMemo(() => {
    return [moment(start), moment(end)]
  }, [start, end])

  const timer = isEnabled && start && end ? ONE_MINUTE : null // null lets the timer not to run
  const [isActive, setIsActive] = useState<boolean>(!!(timer && now.isBetween(startTime, endTime)))
  useInterval(() => {
    setIsActive(now.isBetween(startTime, endTime))
  }, timer)

  return isActive
}
