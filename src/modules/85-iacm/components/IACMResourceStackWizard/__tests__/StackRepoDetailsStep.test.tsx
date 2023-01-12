/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, RenderResult, screen } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import mockImport from 'framework/utils/mockImport'
import { mockProvisionerConnectorResponse } from './mocks'
import StackRepoDetailsStep, { GitFetchTypes } from '../StackRepoDetailsStep'

const actions = { onSubmit: jest.fn(), nextStep: jest.fn() }
const mockData = {
  autoApprove: true,
  connector: 'aws_test',
  description: '',
  identifier: 'test_stack',
  name: 'test stack',
  provisionerType: 'terraform',
  provisionerVersion: '2.0.0',
  workspace: 'test workspace',
  repo: 'test repo',
  branch: 'test branch',
  scriptsPath: 'test path',
  gitFetchType: GitFetchTypes.BRANCH
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
      <StackRepoDetailsStep
        name="Repository Details"
        identifier="repo_details"
        nextStep={actions.nextStep}
        prevStepData={mockData}
      />
    </TestWrapper>
  )
}

describe('StackRepoDetailsStep', () => {
  beforeEach(() => jest.resetAllMocks())
  test('it should render correctly', async () => {
    renderComponent()

    expect(screen.getByText('Repository Details')).toBeInTheDocument()
  })

  test('it should populate repo details correctly', async () => {
    const { container } = renderComponent()

    const repoInput = container.querySelector('input[name="repo"]')
    const branchInput = container.querySelector('input[name="branch"]')
    const scriptsPathInput = container.querySelector('input[name="scriptsPath"]')

    expect(repoInput).not.toBeInTheDocument()
    expect(branchInput).toBeInTheDocument()
    expect(scriptsPathInput).toBeInTheDocument()

    expect(screen.getByDisplayValue('test branch')).toBeVisible()
    expect(screen.getByDisplayValue('test path')).toBeVisible()
  })
})
