/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import userEvent from '@testing-library/user-event'
import { render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import HealthSourceDrawerHeader from '../HealthSourceDrawerHeader'

describe('Validate HealthSourceDrawerHeader', async () => {
  //

  test('should render in cv', async () => {
    const { container, getByText } = render(
      <TestWrapper>
        <HealthSourceDrawerHeader />
      </TestWrapper>
    )
    await waitFor(() => expect(getByText('cv.healthSource.addHealthSource')).toBeInTheDocument())
    await waitFor(() => expect(getByText('cv.healthSource.backtoMonitoredService')).toBeInTheDocument())
    expect(container).toMatchSnapshot()
  })

  test('should render in cv when isEdit is true', async () => {
    const { container, getByText } = render(
      <TestWrapper>
        <HealthSourceDrawerHeader isEdit />
      </TestWrapper>
    )
    await waitFor(() => expect(getByText('cv.healthSource.editHealthSource')).toBeInTheDocument())
    await waitFor(() => expect(getByText('cv.healthSource.backtoMonitoredService')).toBeInTheDocument())
    expect(container).toMatchSnapshot()
  })

  test('should render', async () => {
    const { container, getByText } = render(
      <TestWrapper>
        <HealthSourceDrawerHeader breadCrumbRoute={{ routeTitle: 'Test title' }} />
      </TestWrapper>
    )
    await waitFor(() => expect(getByText('cv.healthSource.addHealthSource')).toBeInTheDocument())
    await waitFor(() => expect(getByText('Test title')).toBeInTheDocument())
    expect(container).toMatchSnapshot()
  })

  test('should render with shouldRenderAtVerifyStep true', async () => {
    const clickBreadCrumb = jest.fn()
    const { container, getByText } = render(
      <TestWrapper>
        <HealthSourceDrawerHeader
          onClick={clickBreadCrumb}
          shouldRenderAtVerifyStep
          breadCrumbRoute={{ routeTitle: 'Test title' }}
        />
      </TestWrapper>
    )
    await waitFor(() => expect(getByText('cv.healthSource.addHealthSource')).toBeInTheDocument())
    await waitFor(() => expect(getByText('Test title')).toBeInTheDocument())
    userEvent.click(getByText('Test title'))
    await waitFor(() => expect(clickBreadCrumb).toHaveBeenCalled())
    expect(container).toMatchSnapshot()
  })
})
