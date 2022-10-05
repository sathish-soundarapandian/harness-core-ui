/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import * as Highcharts from 'highcharts'
import { render, waitFor, queryByText, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { TestReportSummary } from 'services/ti-service'
import { defaultAppStoreValues } from '@common/utils/DefaultAppStoreData'
import { TestWrapper } from '@common/utils/testUtils'
import * as tiService from 'services/ti-service'
import * as FeatureFlag from '@common/hooks/useFeatureFlag'
import * as ExecutionContext from '@pipeline/context/ExecutionContext'
import ReportsSummaryMock from './mock/reports-summary.json'
import OverviewMock from './mock/overview.json'
import TestSuiteMock from './mock/reports-test-suites.json'
import TestCaseMock from './mock/reports-test-cases.json'
import BuildsMock from './mock/builds.json'
import TotalTestsZeroMock from './mock/total-tests-zero.json'
import InfoMock from './mock/info.json'
import CallGraphMock from './mock/callgraph.json'
import BuildTests from '../BuildTests'
import ExecutionGraphParallelism from './mock/pipelineExecutionGraphParallelism.json'
import InfoParallelism from './mock/infoParallelism.json'
import { TestsCallgraph } from '../TestsCallgraph'

if (process.env.NODE_ENV === 'test') {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  Highcharts.useSerialIds(true)
}

describe('BuildTests snapshot test', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  test('should render TI+Reports UI', async () => {
    jest.spyOn(tiService, 'useReportsInfo').mockReturnValue({ data: InfoMock, refetch: jest.fn() } as any)
    jest.spyOn(tiService, 'useTestInfo').mockReturnValue({ data: InfoMock, refetch: jest.fn() } as any)
    jest.spyOn(tiService, 'useReportSummary').mockReturnValue({ data: ReportsSummaryMock, refetch: jest.fn() } as any)
    jest.spyOn(tiService, 'useTestOverview').mockReturnValue({ data: OverviewMock, refetch: jest.fn() } as any)
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
      >
        <BuildTests reportSummaryMock={ReportsSummaryMock as TestReportSummary} testOverviewMock={OverviewMock} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('should render TI UI', async () => {
    jest.spyOn(tiService, 'useReportsInfo').mockReturnValue({ data: InfoMock, refetch: jest.fn() } as any)
    jest.spyOn(tiService, 'useTestInfo').mockReturnValue({ data: InfoMock, refetch: jest.fn() } as any)
    jest.spyOn(tiService, 'useReportSummary').mockReturnValue({ data: TotalTestsZeroMock, refetch: jest.fn() } as any)
    jest.spyOn(tiService, 'useTestOverview').mockReturnValue({ data: OverviewMock, refetch: jest.fn() } as any)
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
      >
        <BuildTests reportSummaryMock={TotalTestsZeroMock as TestReportSummary} testOverviewMock={OverviewMock} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('should render TI UI Parallelism alphabetically', async () => {
    jest.spyOn(tiService, 'useReportsInfo').mockReturnValue({ data: InfoParallelism, refetch: jest.fn() } as any)
    jest.spyOn(tiService, 'useTestInfo').mockReturnValue({ data: InfoParallelism, refetch: jest.fn() } as any)
    jest.spyOn(tiService, 'useReportSummary').mockReturnValue({ data: OverviewMock, refetch: jest.fn() } as any)
    jest.spyOn(tiService, 'useTestOverview').mockReturnValue({ data: OverviewMock, refetch: jest.fn() } as any)
    jest.spyOn(tiService, 'useTestSuiteSummary').mockReturnValue({ data: TestSuiteMock, refetch: jest.fn() } as any)
    jest.spyOn(tiService, 'useTestCaseSummary').mockReturnValue({ data: TestCaseMock, refetch: jest.fn() } as any)
    jest.spyOn(tiService, 'useVgSearch').mockReturnValue({ data: CallGraphMock, refetch: jest.fn() } as any)
    jest.spyOn(tiService, 'useGetToken').mockReturnValue({ data: 'some-token', refetch: jest.fn() } as any)
    jest.spyOn(ExecutionContext, 'useExecutionContext').mockReturnValue({
      pipelineExecutionDetail: {
        pipelineExecutionSummary: BuildsMock,
        executionGraph: ExecutionGraphParallelism
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
      >
        <BuildTests reportSummaryMock={TotalTestsZeroMock as TestReportSummary} testOverviewMock={OverviewMock} />
      </TestWrapper>
    )
    const stepOptionCaret = container.querySelector('[class*="stepOptions"] [icon="chevron-down"]')
    if (!stepOptionCaret) {
      throw Error('Cannot find step caret')
    }
    userEvent.click(stepOptionCaret)

    await waitFor(() => {
      const options = container.querySelectorAll('[class*="bp3-menu"] li [class*="menuItem"]')
      const arr = []
      options.forEach(item => arr.push(item.getAttribute('innerHTML')))
      const expected = [
        'All Steps',
        'Step: Run Pytests_0',
        'Step: Run Pytests_1',
        'Step: Run Pytests_2',
        'Step: Run Pytests_3',
        'Step: Run Pytests_4',
        'Step: Run Pytests_5'
      ]
      const optionLabels = Array.from(options).map(x => x.innerHTML)
      expect(options).toHaveLength(7)
      expect(optionLabels).toEqual(expected)
    })
  })

  test('should render Reports UI', async () => {
    jest.spyOn(tiService, 'useReportsInfo').mockReturnValue({ data: InfoMock, refetch: jest.fn() } as any)
    jest.spyOn(tiService, 'useTestInfo').mockReturnValue({ data: [], refetch: jest.fn() } as any) // no ti response
    jest.spyOn(tiService, 'useReportSummary').mockReturnValue({ data: ReportsSummaryMock, refetch: jest.fn() } as any)
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
      >
        <BuildTests />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('should render TICallToAction without Upgrade Required', async () => {
    jest.spyOn(FeatureFlag, 'useFeatureFlags').mockReturnValue({
      NG_LICENSES_ENABLED: true
    })

    jest.spyOn(tiService, 'useReportsInfo').mockReturnValue({ data: InfoMock, refetch: jest.fn() } as any)
    jest.spyOn(tiService, 'useTestInfo').mockReturnValue({ data: [], refetch: jest.fn() } as any) // no ti response
    jest.spyOn(tiService, 'useReportSummary').mockReturnValue({ data: ReportsSummaryMock, refetch: jest.fn() } as any)
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
    render(
      <TestWrapper
        path="/account/zEaak-FLS425IEO7OLzMUg/ci/orgs/default/projects/TestCiProject1/pipelines/harshtriggerpipeline/executions/2NHi3lznTkegKnerhPf5og/tests"
        pathParams={{
          accountId: 'zEaak-FLS425IEO7OLzMUg',
          orgIdentifier: 'default',
          projectIdentifier: 'citestproject',
          buildIdentifier: 2445
        }}
        defaultAppStoreValues={defaultAppStoreValues}
      >
        <BuildTests />
      </TestWrapper>
    )
    expect(document.querySelector('[class*="tiCallToActionWrapper"]')).not.toBeNull()
    expect(queryByText(document.body, 'Support for Python coming soon!')).not.toBeNull()
    expect(queryByText(document.body, 'common.findOutMore')).not.toBeNull()
    expect(queryByText(document.body, 'common.feature.upgradeRequired.title')).toBeNull()
  })

  test('should render ungrouped Reports UI ', async () => {
    jest.spyOn(tiService, 'useReportsInfo').mockReturnValue({ data: InfoMock, refetch: jest.fn() } as any)
    jest.spyOn(tiService, 'useTestInfo').mockReturnValue({ data: InfoMock, refetch: jest.fn() } as any)
    jest.spyOn(tiService, 'useReportSummary').mockReturnValue({ data: ReportsSummaryMock, refetch: jest.fn() } as any)
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
      >
        <BuildTests />
      </TestWrapper>
    )

    const chevronDownButton = container.querySelector('[data-testid="expanded"] [data-icon="chevron-down"]')

    if (!chevronDownButton) {
      throw Error('Cannot find chevron down button')
    }
    expect(document.querySelector('[class*="sortBySelect"]')).not.toBeNull()
    expect(document.querySelector('[data-testid="activeGroupedIcon"] [data-icon="list-view"]')).toBeNull()

    const ungroupedButton = container.querySelector('[data-icon="list-view"]')
    if (!ungroupedButton) {
      throw Error('Cannot find ungrouped button')
    }
    userEvent.click(ungroupedButton)
    await waitFor(() => expect(() => container.querySelector('data-icon="spinner"')).not.toBeNull())
    await waitFor(() =>
      expect(() => document.querySelector('[data-testid="activeGroupedIcon"] [data-icon="list-view"]')).not.toBeNull()
    )
    await waitFor(() =>
      expect(() =>
        queryByText(document.body, 'testShouldCollectData_logsMoreThan60MinSinceLastCollectionWithinBuffer')
      ).not.toBeNull()
    )
    expect(document.querySelector('[class*="sortBySelect"]')).toBeNull()
  })

  test('should render ungrouped Reports UI with test case search term', async () => {
    const refetch = jest.fn()

    jest.spyOn(tiService, 'useReportsInfo').mockReturnValue({ data: InfoMock, refetch: jest.fn() } as any)
    jest.spyOn(tiService, 'useTestInfo').mockReturnValue({ data: InfoMock, refetch: jest.fn() } as any)
    jest.spyOn(tiService, 'useReportSummary').mockReturnValue({ data: ReportsSummaryMock, refetch: jest.fn() } as any)
    jest.spyOn(tiService, 'useTestOverview').mockReturnValue({ data: TotalTestsZeroMock, refetch: jest.fn() } as any)
    jest.spyOn(tiService, 'useTestSuiteSummary').mockReturnValue({ data: TestSuiteMock, refetch } as any)
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
      >
        <BuildTests />
      </TestWrapper>
    )

    const chevronDownButton = container.querySelector('[data-testid="expanded"] [data-icon="chevron-down"]')

    if (!chevronDownButton) {
      throw Error('Cannot find chevron down button')
    }
    expect(document.querySelector('[class*="sortBySelect"]')).not.toBeNull()
    expect(document.querySelector('[data-testid="activeGroupedIcon"] [data-icon="list-view"]')).toBeNull()

    const ungroupedButton = container.querySelector('[data-icon="list-view"]')
    if (!ungroupedButton) {
      throw Error('Cannot find ungrouped button')
    }
    userEvent.click(ungroupedButton)
    await waitFor(() => expect(() => container.querySelector('data-icon="spinner"')).not.toBeNull())
    await waitFor(() =>
      expect(() => document.querySelector('[data-testid="activeGroupedIcon"] [data-icon="list-view"]')).not.toBeNull()
    )
    await waitFor(() =>
      expect(() =>
        queryByText(document.body, 'testShouldCollectData_logsMoreThan60MinSinceLastCollectionWithinBuffer')
      ).not.toBeNull()
    )

    const formEl = screen.getByPlaceholderText('pipeline.testsReports.searchByTestName') as Element

    userEvent.type(formEl, 'testShould')
    const searchButton = container.querySelector('[data-testid="search-btn"]')
    if (!searchButton) {
      throw Error('Cannot find search button')
    }
    userEvent.click(searchButton)
    await waitFor(() => expect(refetch).toHaveBeenCalled())
  })

  test('should render ungrouped Reports UI with caret down for ASC test name data ', async () => {
    jest.spyOn(tiService, 'useReportsInfo').mockReturnValue({ data: InfoMock, refetch: jest.fn() } as any)
    jest.spyOn(tiService, 'useTestInfo').mockReturnValue({ data: InfoMock, refetch: jest.fn() } as any)
    jest.spyOn(tiService, 'useReportSummary').mockReturnValue({ data: ReportsSummaryMock, refetch: jest.fn() } as any)
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
      >
        <BuildTests reportSummaryMock={ReportsSummaryMock as TestReportSummary} testOverviewMock={TotalTestsZeroMock} />
      </TestWrapper>
    )

    const chevronDownButton = container.querySelector('[data-testid="expanded"] [data-icon="chevron-down"]')

    if (!chevronDownButton) {
      throw Error('Cannot find chevron down button')
    }
    const ungroupedButton = container.querySelector('[data-icon="list-view"]')
    if (!ungroupedButton) {
      throw Error('Cannot find ungrouped button')
    }
    userEvent.click(ungroupedButton)
    await waitFor(() => expect(() => container.querySelector('data-icon="spinner"')).not.toBeNull())
    await waitFor(() =>
      expect(() =>
        queryByText(document.body, 'testShouldCollectData_logsMoreThan60MinSinceLastCollectionWithinBuffer')
      ).not.toBeNull()
    )
    const testNameColumnHeader = container.querySelectorAll('[class*="testSuiteTable"] [role="columnheader"]')?.[1]
    if (!testNameColumnHeader) {
      throw Error('Cannot find testNameColumnHeader button')
    }

    userEvent.click(testNameColumnHeader)

    await waitFor(() => expect(() => container.querySelector('data-icon="spinner"')).not.toBeNull())

    await waitFor(() =>
      expect(() => document.body.querySelector('[class*="testSuiteTable"] [data-icon="caret-down"]')).not.toBeNull()
    )
  })

  test('should render ZeroState UI', async () => {
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
      >
        <BuildTests reportSummaryMock={TotalTestsZeroMock as TestReportSummary} testOverviewMock={TotalTestsZeroMock} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('Call Graph preview should be renderred properly', async () => {
    jest.spyOn(tiService, 'useReportsInfo').mockReturnValue({ data: InfoMock, refetch: jest.fn() } as any)
    jest.spyOn(tiService, 'useTestInfo').mockReturnValue({ data: InfoMock, refetch: jest.fn() } as any)
    jest.spyOn(tiService, 'useReportSummary').mockReturnValue({ data: ReportsSummaryMock, refetch: jest.fn() } as any)
    jest.spyOn(tiService, 'useTestOverview').mockReturnValue({ data: OverviewMock, refetch: jest.fn() } as any)
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
      <TestsCallgraph
        preview
        selectedClass="io.harness.jhttp.functional.HttpClientTest"
        graph={CallGraphMock}
        onNodeClick={jest.fn()}
      />
    )
    expect(container).toMatchSnapshot()
  })

  test('Call Graph full view should be renderred properly', async () => {
    jest.spyOn(tiService, 'useReportsInfo').mockReturnValue({ data: InfoMock, refetch: jest.fn() } as any)
    jest.spyOn(tiService, 'useTestInfo').mockReturnValue({ data: InfoMock, refetch: jest.fn() } as any)
    jest.spyOn(tiService, 'useReportSummary').mockReturnValue({ data: ReportsSummaryMock, refetch: jest.fn() } as any)
    jest.spyOn(tiService, 'useTestOverview').mockReturnValue({ data: OverviewMock, refetch: jest.fn() } as any)
    jest.spyOn(tiService, 'useTestSuiteSummary').mockReturnValue({ data: TestSuiteMock, refetch: jest.fn() } as any)
    jest.spyOn(tiService, 'useTestCaseSummary').mockReturnValue({ data: TestCaseMock, refetch: jest.fn() } as any)
    jest.spyOn(tiService, 'useVgSearch').mockReturnValue({ data: CallGraphMock, refetch: jest.fn() } as any)
    jest.spyOn(tiService, 'useGetToken').mockReturnValue({ data: 'some-token', refetch: jest.fn() } as any)
    const { container } = render(
      <TestsCallgraph
        selectedClass="io.harness.jhttp.functional.HttpClientTest"
        graph={CallGraphMock}
        onNodeClick={jest.fn()}
      />
    )
    expect(container).toMatchSnapshot()
  })

  test('Call Graph full view should handle search properly', async () => {
    jest.spyOn(tiService, 'useReportsInfo').mockReturnValue({ data: InfoMock, refetch: jest.fn() } as any)
    jest.spyOn(tiService, 'useTestInfo').mockReturnValue({ data: InfoMock, refetch: jest.fn() } as any)
    jest.spyOn(tiService, 'useReportSummary').mockReturnValue({ data: ReportsSummaryMock, refetch: jest.fn() } as any)
    jest.spyOn(tiService, 'useTestOverview').mockReturnValue({ data: OverviewMock, refetch: jest.fn() } as any)
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
      <TestsCallgraph
        selectedClass="io.harness.jhttp.functional.HttpClientTest"
        graph={CallGraphMock}
        onNodeClick={jest.fn()}
        searchTerm="testStaticFile"
      />
    )
    expect(container).toMatchSnapshot()
  })
})
