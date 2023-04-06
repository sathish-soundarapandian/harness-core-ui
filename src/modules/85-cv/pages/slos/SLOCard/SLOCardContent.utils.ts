/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { UseStringsReturn } from 'framework/strings'

export const getDefaultOffSet = ({
  getString,
  notificationTime,
  currentPeriodEndTime,
  currentPeriodStartTime,
  percentageDiff,
  showError,
  location,
  history
}: {
  getString: UseStringsReturn['getString']
  notificationTime: number
  currentPeriodEndTime: number
  currentPeriodStartTime: number
  percentageDiff: number
  showError: (message: React.ReactNode, timeout?: number, key?: string) => void
  location: any
  history: any
}): number => {
  if (notificationTime < currentPeriodEndTime && notificationTime > currentPeriodStartTime) {
    const diffStartAndEndtime = currentPeriodEndTime - currentPeriodStartTime
    const diffNotificationTime = Number(notificationTime) - currentPeriodStartTime
    const diffValue = diffNotificationTime / diffStartAndEndtime
    if (isFinite(diffValue)) {
      percentageDiff = diffValue
    }
  } else {
    showError(getString('cv.notificationTimestampError'))
    const queryParams = new URLSearchParams(location.search)
    if (queryParams.has('notificationTime')) {
      queryParams.delete('notificationTime')
      history.replace({
        search: queryParams.toString()
      })
    }
  }
  return percentageDiff
}

export const getLeftContainerOffset = (isSLOView: boolean, isCardView?: boolean) => {
  let leftContainerOffset = 85
  if (isCardView && !isSLOView) {
    leftContainerOffset = 120
  } else if (isCardView && isSLOView) {
    leftContainerOffset = 115
  }
  return leftContainerOffset
}
