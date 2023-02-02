/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'

import routes from '@common/RouteDefinitions'
import { accountPathProps, pipelineModuleParams, pipelinePathProps } from '@common/utils/routeUtils'
import { TestWrapper } from '@common/utils/testUtils'
import pipelineContextMock from '@pipeline/components/PipelineStudio/PipelineCanvas/__tests__/PipelineCanvasGitSyncTestHelper'
import { PipelineContextV1 } from '../PipelineContextV1/PipelineContextV1'
import { PipelineStudioInternalV1 } from '../../PipelineStudioInternalV1/PipelineStudioInternalV1'

jest.mock('services/pipeline-ng', () => ({
  putPipelinePromise: jest.fn().mockImplementation(() => Promise.resolve({ status: 'SUCCESS' })),
  createPipelinePromise: jest.fn().mockImplementation(() => Promise.resolve({ status: 'SUCCESS' })),
  useGetInputsetYaml: jest.fn(() => ({ data: null })),
  useCreateVariablesV2: jest.fn(() => ({
    mutate: jest.fn(() => Promise.resolve({ data: { yaml: '' } })),
    loading: false,
    cancel: jest.fn()
  })),
  useGetStepYamlSchema: jest.fn()
}))

jest.mock('services/cd-ng-rq', () => ({
  useGetSourceCodeManagersQuery: jest.fn().mockImplementation(() => {
    return { data: [{}], refetch: jest.fn() }
  })
}))

describe('PipelineStudioV1 tests', () => {
  test('Render Pipeline Studio V1', () => {
    const { getByText: getElementByText } = render(
      <PipelineContextV1.Provider value={{ ...pipelineContextMock, view: 'YAML' }}>
        <TestWrapper
          path={routes.toPipelineStudio({ ...accountPathProps, ...pipelinePathProps, ...pipelineModuleParams })}
          pathParams={{
            accountId: 'account_id',
            orgIdentifier: 'default',
            projectIdentifier: 'testProject',
            pipelineIdentifier: 'test_pipeline',
            module: 'ci'
          }}
          queryParams={{
            repoIdentifier: 'identifier',
            branch: 'feature'
          }}
        >
          <PipelineStudioInternalV1
            routePipelineStudio={routes.toPipelineStudioV1}
            routePipelineDetail={routes.toPipelineDetail}
            routePipelineList={routes.toPipelines}
            routePipelineProject={routes.toProjectDetails}
          />
        </TestWrapper>
      </PipelineContextV1.Provider>
    )
    const errorTitle = getElementByText('errorTitle')
    expect(errorTitle).toBeInTheDocument()

    const errorSubtitle = getElementByText('errorSubtitle')
    expect(errorSubtitle).toBeInTheDocument()

    const clickHereBtn = getElementByText('clickHere')
    expect(clickHereBtn).toBeInTheDocument()
  })
})
