/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, RenderResult, waitFor, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import StackProvisionerTypeStep from '../StackProvisionerTypeStep'

const actions = { onSubmit: jest.fn(), nextStep: jest.fn() }
const mockData = {
  description: '',
  identifier: 'test_stack',
  name: 'test stack',
  provisionerType: 'terraform'
}

const renderComponent = (): RenderResult =>
  render(
    <TestWrapper
      path="/account/:accountId/iacm/orgs/:orgIdentifier/projects/:projectIdentifier/stacks"
      pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
    >
      <StackProvisionerTypeStep
        name="Provisioner Type"
        identifier="provisioner_type"
        nextStep={actions.nextStep}
        prevStepData={mockData}
      />
    </TestWrapper>
  )

describe('StackProvisionerTypeStep', () => {
  test('it should render correctly', async () => {
    renderComponent()

    expect(screen.getByText('Provisioner Type')).toBeInTheDocument()
  })

  test('it should submit provisioner type details correctly', async () => {
    renderComponent()

    expect(screen.getAllByRole('checkbox')).toHaveLength(1)
    userEvent.click(screen.getByRole('button', { name: 'continue' }))

    userEvent.click(screen.getByRole('button', { name: 'continue' }))
    await waitFor(() => expect(actions.nextStep).toHaveBeenCalledWith(mockData))
  })
})
