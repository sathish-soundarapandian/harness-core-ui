/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act } from 'react-dom/test-utils'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { ObjectiveStatementBlock } from '../ObjectiveStatementBlock'

describe('test ObjectiveStatementBlock', () => {
  test('render ObjectiveStatementBlock in ratio based', () => {
    const { container, getByText } = render(
      <TestWrapper>
        <ObjectiveStatementBlock isRatioBasedMetric />
      </TestWrapper>
    )
    expect(getByText('cv.percentageValidrequests')).toBeInTheDocument()
    expect(container.querySelector('[name=objectiveValue]')).toBeDisabled()
  })

  test('render ObjectiveStatementBlock in ratio based not disabled comparator', async () => {
    const setFieldValue = jest.fn()
    const { container, getByText } = render(
      <TestWrapper>
        <ObjectiveStatementBlock
          isRatioBasedMetric
          goodRequestMetric="metric1"
          validRequestMetric="metric2"
          formikProps={{ setFieldValue } as any}
        />
      </TestWrapper>
    )
    expect(getByText('cv.percentageValidrequests')).toBeInTheDocument()
    const durationDropdown = container.querySelector('[data-icon="chevron-down"]') as HTMLInputElement
    await act(() => {
      fireEvent.click(durationDropdown)
    })
    await waitFor(() => {
      expect(document.querySelectorAll('ul.bp3-menu li').length).toEqual(4)
    })
    fireEvent.click(document.querySelectorAll('ul.bp3-menu li')[0]!)
  })
  test('render ObjectiveStatementBlock in threshold based', () => {
    const { container, getByText } = render(
      <TestWrapper>
        <ObjectiveStatementBlock isRatioBasedMetric={false} />
      </TestWrapper>
    )
    expect(getByText('cv.ThresholdValidrequests')).toBeInTheDocument()
    expect(container.querySelector('[name=objectiveValue]')).toBeDisabled()
  })

  test('render ObjectiveStatementBlock in threshold based not disabled comparator', () => {
    const { getByText } = render(
      <TestWrapper>
        <ObjectiveStatementBlock isRatioBasedMetric={false} validRequestMetric="metric1" />
      </TestWrapper>
    )
    expect(getByText('cv.ThresholdValidrequests')).toBeInTheDocument()
  })
})
