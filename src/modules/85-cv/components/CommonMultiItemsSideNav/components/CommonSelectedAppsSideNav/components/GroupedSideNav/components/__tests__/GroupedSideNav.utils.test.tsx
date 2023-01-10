/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { showWarningIcon } from '../../GroupedSideNav.utils'

describe('Unit tests for MetricMenu', () => {
  test('should show showWarningIcon only when form is touched and form is not valid', () => {
    const data = {
      touched: {
        query: true
      },
      isValid: false,
      selectedApp: {
        metricName: 'metric-1'
      },
      selectedItem: 'metric-1'
    }
    expect(showWarningIcon(data)).toEqual(true)
  })

  test('should show the showWarningIcon when form is touched and if the form is not valid', () => {
    const data = {
      touched: { query: true },
      isValid: false,
      selectedApp: {
        metricName: 'metric-1'
      },
      selectedItem: 'metric-1'
    }
    expect(showWarningIcon(data)).toEqual(true)
  })

  test('should not show showWarningIcon when form is not touched and the form is valid', () => {
    const data = {
      touched: {},
      isValid: true,
      selectedApp: {
        metricName: 'metric-1'
      },
      selectedItem: 'metric-1'
    }
    expect(showWarningIcon(data)).toEqual(false)
  })

  test('should not show showWarningIcon when selectedApp is not the current metric', () => {
    const data = {
      touched: {
        query: true
      },
      isValid: true,
      selectedApp: {
        metricName: 'metric-1'
      },
      selectedItem: 'metric-2'
    }
    expect(showWarningIcon(data)).toEqual(false)
  })

  test('should not show showWarningIcon when no metric is selected ', () => {
    const data = {
      touched: {
        query: true
      },
      isValid: true,
      selectedApp: {},
      selectedItem: 'metric-2'
    }
    expect(showWarningIcon(data)).toEqual(false)
  })
})
