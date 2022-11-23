/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Icon } from '@harness/uicore'
import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import ErrorTooltip from '../ErrorTooltip'

const errorMessage = 'Something went wrong!'
const onRetry = jest.fn()

describe('ErrorTooltip', () => {
  test('Render default ErrorTooltip', async () => {
    const { container, getByText, queryByText } = render(
      <TestWrapper>
        <ErrorTooltip>
          <Icon name="more" />
        </ErrorTooltip>
      </TestWrapper>
    )

    userEvent.click(container.querySelector('[data-icon="more"]')!)

    expect(getByText('common.friendlyMessage: somethingWentWrong')).toBeInTheDocument()

    userEvent.click(queryByText('retry')!)

    expect(onRetry).toBeCalledTimes(0)
  })

  test('Render ErrorTooltip with custom message and onRetry', async () => {
    const { container, queryByText } = render(
      <TestWrapper>
        <ErrorTooltip message={errorMessage} onRetry={onRetry}>
          <Icon name="more" />
        </ErrorTooltip>
      </TestWrapper>
    )

    userEvent.click(container.querySelector('[data-icon="more"]')!)

    expect(queryByText(`common.friendlyMessage: ${errorMessage}`)).toBeInTheDocument()

    userEvent.click(queryByText('retry')!)

    expect(onRetry).toBeCalledTimes(1)
  })
})
