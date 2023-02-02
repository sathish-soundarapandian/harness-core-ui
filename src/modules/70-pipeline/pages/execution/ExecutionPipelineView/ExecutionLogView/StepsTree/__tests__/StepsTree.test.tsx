/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'

import { StepsTree } from '../StepsTree'

import data from './data.json'
import retryData from './retryData.json'
describe('<StepsTree /> tests', () => {
  test('snapshot test', () => {
    const { container } = render(
      <StepsTree
        openExecutionTimeInputsForStep={jest.fn()}
        nodes={data as any}
        onStepSelect={jest.fn()}
        allNodeMap={{}}
        isRoot
      />
    )
    expect(container).toMatchSnapshot()
  })

  test('step selection works', async () => {
    const onStepSelect = jest.fn()
    const { findByText } = render(
      <StepsTree
        openExecutionTimeInputsForStep={jest.fn()}
        nodes={data as any}
        onStepSelect={onStepSelect}
        allNodeMap={{}}
        isRoot
      />
    )

    const step = await findByText('Step 1')

    fireEvent.click(step)

    expect(onStepSelect).toHaveBeenCalledWith('step_1', undefined)
  })

  test('step selection does not work not started steps', async () => {
    const onStepSelect = jest.fn()
    const { findByText } = render(
      <StepsTree
        openExecutionTimeInputsForStep={jest.fn()}
        nodes={data as any}
        onStepSelect={onStepSelect}
        allNodeMap={{}}
        isRoot
      />
    )

    const step = await findByText('step_4_1_2')

    fireEvent.click(step)

    expect(onStepSelect).toHaveBeenCalledTimes(0)
  })

  test('works for retry steps', async () => {
    const onStepSelect = jest.fn()
    const { container, findAllByText } = render(
      <TestWrapper>
        <StepsTree onStepSelect={onStepSelect} {...(retryData as any)} isRoot />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()

    const step = await findAllByText('pipeline.execution.retryStepCount')
    fireEvent.click(step[0])

    expect(onStepSelect).toHaveBeenCalledWith('step_1', 'retrystep_1')
  })
})
