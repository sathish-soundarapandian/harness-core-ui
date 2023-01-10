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
import mockImport from 'framework/utils/mockImport'
import StackProvisionerDetailsStep from '../StackProvisionerDetailsStep'
import { mockProvisionerConnectorResponse } from './mocks'

const actions = { onSubmit: jest.fn(), nextStep: jest.fn() }
const mockData = {
  autoApprove: true,
  connector: 'aws_test',
  description: '',
  identifier: 'test_stack',
  name: 'test stack',
  provisionerType: 'terraform',
  provisionerVersion: '2.0.0',
  ttl: '1669208915047',
  workspace: 'test workspace'
}

const renderComponent = (): RenderResult => {
  mockImport('services/cd-ng', {
    useGetConnector: () => ({
      data: mockProvisionerConnectorResponse,
      loading: false,
      refetch: jest.fn(),
      error: null
    })
  })

  return render(
    <TestWrapper
      path="/account/:accountId/iacm/orgs/:orgIdentifier/projects/:projectIdentifier/stacks"
      pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
    >
      <StackProvisionerDetailsStep
        name="Provisioner Details"
        identifier="provisioner_details"
        nextStep={actions.nextStep}
        prevStepData={mockData}
      />
    </TestWrapper>
  )
}

describe('StackProvisionerDetailsStep', () => {
  beforeEach(() => jest.resetAllMocks())

  test('it should render correctly', async () => {
    renderComponent()

    expect(screen.getByText('Provisioner Details')).toBeInTheDocument()
  })

  test('it should submit provisioner details correctly', async () => {
    renderComponent()
    userEvent.click(screen.getByRole('button', { name: 'continue' }))
    await waitFor(() => expect(actions.nextStep).toHaveBeenCalledWith(mockData))
  })
})
