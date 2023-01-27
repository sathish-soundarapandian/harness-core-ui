/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { RiskValues } from '@cv/utils/CommonUtils'
import { PrimaryAndCanaryNodes } from '../PrimaryAndCanaryNodes'

describe('Unit tests for PrimaryAndCanaryNodes', () => {
  beforeEach(() => {
    Element.prototype.getBoundingClientRect = jest.fn(() => {
      return {
        width: 500,
        height: 1000,
        top: 0,
        left: 0,
        bottom: 0,
        right: 0
      } as any
    })
  })
  afterEach(() => {
    jest.clearAllMocks()
  })
  afterAll(() => {
    jest.resetAllMocks()
  })
  test('Ensure that passed in data is rendered correctly', async () => {
    const { container, getByText } = render(
      <TestWrapper>
        <PrimaryAndCanaryNodes
          primaryNodes={[
            { risk: RiskValues.HEALTHY, hostName: 'someName', anomalousLogClustersCount: 2, anomalousMetricsCount: 3 }
          ]}
          primaryNodeLabel="PRE_DEPLOYMENT"
          canaryNodeLabel="POST_DEPLOYMENT"
          canaryNodes={[
            {
              risk: RiskValues.NEED_ATTENTION,
              hostName: 'anotherName',
              anomalousLogClustersCount: 7,
              anomalousMetricsCount: 3
            }
          ]}
        />
      </TestWrapper>
    )

    await waitFor(() => expect(getByText('BEFORE')).not.toBeNull())
    await waitFor(() => expect(getByText('AFTER')).not.toBeNull())
    await waitFor(() => expect(container.querySelectorAll('[class~="nodeHealth"]').length).toBe(2))
  })
})
