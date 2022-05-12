/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import PipelineBuildExecutionsChart from '../PipelineBuildExecutionsChart'

jest.mock('framework/exports', () => ({
  ...(jest.requireActual('framework/exports') as any),
  useRouteParams: () => ({
    params: {
      projectIdentifier: 'test'
    }
  })
}))

jest.mock('highcharts-react-official', () => () => <div />)

const executionsMock = {
  data: {
    pipelineExecutionInfoList: [
      {
        date: '2021-04-27',
        count: {
          total: 1,
          success: 1,
          failure: 0
        }
      },
      {
        date: '2021-04-28',
        count: {
          total: 3,
          success: 0,
          failure: 3
        }
      },
      {
        date: '2021-04-29',
        count: {
          total: 10,
          success: 10,
          failure: 0
        }
      }
    ]
  }
}

jest.mock('services/pipeline-ng', () => ({
  useGetPipelineDashboardExecution: () => ({
    loading: false,
    data: executionsMock
  })
}))

describe('PipelineBuildExecutionsChart', () => {
  test('shows data correctly', () => {
    const { container } = render(
      <TestWrapper>
        <PipelineBuildExecutionsChart />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
