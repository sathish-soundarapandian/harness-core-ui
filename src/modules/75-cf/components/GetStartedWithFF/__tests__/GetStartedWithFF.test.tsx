/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, RenderResult, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import GetStartedWithFF, { GetStartedWithFFProps } from '../GetStartedWithFF'

const renderComponent = (props: GetStartedWithFFProps = {}): RenderResult =>
  render(
    <TestWrapper
      path="/account/:accountId/cf/orgs/:orgIdentifier/projects/:projectIdentifier/feature-flags"
      pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
    >
      <GetStartedWithFF hidden={false} {...props} />
    </TestWrapper>
  )

describe('GetStartedWithFF', () => {
  test('it should display the component if hidden is false', () => {
    renderComponent()

    expect(screen.getByText('cf.featureFlags.getStartedWithFF')).toBeVisible()
    expect(screen.getByTestId('or-image')).toBeVisible()
  })

  test('it should take the user to the Onboarding page once the button is clicked', async () => {
    renderComponent()

    const getStartedBtn = screen.getByText('cf.featureFlags.getStartedWithFF')
    expect(getStartedBtn).toBeVisible()

    userEvent.click(getStartedBtn)

    await waitFor(() =>
      expect(screen.getByTestId('location')).toHaveTextContent('/account/dummy/cf/orgs/dummy/projects/dummy/onboarding')
    )
  })

  test('it should not display the component if hidden is true', () => {
    renderComponent({ hidden: true })

    expect(screen.getByText('cf.featureFlags.getStartedWithFF')).not.toBeVisible()
    expect(screen.getByTestId('or-image')).not.toBeVisible()
  })
})
