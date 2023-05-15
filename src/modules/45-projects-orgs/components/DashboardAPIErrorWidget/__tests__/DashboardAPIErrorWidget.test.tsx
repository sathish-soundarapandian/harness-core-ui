/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import DashboardAPIErrorWidget from '../DashboardAPIErrorWidget'

const retryCallback = jest.fn()

describe('DashboardAPIErrorWidget', () => {
  test('DashboardAPIErrorWidget rendering', async () => {
    const { container, queryByText } = render(
      <TestWrapper>
        <DashboardAPIErrorWidget callback={retryCallback} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()

    expect(queryByText('projectsOrgs.apiError')).toBeInTheDocument()
    expect(queryByText('retry')).toBeInTheDocument()

    await userEvent.click(queryByText('retry')!)
    expect(retryCallback).toBeCalledTimes(1)
  })
})
