/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { getDefaultOffSet } from '../SLOCardContent.utils'

describe('getDefaultOffSet', () => {
  test('should return DefaultOffSet if notificationTime is between currentPeriodStartTime and currentPeriodEndTime', () => {
    const showError = jest.fn()
    const currentPeriodStartTime = 1490811600000
    const notificationTime = 1490872000000
    const currentPeriodEndTime = 1490958400000
    const percentageDiff = 0
    expect(
      getDefaultOffSet({
        getString: string => string,
        notificationTime,
        currentPeriodEndTime,
        currentPeriodStartTime,
        percentageDiff,
        showError,
        location: { search: { notificationTime: 0 } },
        history: { replace: jest.fn() }
      })
    ).toBe(0.4114441416893733)

    expect(
      getDefaultOffSet({
        getString: string => string,
        notificationTime: 0,
        currentPeriodEndTime,
        currentPeriodStartTime,
        percentageDiff,
        showError,
        location: { search: { notificationTime: 0 } },
        history: { replace: jest.fn() }
      })
    ).toBe(0)

    expect(
      getDefaultOffSet({
        getString: string => string,
        notificationTime: 0,
        currentPeriodEndTime,
        currentPeriodStartTime,
        percentageDiff,
        showError,
        location: { search: {} },
        history: { replace: jest.fn() }
      })
    ).toBe(0)
    expect(showError).toHaveBeenCalled()
  })
})
