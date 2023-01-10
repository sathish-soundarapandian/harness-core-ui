/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor } from '@testing-library/react'

import { TestWrapper } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import { accountPathProps, executionPathProps, pipelineModuleParams } from '@common/utils/routeUtils'
import * as pipelineNg from 'services/pipeline-ng'
import type { PipelineType, ExecutionPathProps } from '@common/interfaces/RouteInterfaces'

import ExecutionInputsView from '../ExecutionInputsView'
import { inputSetYamlResponse } from './mocks/inputSetYamlV2Response'

jest.mock('@common/utils/YamlUtils', () => ({}))
jest.mock('services/pipeline-ng', () => ({
  useGetInputsetYamlV2: jest.fn(() => ({ data: inputSetYamlResponse }))
}))

jest.mock('services/cd-ng', () => ({
  useShouldDisableDeployment: jest.fn().mockReturnValue({
    loading: false,
    data: {}
  })
}))

function YamlMock({ children }: { children: JSX.Element }): React.ReactElement {
  return (
    <div>
      <span>Yaml View</span>
      {children}
    </div>
  )
}

YamlMock.YamlBuilderMemo = YamlMock
jest.mock('@common/components/YAMLBuilder/YamlBuilder', () => YamlMock)

const TEST_PATH = routes.toExecutionInputsView({
  ...accountPathProps,
  ...executionPathProps,
  ...pipelineModuleParams
})

const pathParams: PipelineType<ExecutionPathProps> = {
  accountId: 'TEST_ACCOUNT_ID',
  orgIdentifier: 'TEST_ORG',
  projectIdentifier: 'TEST_PROJECT',
  pipelineIdentifier: 'TEST_PIPELINE',
  executionIdentifier: 'TEST_EXECUTION',
  source: 'executions',
  module: 'cd'
}

describe('<ExecutionInputsView /> tests', () => {
  test('snapshot test', async () => {
    const { container, getByText } = render(
      <TestWrapper path={TEST_PATH} pathParams={pathParams as any}>
        <ExecutionInputsView />
      </TestWrapper>
    )
    expect(getByText('pipeline.inputSets.noRuntimeInputsWhileExecution')).toBeTruthy()
    await waitFor(() => expect(container).toMatchSnapshot())
  })

  test('test api failed error', () => {
    jest.spyOn(pipelineNg, 'useGetInputsetYamlV2').mockImplementation((): any => {
      return {
        data: {},
        loading: false,
        refetch: jest.fn(),
        error: {
          message: 'something went wrong'
        }
      }
    })
    const { findByText } = render(
      <TestWrapper path={TEST_PATH} pathParams={pathParams as any}>
        <ExecutionInputsView />
      </TestWrapper>
    )

    expect(findByText('something went wrong')).toBeTruthy()
  })

  test('test api response pending', () => {
    jest.spyOn(pipelineNg, 'useGetInputsetYamlV2').mockImplementation((): any => {
      return {
        data: {},
        loading: true,
        refetch: jest.fn(),
        error: null
      }
    })
    const { findByText } = render(
      <TestWrapper path={TEST_PATH} pathParams={pathParams as any}>
        <ExecutionInputsView />
      </TestWrapper>
    )
    expect(findByText('Loading, please wait...')).toBeTruthy()
  })
})
