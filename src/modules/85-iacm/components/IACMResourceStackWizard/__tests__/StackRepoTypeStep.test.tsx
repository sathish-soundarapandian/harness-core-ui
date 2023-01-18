/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, RenderResult, waitFor, screen, ByRoleOptions } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import mockImport from 'framework/utils/mockImport'
import { mockRepoConnectorResponse } from './mocks'
import StackRepoTypeStep from '../StackRepoTypeStep'

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
  repoConnectorType: 'Git',
  repoConnector: 'test',
  repoConnectorObject: {
    connector: {
      description: null,
      identifier: 'test',
      name: 'test',
      orgIdentifier: 'harness',
      projectIdentifier: 'iacm',
      spec: {
        branchName: null,
        connectionType: 'Account',
        delegateSelectors: [],
        executeOnDelegate: true,
        spec: {
          passwordRef: 'secret',
          username: 'test',
          usernameRef: null
        },
        type: 'Http',
        url: 'http://null',
        validationRepo: 'test'
      },
      tags: {},
      type: 'Git'
    },
    label: 'test',
    live: false,
    scope: 'project',
    value: 'test'
  }
}

const renderComponent = (): RenderResult => {
  mockImport('services/cd-ng', {
    useGetConnector: () => ({
      data: mockRepoConnectorResponse,
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
      <StackRepoTypeStep name="Repository" identifier="repo_type" nextStep={actions.nextStep} prevStepData={mockData} />
    </TestWrapper>
  )
}

describe('StackRepoTypeStep', () => {
  test('it should render correctly', async () => {
    renderComponent()

    expect(screen.getByText('Repository')).toBeInTheDocument()
  })

  test('it should submit repo details correctly', async () => {
    renderComponent()

    expect(screen.getByRole('button', { name: 'continue' })).toBeInTheDocument()
    userEvent.click(screen.getByRole('button', { name: 'continue' }))

    await waitFor(() => expect(actions.nextStep).toHaveBeenCalledWith(mockData))
  })

  test('it should set repo type correctly when selected', async () => {
    renderComponent()
    const repoType = screen.getByRole('checkbox', { value: 'Git' } as ByRoleOptions)

    userEvent.click(repoType)
    expect(screen.getAllByRole('checkbox')).toHaveLength(1)
  })
})
