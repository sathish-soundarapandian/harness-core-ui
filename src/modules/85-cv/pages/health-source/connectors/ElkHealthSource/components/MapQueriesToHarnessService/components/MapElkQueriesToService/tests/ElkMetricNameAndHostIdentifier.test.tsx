/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import {
  mockedElkIndicesData,
  mockedElkSampleData
} from '@cv/pages/health-source/connectors/ElkHealthSource/__tests__/ElkHealthSource.mock'
import { ElkMetricNameAndHostIdentifier } from '../ElkMetricNameAndHostIdentifier'

jest.mock('services/cv', () => ({
  // useGetElkSavedSearches: jest.fn().mockImplementation(() => ({
  //   data: [],
  //   refetch: jest.fn()
  // })),
  useGetELKLogSampleData: jest.fn().mockImplementation(() => ({
    data: mockedElkSampleData,
    loading: false,
    error: null,
    refetch: jest.fn()
  })),
  useGetELKIndices: jest.fn().mockImplementation(() => ({
    data: mockedElkIndicesData,
    loading: false,
    error: null,
    refetch: jest.fn()
  })),
  useGetTimeFormat: jest.fn().mockImplementation(() => ({
    data: [],
    loading: false,
    error: null,
    refetch: jest.fn()
  }))
}))

describe('Unit tests for MapELKQueriesToService', () => {
  // const initialProps: MapElkQueriesToServiceProps = {
  //   onChange: jest.fn(),
  //   sampleRecord: null,
  //   serviceInstance: 'serviceInstance',
  //   isQueryExecuted: true,
  //   loading: false,
  //   messageIdentifier: '',
  //   identifyTimeStamp: '',
  //   isConnectorRuntimeOrExpression: true,
  //   isTemplate: false,
  //   connectorIdentifier: ''
  // }

  // onChange,
  // sampleRecord,
  // isQueryExecuted,
  // loading,
  // serviceInstance,
  // messageIdentifier,
  // isConnectorRuntimeOrExpression,
  // isTemplate,
  // expressions,
  // connectorIdentifier
  const initialProps = {
    onChange: jest.fn(),
    sampleRecord: null,
    serviceInstance: 'serviceInstance',
    isQueryExecuted: true,
    loading: false,
    messageIdentifier: '',
    isConnectorRuntimeOrExpression: true,
    isTemplate: false,
    expressions: [],
    connectorIdentifier: '',
    identifyTimeStamp: ''
  }

  test('Ensure that query name is present', async () => {
    const { getByText } = render(
      <TestWrapper>
        <ElkMetricNameAndHostIdentifier {...initialProps} />
      </TestWrapper>
    )
    await waitFor(() => expect(getByText('cv.monitoringSources.queryNameLabel')).not.toBeNull())
  })

  test('Ensure that service instance field is present', async () => {
    const { getByText } = render(
      <TestWrapper>
        <ElkMetricNameAndHostIdentifier {...initialProps} />
      </TestWrapper>
    )
    await waitFor(() => expect(getByText('cv.monitoringSources.gcoLogs.serviceInstance')).not.toBeNull())
  })
})
