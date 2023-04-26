/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { Environments } from '../Environments'

jest.mock('services/cd-ng', () => {
  return {
    useEnvironmentStore: jest.fn(),
    useGetEnvironmentList: jest.fn(() => ({ refetch: jest.fn() })),
    useDeleteEnvironmentV2: jest.fn(() => ({ mutate: jest.fn() })),
    useGetSettingValue: jest.fn().mockResolvedValue({})
  }
})

describe('Environments', () => {
  test('should render Environments', () => {
    const { container } = render(
      <TestWrapper
        path="account/:accountId/cd/orgs/:orgIdentifier/projects/:projectIdentifier"
        pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
      >
        <Environments />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
