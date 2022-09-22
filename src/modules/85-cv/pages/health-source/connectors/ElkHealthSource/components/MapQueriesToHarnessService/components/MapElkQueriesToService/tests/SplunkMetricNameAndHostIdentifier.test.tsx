/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { SplunkMetricNameAndHostIdentifier } from '../SplunkMetricNameAndHostIdentifier'

describe('Unit tests for MapSplunkQueriesToService', () => {
  const initialProps = {
    onChange: jest.fn(),
    sampleRecord: null,
    serviceInstance: 'serviceInstance',
    isQueryExecuted: true,
    loading: false
  }
  test('Ensure that query name is present', async () => {
    const { getByText } = render(
      <TestWrapper>
        <SplunkMetricNameAndHostIdentifier {...initialProps} />
      </TestWrapper>
    )
    await waitFor(() => expect(getByText('cv.monitoringSources.queryNameLabel')).not.toBeNull())
  })

  test('Ensure that service instance field is present', async () => {
    const { getByText } = render(
      <TestWrapper>
        <SplunkMetricNameAndHostIdentifier {...initialProps} />
      </TestWrapper>
    )
    await waitFor(() => expect(getByText('cv.monitoringSources.gcoLogs.serviceInstance')).not.toBeNull())
  })
})
