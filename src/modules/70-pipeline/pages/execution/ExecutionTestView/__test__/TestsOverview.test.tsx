/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestsOverview } from '../TestsOverview'

jest.mock('framework/strings', () => ({
  ...(jest.requireActual('framework/strings') as any),
  useStrings: jest.fn().mockReturnValue({
    getString: jest.fn().mockImplementation(val => val)
  })
}))

describe('Test TestsOverview component', () => {
  test('Initial render is ok', () => {
    const props = {
      totalTests: 33,
      skippedTests: 30,
      timeSavedMS: 372,
      durationMS: 37934,
      testsCountDiff: 2
    }
    const { container, getByText } = render(<TestsOverview {...props} />)

    expect(getByText('pipeline.testsReports.totalTests')).toBeInTheDocument()
    const elTotalTests = container.querySelector('[class*="statsNumber"]')
    expect(elTotalTests).toBeInTheDocument()
    expect(elTotalTests?.innerHTML.includes(props.totalTests.toString())).toBeTruthy()

    const elTestCountDiff = container.querySelector('[class*="diff"]')
    expect(elTestCountDiff).toBeInTheDocument()
    expect(elTestCountDiff?.innerHTML.includes(props.testsCountDiff.toString())).toBeTruthy()

    const selectedTests = props.totalTests - props.skippedTests
    if (selectedTests > 0) {
      const el = getByText('pipeline.testsReports.numberOfSelectedTests')
      expect(el).toBeInTheDocument()
      // span next to above label holds selectedTests count
      expect((el.nextSibling as Element).innerHTML.includes(selectedTests.toString())).toBeTruthy()
    }

    expect(getByText('pipeline.duration')).toBeInTheDocument()
    const spanTimeSaved = container.querySelector('[class*="timeSaved"]')
    expect(spanTimeSaved).toBeInTheDocument()
    expect(spanTimeSaved?.innerHTML.includes('372ms')).toBeTruthy()
  })
})
