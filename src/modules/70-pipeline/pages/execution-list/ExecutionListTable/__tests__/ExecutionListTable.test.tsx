/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { accountPathProps, pipelineModuleParams, pipelinePathProps } from '@common/utils/routeUtils'
import routes from '@common/RouteDefinitions'
import { defaultAppStoreValues } from '@common/utils/DefaultAppStoreData'
import type { PagePipelineExecutionSummary } from 'services/pipeline-ng'
import filters from '@pipeline/pages/execution-list/__mocks__/filters.json'
import executionList from '@pipeline/pages/execution-list/__mocks__/execution-list.json'
import { ExecutionListTable } from '../ExecutionListTable'

jest.mock('@common/utils/YamlUtils', () => ({}))
jest.mock('services/pipeline-ng', () => ({
  useGetFilterList: jest.fn().mockImplementation(() => {
    return { mutate: jest.fn(() => Promise.resolve(filters)), loading: false }
  }),
  useHandleInterrupt: jest.fn(() => ({})),
  useHandleStageInterrupt: jest.fn(() => ({})),
  useGetExecutionData: jest.fn().mockReturnValue({}),
  useGetInputsetYaml: jest.fn(() => ({ data: null }))
}))

describe('ExecutionListTable', () => {
  test('snapshot testing', () => {
    const { container } = render(
      <TestWrapper
        path={routes.toPipelineDeploymentList({ ...accountPathProps, ...pipelinePathProps, ...pipelineModuleParams })}
        pathParams={{
          accountId: 'testAcc',
          orgIdentifier: 'testOrg',
          projectIdentifier: 'testProject',
          pipelineIdentifier: 'testPipeline',
          module: 'cd'
        }}
        defaultAppStoreValues={defaultAppStoreValues}
      >
        <ExecutionListTable
          executionList={executionList.data as PagePipelineExecutionSummary}
          onViewCompiledYaml={jest.fn()}
        />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
  test('if pipelineExecutionSummary is empty for applied filters then display proper message for no search results found ', () => {
    const { container } = render(
      <TestWrapper
        path={routes.toPipelineDeploymentList({ ...accountPathProps, ...pipelinePathProps, ...pipelineModuleParams })}
        pathParams={{
          accountId: 'testAcc',
          orgIdentifier: 'testOrg',
          projectIdentifier: 'testProject',
          pipelineIdentifier: 'testPipeline',
          module: 'ci'
        }}
        defaultAppStoreValues={defaultAppStoreValues}
      >
        <ExecutionListTable
          executionList={executionList.data as PagePipelineExecutionSummary}
          onViewCompiledYaml={jest.fn()}
        />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
