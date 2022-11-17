/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, queryByText, render } from '@testing-library/react'
import {} from '@harness/uicore'
import { Color } from '@harness/design-system'
import { TestWrapper } from '@common/utils/testUtils'
import Step from '../Step/Step'

const params = {
  accountId: 'TEST_ACC',
  perspectiveName: 'sample perspective',
  perspetiveId: 'perspectiveId'
}

describe('test cases for Step Component', () => {
  test('should be able to render the component', async () => {
    const { container } = render(
      <TestWrapper pathParams={params}>
        <Step
          stepProps={{
            color: Color.PURPLE_900,
            background: Color.PURPLE_100,
            total: 3,
            current: 2,
            defaultOpen: false
          }}
          title="Sample Step"
        >
          <div />
        </Step>
      </TestWrapper>
    )

    expect(queryByText(container, 'Sample Step')).toBeInTheDocument()
  })

  test('should be able to render the component and click on create new button', async () => {
    const actionClick = jest.fn()
    const { container } = render(
      <TestWrapper pathParams={params}>
        <Step
          stepProps={{
            color: Color.PURPLE_900,
            background: Color.PURPLE_100,
            total: 3,
            current: 2,
            defaultOpen: false
          }}
          title="Sample Step"
          actionButtonProps={{
            showActionButton: true,
            actionButtonText: 'New',
            actionOnClick: actionClick
          }}
        >
          <div />
        </Step>
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
    expect(queryByText(container, 'Sample Step')).toBeInTheDocument()
    const actionButton = queryByText(container, 'New')
    fireEvent.click(actionButton!)
    expect(actionClick).toHaveBeenCalledTimes(1)
  })

  test('should be able to render the component and click on create new button', async () => {
    const actionClick = jest.fn()
    const { container } = render(
      <TestWrapper pathParams={params}>
        <Step
          stepProps={{
            color: Color.PURPLE_900,
            background: Color.PURPLE_100,
            total: 3,
            current: 2,
            defaultOpen: false
          }}
          title="Sample Step"
          actionButtonProps={{
            showActionButton: true,
            actionButtonText: 'New',
            actionOnClick: actionClick
          }}
        >
          <div />
        </Step>
      </TestWrapper>
    )

    expect(queryByText(container, 'Sample Step')).toBeInTheDocument()
    const actionButton = queryByText(container, 'chevron-down')
    fireEvent.click(actionButton!)
    expect(container.querySelector("[aria-hidden='false']")).not.toBeNull()
  })
})
