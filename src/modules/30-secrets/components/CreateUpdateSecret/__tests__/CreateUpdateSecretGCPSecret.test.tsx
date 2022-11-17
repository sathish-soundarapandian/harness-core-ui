/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'

import { TestWrapper } from '@common/utils/testUtils'
import CreateUpdateSecret from '../CreateUpdateSecret'

import mockData from './listSecretManagersMock.json'
import { gcpSecretMock, gcpConnector } from './gcpSecretManagerMock'

const mockUpdateTextSecret = jest.fn()

jest.mock('services/cd-ng', () => ({
  usePutSecret: jest.fn().mockImplementation(() => ({ mutate: mockUpdateTextSecret })),
  usePostSecret: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
  usePostSecretFileV2: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
  usePutSecretFileV2: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
  useGetGcpRegions: jest.fn().mockImplementation(() => ({
    mutate: jest.fn(),
    refetch: jest.fn(() =>
      Promise.resolve({
        status: 'SUCCESS',
        data: ['us-east1', 'us-east2', 'us-east4'],
        metaData: null,
        correlationId: '41bf7519-7c22-4543-93cb-fd38e5a4d95a'
      })
    ),
    data: null
  })),
  useGetSecretV2: jest.fn().mockImplementation(() => ({ refetch: jest.fn(), data: gcpSecretMock })),
  useGetConnectorList: () => {
    return {
      data: mockData,
      refetch: jest.fn()
    }
  },
  useGetConnector: () => {
    return {
      data: gcpConnector,
      refetch: jest.fn()
    }
  }
}))

describe('CreateUpdateSecret GCP Secret manager', () => {
  test('Text Secret in GCP', async () => {
    const { container } = render(
      <TestWrapper path="/account/:accountId/resources/secrets" pathParams={{ accountId: 'dummy' }}>
        <CreateUpdateSecret secret={gcpSecretMock as any} type={'SecretText'} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
