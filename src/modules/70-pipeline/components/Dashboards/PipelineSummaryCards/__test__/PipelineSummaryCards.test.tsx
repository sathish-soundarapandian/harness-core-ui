/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import PipelineSummaryCards from '../PipelineSummaryCards'

jest.mock('framework/exports', () => ({
  ...(jest.requireActual('framework/exports') as any),
  useRouteParams: () => ({
    params: {
      projectIdentifier: 'test'
    }
  })
}))

const healthMock = {
  data: {
    executions: {
      total: {
        count: 16,
        rate: -20.0
      },
      success: {
        percent: 81.25,
        rate: 85.71428571428571
      },
      meanInfo: {
        duration: '5522',
        rate: '5314'
      },
      medianInfo: {
        duration: '135',
        rate: '44'
      }
    }
  }
}

jest.mock('services/pipeline-ng', () => ({
  useFetchPipelineHealth: () => ({
    loading: false,
    data: healthMock
  })
}))

describe('PipelineSummaryCards', () => {
  test('shows data correctly', () => {
    const { container } = render(
      <TestWrapper>
        <PipelineSummaryCards />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
