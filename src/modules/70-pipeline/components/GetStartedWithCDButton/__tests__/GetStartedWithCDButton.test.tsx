/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, RenderResult, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import GetStartedWithCDButton, { GetStartedWithCDButtonProps } from '../GetStartedWithCDButton'

const renderComponent = (props: GetStartedWithCDButtonProps = {}): RenderResult => {
  return render(
    <TestWrapper
      path="/account/:accountId/cd/orgs/:orgIdentifier/projects/:projectIdentifier/pipelines"
      pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
    >
      <GetStartedWithCDButton {...props} />
    </TestWrapper>
  )
}

describe('GetStartedWithCDButton', () => {
  test('render component and should redirect the user to the CD Onboarding wizard on interaction', async () => {
    renderComponent()

    const getStartedBtn = screen.getByText('pipeline.guidedCDK8sGetStarted')
    expect(getStartedBtn).toBeVisible()
    userEvent.click(getStartedBtn)
    await waitFor(() => {
      expect(screen.getByTestId('location')).toHaveTextContent(
        '/account/dummy/cd/orgs/dummy/projects/dummy/cd-onboarding'
      )
    })
  })

  test('it should not display the OR section if hideOrSection is true', async () => {
    const { container } = await renderComponent({ hideOrSection: true })

    expect(screen.getByText('pipeline.guidedCDK8sGetStarted')).toBeVisible()
    expect(container.querySelector('[data-testid="or-image"]')).toBeNull()
  })
})
