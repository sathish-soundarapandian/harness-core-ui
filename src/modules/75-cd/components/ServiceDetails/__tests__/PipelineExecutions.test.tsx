/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, act, fireEvent, waitFor, RenderResult } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import * as cdngServices from 'services/cd-ng'
import { ExecutionCompareProvider } from '@pipeline/components/ExecutionCompareYaml/ExecutionCompareContext'
import { PipelineExecutions } from '../PipelineExecutions/PipelineExecutions'

jest.mock('highcharts-react-official', () => () => <></>)

const serviceLastDeployment = {
  status: 'SUCCESS',
  data: {
    deployments: [
      {
        pipelineName: 'qa',
        author: {
          name: 'dmeo'
        },
        pipelineIdentifier: 'qa',
        startTs: 1646480299996,
        endTs: 1646480311007,
        status: 'SUCCESS',
        planExecutionId: 'PJqUPNQKSKKwnPP30JXIZA',
        serviceInfoList: [
          {
            serviceName: 'demo1',
            serviceTag: null
          }
        ]
      },
      {}
    ]
  },
  metaData: null,
  correlationId: '23fb6247-9ad5-49dd-8a24-607a60c4afd8'
}
const noData = {
  status: 'SUCCESS',
  data: {
    deployments: []
  }
}

const renderPipelineExecutions = (): RenderResult =>
  render(
    <TestWrapper>
      <ExecutionCompareProvider>
        <PipelineExecutions />
      </ExecutionCompareProvider>
    </TestWrapper>
  )

describe('PipelineExecutions', () => {
  test('should render PipelineExecutions', async () => {
    jest.spyOn(cdngServices, 'useGetDeploymentsByServiceId').mockImplementation(() => {
      return { loading: false, error: false, data: serviceLastDeployment, refetch: jest.fn() } as any
    })
    const { container } = renderPipelineExecutions()
    expect(container).toMatchSnapshot()
  })

  test('should render PipelineExecutions with loading true', () => {
    jest.spyOn(cdngServices, 'useGetDeploymentsByServiceId').mockImplementation(() => {
      return { loading: true, error: false, data: [], refetch: jest.fn() } as any
    })
    const { container } = renderPipelineExecutions()
    expect(container).toMatchSnapshot()
  })

  test('should render PipelineExecutions with error true', () => {
    jest.spyOn(cdngServices, 'useGetDeploymentsByServiceId').mockImplementation(() => {
      return { loading: false, error: true, data: [], refetch: jest.fn() } as any
    })
    const { container, getByText } = renderPipelineExecutions()
    fireEvent.click(getByText('Retry'))
    expect(container).toMatchSnapshot()
  })

  test('render no data', () => {
    jest.spyOn(cdngServices, 'useGetDeploymentsByServiceId').mockImplementation(() => {
      return { loading: false, error: false, data: noData, refetch: jest.fn() } as any
    })
    const { container } = renderPipelineExecutions()
    expect(container).toMatchSnapshot()
  })

  test('should render no execution', async () => {
    jest.spyOn(cdngServices, 'useGetDeploymentsByServiceId').mockImplementation(() => {
      return { loading: false, error: false, data: serviceLastDeployment, refetch: jest.fn() } as any
    })
    const { getByPlaceholderText, queryByText } = renderPipelineExecutions()
    const searchBox = getByPlaceholderText('search')
    expect(searchBox).not.toBe(null)
    act(() => {
      fireEvent.change(getByPlaceholderText('search'), { target: { value: 'randomstring223' } })
    })
    await waitFor(() => expect(queryByText('qa')).toBeNull())
  })
})
