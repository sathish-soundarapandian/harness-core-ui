/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { accountPathProps, secretPathProps } from '@common/utils/routeUtils'
import routes from '@common/RouteDefinitions'
import SecretDetailsHomePage from '../SecretDetailsHomePage'
import mockData from './secret-details-home-data.json'

jest.mock('services/cd-ng', () => ({
  useGetSecretV2: jest.fn().mockImplementation(() => {
    return { ...mockData, refetch: jest.fn(), error: null }
  }),
  useDeleteSecretV2: jest.fn().mockImplementation(() => {
    return { refetch: jest.fn(), error: null }
  })
}))

describe('Secret Details', () => {
  test('render for data', async () => {
    const { container } = render(
      <TestWrapper
        path={routes.toSecretDetailsOverview({ ...accountPathProps, ...secretPathProps })}
        pathParams={{ accountId: 'dummy', secretId: 'secretId' }}
      >
        <SecretDetailsHomePage mockSecretDetails={mockData as any} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
  test('render for no  data', async () => {
    const { container } = render(
      <TestWrapper
        path={routes.toSecretDetailsOverview({ ...accountPathProps, ...secretPathProps })}
        pathParams={{ accountId: 'dummy', secretId: 'secretId' }}
      >
        <SecretDetailsHomePage mockSecretDetails={{} as any} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
