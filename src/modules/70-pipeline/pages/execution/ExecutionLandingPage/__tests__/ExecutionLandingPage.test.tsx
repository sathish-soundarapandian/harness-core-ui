/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import {
  render,
  fireEvent,
  act,
  findByText as findByTextContainer,
  queryByAttribute,
  waitFor
} from '@testing-library/react'
import mockImport from 'framework/utils/mockImport'
import { TestWrapper, CurrentLocation } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import { accountPathProps, executionPathProps, pipelineModuleParams } from '@common/utils/routeUtils'
import { useGetExecutionDetailV2 } from 'services/pipeline-ng'

import type { ExecutionStatus } from '@pipeline/utils/statusHelpers'
import type { ExecutionPathProps, PipelineType } from '@common/interfaces/RouteInterfaces'
import { PipelineResponse as PipelineDetailsMockResponse } from '@pipeline/pages/pipeline-details/__tests__/PipelineDetailsMocks'
import { mockRetryHistory } from '@pipeline/components/RetryPipeline/RetryHistory/__tests__/mocks'
import ExecutionLandingPage, { POLL_INTERVAL } from '../ExecutionLandingPage'
import reportSummaryMock from './report-summary-mock.json'
import {
  ciPipelineExecutionSummaryWithK8sInfra,
  cdPipelineExecutionSummary,
  ciPipelineExecutionSummaryWithHostedVMsInfra
} from './execution-summary-mock'

jest.mock('services/pipeline-rq', () => ({
  useGetPipelineSummaryQuery: jest.fn(() => PipelineDetailsMockResponse)
}))

jest.mock('services/pipeline-ng', () => ({
  useGetPipelineSummary: jest.fn(() => ({
    refetch: jest.fn(),
    loading: false,
    data: {
      data: { storeType: 'INLINE' }
    }
  })),
  useGetExecutionDetailV2: jest.fn(() => ({
    refetch: jest.fn(),
    loading: false,
    data: {
      data: { pipelineExecution: {}, stageGraph: {} }
    }
  })),
  useCreateVariablesForPipelineExecution: jest.fn().mockReturnValue({
    mutate: jest.fn(),
    cancel: jest.fn()
  }),
  useHandleInterrupt: jest.fn(() => ({
    mutate: jest.fn()
  })),
  useHandleStageInterrupt: jest.fn(() => ({
    mutate: jest.fn()
  })),
  useGetInputsetYaml: jest.fn(() => ({ data: null })),
  useRetryHistory: jest.fn(() => mockRetryHistory),
  useDebugPipelineExecuteWithInputSetYaml: jest.fn(() => ({
    loading: false,
    refetch: jest.fn(),
    mutate: jest.fn().mockResolvedValue({
      data: {
        correlationId: '',
        status: 'SUCCESS',
        metaData: null,
        data: {}
      }
    })
  })),
  useGetExecutionData: jest.fn(() => ({ data: null }))
}))

jest.mock('services/ti-service', () => ({
  useReportSummary: () => ({
    data: reportSummaryMock,
    refetch: jest.fn()
  }),
  useGetToken: () => ({
    data: 'some-token'
  })
}))

const getDeprecatedConfigPromise = jest.fn().mockImplementation(() => {
  return Promise.resolve({
    status: 'SUCCESS',
    data: {
      addonTag: 'harness/ci-addon:0.16.2',
      liteEngineTag: 'harness/ci-lite-engine:0.16.2'
    }
  })
})

mockImport('services/ci', {
  getDeprecatedConfigPromise
})

jest.mock('@common/components/YAMLBuilder/YamlBuilder')
jest.mock('@common/utils/YamlUtils', () => ({}))

jest.useFakeTimers()

const TEST_EXECUTION_PATH = routes.toExecution({
  ...accountPathProps,
  ...executionPathProps,
  ...pipelineModuleParams
})
const TEST_EXECUTION_PIPELINE_PATH = routes.toExecutionPipelineView({
  ...accountPathProps,
  ...executionPathProps,
  ...pipelineModuleParams
})

const fetchMock = jest.spyOn(global, 'fetch' as any)
fetchMock.mockResolvedValue({
  text: () => new Promise(resolve => resolve([]))
})

describe('<ExecutionLandingPage /> tests', () => {
  const pathParams: PipelineType<ExecutionPathProps> = {
    accountId: 'TEST_ACCOUNT_ID',
    orgIdentifier: 'TEST_ORG',
    projectIdentifier: 'TEST_PROJECT',
    pipelineIdentifier: 'TEST_PIPELINE',
    executionIdentifier: 'TEST_EXECUTION',
    source: 'executions',
    module: 'cd'
  }

  test('loading state - snapshot test', () => {
    ;(useGetExecutionDetailV2 as jest.Mock).mockImplementation(() => ({
      refetch: jest.fn(),
      loading: true,
      data: null
    }))
    const { container } = render(
      <TestWrapper path={TEST_EXECUTION_PATH} pathParams={pathParams as unknown as Record<string, string>}>
        <ExecutionLandingPage>
          <div data-testid="children">Execution Landing Page</div>
        </ExecutionLandingPage>
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test.each<[string, string]>([
    ['common.pipeline', routes.toExecutionPipelineView(pathParams)],
    ['inputs', routes.toExecutionInputsView(pathParams)]
    // [i18nTabs.artifacts, routes.toExecutionArtifactsView(pathParams)]
  ])('Navigation to "%s" Tabs work', async (tab, url) => {
    ;(useGetExecutionDetailV2 as jest.Mock).mockImplementation(() => ({
      refetch: jest.fn(),
      loading: true,
      data: null
    }))
    const { container, getByTestId } = render(
      <TestWrapper path={TEST_EXECUTION_PATH} pathParams={pathParams as unknown as Record<string, string>}>
        <ExecutionLandingPage>
          <div data-testid="children">Execution Landing Page</div>
        </ExecutionLandingPage>
      </TestWrapper>
    )

    const tabElem = await findByTextContainer(container.querySelector('.bp3-tab-list') as HTMLElement, tab)

    fireEvent.click(tabElem.closest('a')!)
    expect(getByTestId('location').innerHTML.endsWith(url)).toBe(true)
  })

  test('Toggle between log/graph view works', async () => {
    const { container, getByTestId } = render(
      <TestWrapper path={TEST_EXECUTION_PIPELINE_PATH} pathParams={pathParams as unknown as Record<string, string>}>
        <ExecutionLandingPage>
          <CurrentLocation />
        </ExecutionLandingPage>
      </TestWrapper>
    )

    const tabElem = queryByAttribute('name', container, 'console-view-toggle')!

    fireEvent.click(tabElem)

    expect(getByTestId('location')).toMatchInlineSnapshot(`
      <div
        data-testid="location"
      >
        /account/TEST_ACCOUNT_ID/cd/orgs/TEST_ORG/projects/TEST_PROJECT/pipelines/TEST_PIPELINE/executions/TEST_EXECUTION/pipeline?view=log&filterAnomalous=false&type=pipeline.verification.analysisTab.metrics
      </div>
    `)

    fireEvent.click(tabElem)

    expect(getByTestId('location')).toMatchInlineSnapshot(`
      <div
        data-testid="location"
      >
        /account/TEST_ACCOUNT_ID/cd/orgs/TEST_ORG/projects/TEST_PROJECT/pipelines/TEST_PIPELINE/executions/TEST_EXECUTION/pipeline?view=graph&filterAnomalous=false&type=pipeline.verification.analysisTab.metrics
      </div>
    `)
  })

  test.each<[ExecutionStatus, boolean]>([
    ['Aborted', false],
    ['Running', true]
  ])('For status "%s" - polling is `%s`', (status, called) => {
    const refetch = jest.fn()

    ;(useGetExecutionDetailV2 as jest.Mock).mockImplementation(() => ({
      refetch,
      loading: false,
      data: { data: { pipelineExecutionSummary: { status } } }
    }))

    render(
      <TestWrapper path={TEST_EXECUTION_PATH} pathParams={pathParams as unknown as Record<string, string>}>
        <ExecutionLandingPage>
          <div data-testid="children">Execution Landing Page</div>
        </ExecutionLandingPage>
      </TestWrapper>
    )

    act(() => {
      jest.advanceTimersByTime(POLL_INTERVAL + 100)
    })

    expect(refetch).toHaveBeenCalledTimes(called ? 1 : 0)
  })
})

describe('<ExecutionLandingPage /> tests for CI', () => {
  const pathParams: PipelineType<ExecutionPathProps> = {
    accountId: 'TEST_ACCOUNT_ID',
    orgIdentifier: 'TEST_ORG',
    projectIdentifier: 'TEST_PROJECT',
    pipelineIdentifier: 'TEST_PIPELINE',
    executionIdentifier: 'TEST_EXECUTION',
    source: 'executions',
    module: 'ci'
  }

  test('loading state - snapshot test for CI module', () => {
    ;(useGetExecutionDetailV2 as jest.Mock).mockImplementation(() => ({
      refetch: jest.fn(),
      loading: true,
      data: null
    }))
    const { container } = render(
      <TestWrapper path={TEST_EXECUTION_PATH} pathParams={pathParams as unknown as Record<string, string>}>
        <ExecutionLandingPage>
          <div data-testid="children">Execution Landing Page</div>
        </ExecutionLandingPage>
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('reroute to tests view if tests are failing', async () => {
    ;(useGetExecutionDetailV2 as jest.Mock).mockImplementation(() => ({
      refetch: jest.fn(),
      loading: true,
      data: null
    }))
    const routesToExecutionTestsSpy = jest.spyOn(routes, 'toExecutionTestsView')
    render(
      <TestWrapper path={TEST_EXECUTION_PATH} pathParams={pathParams as unknown as Record<string, string>}>
        <ExecutionLandingPage>
          <div data-testid="children">Execution Landing Page</div>
        </ExecutionLandingPage>
      </TestWrapper>
    )
    await waitFor(() => expect(routesToExecutionTestsSpy).toHaveBeenCalled())
  })

  const routeToPipelineStudioV1 = jest.spyOn(routes, 'toPipelineStudioV1')
  test('For CI with FF CI_YAML_VERSIONING ON, on edit, take user to Pipeline Studio V1 route', async () => {
    mockImport('@common/hooks/useFeatureFlag', {
      useFeatureFlags: () => ({ CI_YAML_VERSIONING: true })
    })
    ;(useGetExecutionDetailV2 as jest.Mock).mockImplementation(() => ({
      refetch: jest.fn(),
      loading: true,
      data: null
    }))
    const { getByText } = render(
      <TestWrapper path={TEST_EXECUTION_PATH} pathParams={pathParams as unknown as Record<string, string>}>
        <ExecutionLandingPage>
          <div data-testid="children">Execution Landing Page</div>
        </ExecutionLandingPage>
      </TestWrapper>
    )
    act(() => {
      fireEvent.click(getByText('editPipeline')!)
    })
    expect(routeToPipelineStudioV1).toHaveBeenCalled()
  })

  test('does not fetch deprecated config for a pipeline with just a CD stage', () => {
    ;(useGetExecutionDetailV2 as jest.Mock).mockImplementation(() => ({
      refetch: jest.fn(),
      loading: false,
      data: cdPipelineExecutionSummary
    }))

    render(
      <TestWrapper path={TEST_EXECUTION_PATH} pathParams={pathParams as unknown as Record<string, string>}>
        <ExecutionLandingPage>
          <div data-testid="children">Execution Landing Page</div>
        </ExecutionLandingPage>
      </TestWrapper>
    )
    expect(getDeprecatedConfigPromise).not.toBeCalled()
  })

  test('does not fetch deprecated config for a pipeline having no CI stage with K8s infra', () => {
    ;(useGetExecutionDetailV2 as jest.Mock).mockImplementation(() => ({
      refetch: jest.fn(),
      loading: false,
      data: ciPipelineExecutionSummaryWithHostedVMsInfra
    }))

    render(
      <TestWrapper path={TEST_EXECUTION_PATH} pathParams={pathParams as unknown as Record<string, string>}>
        <ExecutionLandingPage>
          <div data-testid="children">Execution Landing Page</div>
        </ExecutionLandingPage>
      </TestWrapper>
    )
    expect(getDeprecatedConfigPromise).not.toBeCalled()
  })

  test('fetches deprecated config for a pipeline with CI stage with K8s infra', () => {
    ;(useGetExecutionDetailV2 as jest.Mock).mockImplementation(() => ({
      refetch: jest.fn(),
      loading: false,
      data: ciPipelineExecutionSummaryWithK8sInfra
    }))

    render(
      <TestWrapper path={TEST_EXECUTION_PATH} pathParams={pathParams as unknown as Record<string, string>}>
        <ExecutionLandingPage>
          <div data-testid="children">Execution Landing Page</div>
        </ExecutionLandingPage>
      </TestWrapper>
    )
    expect(getDeprecatedConfigPromise).toBeCalled()
  })
})
