/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import CECOAccessPointsPage from '../CECOAccessPointsPage'

const testpath = '/account/:accountId/ce/orgs/:orgIdentifier/projects/:projectIdentifier/access-points/'
const testparams = { accountId: 'accountId', orgIdentifier: 'orgIdentifier', projectIdentifier: 'projectIdentifier' }

const mockAccessListData = {
  response: [
    {
      id: 'mockid',
      name: 'mockname',
      account_id: 'mockAccId',
      org_id: 'mockorgId',
      project_id: 'mockProjectId',
      cloud_account_id: 'mockCloudAccId',
      host_name: 'mock.com',
      region: 'ap-south-1',
      vpc: 'mockVPC',
      metadata: { error: 'mockError', security_groups: ['mockSecGrp'] },
      type: 'aws',
      status: 'errored',
      created_at: '2021-04-26T09:47:45.184178Z',
      updated_at: '2021-04-26T09:47:56.804462Z'
    }
  ]
}

const mockActivityData = {
  response: {}
}

const mockRulesData = {
  response: [{}]
}

jest.mock('services/lw', () => ({
  useAllAccessPoints: jest.fn().mockImplementation(() => ({
    data: mockAccessListData,
    loading: false,
    refetch: jest.fn(() => Promise.resolve({ data: mockAccessListData }))
  })),
  useDeleteAccessPoints: jest.fn().mockImplementation(() => ({
    mutate: jest.fn(),
    loading: false
  })),
  useAccessPointActivity: jest.fn().mockImplementation(() => ({
    data: mockActivityData,
    error: null
  })),
  useAccessPointRules: jest.fn().mockImplementation(() => ({
    data: mockRulesData,
    error: null,
    loading: false
  }))
}))

describe('Test Access Point List', () => {
  test('Renders without errors', () => {
    const { getByText } = render(
      <TestWrapper path={testpath} pathParams={testparams}>
        <CECOAccessPointsPage />
      </TestWrapper>
    )
    expect(getByText('ce.co.accessPoint.landingPageTitle')).toBeInTheDocument()
  })
})
