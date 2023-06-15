/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import { accountPathProps } from '@common/utils/routeUtils'
import SetupEngine from '../views/SetupEngine'
import { mockResponse } from './mock'

jest.mock('@connectors/pages/connectors/utils/ConnectorUtils', () => ({
  ...jest.requireActual('@connectors/pages/connectors/utils/ConnectorUtils'),
  setupEngineFormData: () =>
    Promise.resolve({
      secretEngine: '',
      engineType: 'fetch',
      secretEngineName: '',
      secretEngineVersion: 2
    })
}))

const fetchEngines = jest.fn(() => Promise.resolve(mockResponse))

jest.mock('services/cd-ng', () => ({
  useGetConnector: jest.fn().mockImplementation(() => {
    return { data: {}, refetch: jest.fn() }
  }),
  useGetMetadata: jest.fn().mockImplementation(() => ({
    mutate: fetchEngines,
    loading: false
  })),
  useUpdateConnector: jest.fn().mockImplementation(() => ({
    mutate: () => Promise.resolve(mockResponse),
    loading: false
  })),
  useCreateConnector: jest.fn().mockImplementation(() => ({
    mutate: () => Promise.resolve(mockResponse),
    loading: false
  }))
}))

describe('Setup engine tests', () => {
  test('should render properly', () => {
    const { queryByText } = render(
      <TestWrapper path={routes.toConnectors({ ...accountPathProps })} pathParams={{ accountId: 'dummy' }}>
        <SetupEngine
          isEditMode={false}
          accountId={'dummyaccountId'}
          orgIdentifier="dummyorg"
          projectIdentifier="dummyProject"
          connectorInfo={undefined}
          setIsEditMode={() => {
            // empty
          }}
        />
      </TestWrapper>
    )

    expect(queryByText('connectors.hashiCorpVault.setupEngine')).toBeDefined()
  })

  test('test fetch engines to be called', async () => {
    render(
      <TestWrapper path={routes.toConnectors({ ...accountPathProps })} pathParams={{ accountId: 'dummy' }}>
        <SetupEngine
          isEditMode={true}
          accountId={'dummyaccountId'}
          orgIdentifier="dummyorg"
          projectIdentifier="dummyProject"
          prevStepData={{ name: 'dummyname', identifier: 'dummyidentifier', spec: {}, type: 'AppDynamics' }}
          connectorInfo={{
            spec: { secretEngineManuallyConfigured: false },
            name: 'dummyname',
            identifier: 'dummyidentifier',
            type: 'AppDynamics'
          }}
          setIsEditMode={() => {
            // empty
          }}
        />
      </TestWrapper>
    )

    await waitFor(() => expect(fetchEngines).toBeCalledTimes(1))
  })
})
