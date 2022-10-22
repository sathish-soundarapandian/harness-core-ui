/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor } from '@testing-library/react'
import { defaultAppStoreValues } from '@common/utils/DefaultAppStoreData'
import * as ExecutionContext from '@pipeline/context/ExecutionContext'
import { TestWrapper } from '@common/utils/testUtils'
import * as tiService from 'services/ti-service'
import TestSuiteMock from './mock/reports-test-suites.json'
import TestCaseMock from './mock/reports-test-cases.json'
import TotalTestsZeroMock from './mock/total-tests-zero.json'
import InfoMock from './mock/info.json'
import CallGraphMock from './mock/callgraph.json'
import BuildsMock from './mock/builds.json'
import mockContext from './mock/context.json'
import mockParams from './mock/params.json'
import BuildTestsApp from '../BuildTestsApp'

describe('BuildTestsApp', () => {
  test('Initial render with TI_MFE_ENABLED enabled', async () => {
    jest.mock('@pipeline/context/ExecutionContext', () => ({
      useExecutionContext: jest.fn().mockReturnValue(mockContext)
    }))

    const { getByText } = render(
      <TestWrapper
        path="/account/uy6FLHeWTBOOPZA8xchgZA/ci/orgs/default/projects/Default_Project_1657212353481/pipelines/mtranjhttp/deployments/zRKfRlLUQ1q-W7u6ITyP2g/tests"
        pathParams={{ ...mockParams }}
        defaultFeatureFlagValues={{ TI_MFE_ENABLED: true }}
      >
        <BuildTestsApp />
      </TestWrapper>
    )
    await waitFor(() => expect(getByText('Loading, please wait...')).toBeDefined()) // connect to tiui mfe
  })
  test('Initial render with TI_MFE_ENABLED disabled', () => {
    jest.spyOn(tiService, 'useReportsInfo').mockReturnValue({ data: InfoMock, refetch: jest.fn() } as any)
    jest.spyOn(tiService, 'useTestInfo').mockReturnValue({ data: InfoMock, refetch: jest.fn() } as any)
    jest.spyOn(tiService, 'useReportSummary').mockReturnValue({ data: TotalTestsZeroMock, refetch: jest.fn() } as any)
    jest.spyOn(tiService, 'useTestOverview').mockReturnValue({ data: TotalTestsZeroMock, refetch: jest.fn() } as any)
    jest.spyOn(tiService, 'useTestSuiteSummary').mockReturnValue({ data: TestSuiteMock, refetch: jest.fn() } as any)
    jest.spyOn(tiService, 'useTestCaseSummary').mockReturnValue({ data: TestCaseMock, refetch: jest.fn() } as any)
    jest.spyOn(tiService, 'useVgSearch').mockReturnValue({ data: CallGraphMock, refetch: jest.fn() } as any)
    jest.spyOn(tiService, 'useGetToken').mockReturnValue({ data: 'some-token', refetch: jest.fn() } as any)
    jest.spyOn(ExecutionContext, 'useExecutionContext').mockReturnValue({
      pipelineExecutionDetail: {
        pipelineExecutionSummary: BuildsMock
      }
    } as any)
    const { container } = render(
      <TestWrapper
        path="/account/zEaak-FLS425IEO7OLzMUg/ci/orgs/default/projects/TestCiProject1/pipelines/harshtriggerpipeline/executions/2NHi3lznTkegKnerhPf5og/tests"
        pathParams={{
          accountId: 'zEaak-FLS425IEO7OLzMUg',
          orgIdentifier: 'default',
          projectIdentifier: 'citestproject',
          buildIdentifier: 2445
        }}
        defaultAppStoreValues={defaultAppStoreValues}
        defaultFeatureFlagValues={{ TI_MFE_ENABLED: false }}
      >
        <BuildTestsApp />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
