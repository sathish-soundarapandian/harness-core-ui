/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor, screen, fireEvent, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestWrapper, TestWrapperProps } from '@common/utils/testUtils'
import * as cvService from 'services/cv'
import { LogAnalysisRow } from '../LogAnalysisRow'
import {
  logFeedbackHistoryPathParams,
  mockedLogAnalysisData,
  mockedLogAnalysisDataWithFeedback,
  mockLogsCall,
  mockServicePageLogsCall,
  saveFeedbackExpectedPayload,
  updateFeedbackExpectedPayload
} from './LogAnalysisRow.mocks'
import type { LogAnalysisRowProps } from '../LogAnalysisRow.types'
import type { LogAnalysisRowData } from '../../../LogAnalysis.types'
import * as utils from '../LogAnalysisRow.utils'

interface FeatureFlagType {
  featureFlagValues?: TestWrapperProps['defaultFeatureFlagValues']
}

const WrapperComponent = (props: LogAnalysisRowProps & FeatureFlagType): JSX.Element => {
  return (
    <TestWrapper
      path="account/:accountId/cd/orgs/:orgIdentifier/projects/:projectIdentifier/pipeline/executions/:executionId/pipeline"
      pathParams={{
        accountId: '1234_accountId',
        projectIdentifier: '1234_project',
        orgIdentifier: '1234_ORG',
        executionId: 'Test_execution'
      }}
      defaultFeatureFlagValues={props.featureFlagValues}
    >
      <LogAnalysisRow {...props} />
    </TestWrapper>
  )
}

const fetchLogsAnalysisData = jest.fn()
const fetchLogsAnalysisDataForServicePage = jest.fn()

jest.spyOn(cvService, 'useGetVerifyStepDeploymentLogAnalysisRadarChartResult').mockReturnValue({
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  data: mockLogsCall,
  refetch: fetchLogsAnalysisData
})

jest.spyOn(cvService, 'useGetAllRadarChartLogsData').mockReturnValue({
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  data: mockServicePageLogsCall,
  refetch: fetchLogsAnalysisDataForServicePage
})

describe('Unit tests for LogAnalysisRow', () => {
  const initialProps = {
    data: mockedLogAnalysisData.resource.content as LogAnalysisRowData[],
    goToPage: jest.fn()
  }

  test('Verify if Logs Record Table is rendered correctly', async () => {
    render(<WrapperComponent {...initialProps} />)
    // Verify if number of records returned by the api for the first page matches with the number of records shown in the Logs Table
    await waitFor(() =>
      expect(screen.getAllByTestId('logs-data-row')).toHaveLength(mockedLogAnalysisData.resource.content.length)
    )
  })

  test('Verify if clicking on the row opens the slider with complete details', () => {
    render(<WrapperComponent {...initialProps} />)
    const firstRow = screen.getAllByTestId('logs-data-row')[0]

    expect(screen.queryByTestId('LogAnalysis_detailsDrawer')).not.toBeInTheDocument()

    fireEvent.click(firstRow)

    expect(screen.getByTestId('LogAnalysis_detailsDrawer')).toBeInTheDocument()

    expect(screen.getAllByText('pipeline.verification.logs.eventType')).toHaveLength(2)
    expect(screen.getByText('cv.sampleMessage')).toBeInTheDocument()
  })

  test('Verify if clicking on an error row that it calls onClickErrorTrackingRow', async () => {
    const clickErrorTrackingSpy = jest.spyOn(utils, 'onClickErrorTrackingRow').mockReturnValue()

    render(<WrapperComponent isErrorTracking={true} {...initialProps} />)

    const firstRowError = screen.getAllByTestId('logs-data-row')[0]
    await waitFor(() => {
      fireEvent.click(firstRowError.childNodes[0].childNodes[0])
    })
    expect(clickErrorTrackingSpy).toHaveBeenCalled()
  })

  test('should open the drawer if correct selectedLog is passed as props', () => {
    const resetSelectedLog = jest.fn()
    const { rerender } = render(
      <TestWrapper>
        <LogAnalysisRow {...initialProps} resetSelectedLog={resetSelectedLog} />
      </TestWrapper>
    )

    expect(screen.queryByTestId('LogAnalysis_detailsDrawer')).not.toBeInTheDocument()

    rerender(
      <TestWrapper>
        <LogAnalysisRow {...initialProps} selectedLog="abc" resetSelectedLog={resetSelectedLog} />
      </TestWrapper>
    )

    expect(fetchLogsAnalysisData).not.toHaveBeenCalled()

    expect(screen.queryByTestId('LogAnalysis_detailsDrawer')).toBeInTheDocument()

    fireEvent.click(screen.getByTestId('DrawerClose_button'))

    expect(resetSelectedLog).toHaveBeenCalled()
    expect(screen.queryByTestId('LogAnalysis_detailsDrawer')).not.toBeInTheDocument()
  })

  test('should make API call to fetch logs data if the data is not already present', () => {
    const resetSelectedLog = jest.fn()

    render(<WrapperComponent {...initialProps} selectedLog="def" resetSelectedLog={resetSelectedLog} />)

    expect(fetchLogsAnalysisData).toHaveBeenCalledWith({
      queryParams: { accountId: '1234_accountId', clusterId: 'def' }
    })
    expect(screen.queryByTestId('LogAnalysis_detailsDrawer')).toBeInTheDocument()
  })

  test('should make service page API call to fetch logs data if the data is not already present', () => {
    const resetSelectedLog = jest.fn()

    const props = {
      ...initialProps,
      startTime: 33,
      endTime: 6786,
      monitoredServiceIdentifier: 'sdfs',
      isServicePage: true,
      selectedLog: 'tyu',
      resetSelectedLog
    }

    render(<WrapperComponent {...props} />)

    expect(fetchLogsAnalysisDataForServicePage).toHaveBeenCalledWith({
      queryParams: {
        accountId: '1234_accountId',
        clusterId: 'tyu',
        endTime: 6786,
        monitoredServiceIdentifier: 'sdfs',
        startTime: 33,
        orgIdentifier: '1234_ORG',
        projectIdentifier: '1234_project'
      }
    })

    expect(screen.queryByTestId('LogAnalysis_detailsDrawer')).toBeInTheDocument()
  })

  describe('Log feedback', () => {
    test('should not render update event preference button, if the feature flag is disabled', () => {
      const { container } = render(<WrapperComponent {...initialProps} />)

      const contextMenuOptionButton = container.querySelector('[data-icon="Options"]:first-child') as HTMLElement

      act(() => {
        userEvent.click(contextMenuOptionButton)
      })

      const viewDetailsButton = screen.getByText('cv.logs.viewEventDetails')

      const updateEventPreferenceButton = screen.queryByText('pipeline.verification.logs.updateEventPreference')

      expect(viewDetailsButton).toBeInTheDocument()
      expect(updateEventPreferenceButton).not.toBeInTheDocument()

      act(() => {
        userEvent.click(viewDetailsButton)
      })

      expect(screen.getByTestId('LogAnalysis_detailsDrawer')).toBeInTheDocument()
      const updateEventPreferenceButtonInDrawer = screen.queryByText('pipeline.verification.logs.updateEventPreference')

      expect(updateEventPreferenceButtonInDrawer).not.toBeInTheDocument()
    })

    test('should render update event preference button, if the feature flag is enabled', async () => {
      const saveFeedbackMutateSpy = jest.fn()
      jest.spyOn(cvService, 'useSaveLogFeedback').mockReturnValue({
        mutate: saveFeedbackMutateSpy,
        cancel: jest.fn(),
        error: null,
        loading: false
      })

      const propsWithFeatureFlag = {
        ...initialProps,
        activityId: 'activityIdTest',
        featureFlagValues: { SRM_LOG_FEEDBACK_ENABLE_UI: true }
      }
      const { container } = render(<WrapperComponent {...propsWithFeatureFlag} />)

      const contextMenuOptionButton = container.querySelector('[data-icon="Options"]:first-child') as HTMLElement

      act(() => {
        userEvent.click(contextMenuOptionButton)
      })

      const viewDetailsButton = screen.getByText('cv.logs.viewEventDetails')
      const updateEventPreferenceButton = screen.getByText('pipeline.verification.logs.updateEventPreference')

      expect(viewDetailsButton).toBeInTheDocument()
      expect(updateEventPreferenceButton).toBeInTheDocument()

      act(() => {
        userEvent.click(viewDetailsButton)
      })

      expect(screen.getByTestId('LogAnalysis_detailsDrawer')).toBeInTheDocument()
      const updateEventPreferenceButtonInDrawer = screen.getByTestId('updateEventPreferenceButton-Drawer')

      expect(updateEventPreferenceButtonInDrawer).toBeInTheDocument()

      act(() => {
        userEvent.click(updateEventPreferenceButtonInDrawer)
      })

      const eventPreferenceDrawer = screen.getByTestId('updateEventPreferenceDrawer')

      expect(eventPreferenceDrawer).toBeInTheDocument()

      expect(saveFeedbackMutateSpy).not.toHaveBeenCalled()

      const eventPriorityDropdown = screen.getByPlaceholderText('- Select -')

      act(() => {
        userEvent.click(eventPriorityDropdown)
      })

      expect(screen.getByText('cv.logs.eventPriorityValues.notARiskIgnore')).toBeInTheDocument()
      expect(screen.getByText('cv.logs.eventPriorityValues.notARiskConsider')).toBeInTheDocument()
      expect(screen.getByText('cv.logs.eventPriorityValues.mediumRisk')).toBeInTheDocument()
      expect(screen.getByText('cv.logs.eventPriorityValues.highRisk')).toBeInTheDocument()
      expect(screen.getByText('cv.logs.eventPriorityValues.default')).toBeInTheDocument()

      act(() => {
        userEvent.click(screen.getByText('cv.logs.eventPriorityValues.notARiskIgnore'))
      })

      const reasonTextarea = screen.getByPlaceholderText('cv.logs.reasonPlaceholder')

      act(() => {
        userEvent.type(reasonTextarea, 'This is not a risk')
      })

      const eventPreferenceSubmitButton = screen.getByTestId('updatePreferenceDrawerSubmit_button')

      expect(eventPreferenceSubmitButton).toBeInTheDocument()

      act(() => {
        userEvent.click(eventPreferenceSubmitButton)
      })

      await waitFor(() => {
        expect(saveFeedbackMutateSpy).toHaveBeenCalledWith(saveFeedbackExpectedPayload)
      })
    })

    test('should render the feedback values correctly for edit scenario', async () => {
      const updateFeedbackMutateSpy = jest.fn()
      const feedbackHistorySpy = jest.fn()

      jest.spyOn(cvService, 'useUpdateLogFeedback').mockReturnValue({
        mutate: updateFeedbackMutateSpy,
        cancel: jest.fn(),
        error: null,
        loading: false
      })

      jest.spyOn(cvService, 'useGetFeedbackHistory').mockReturnValue({
        refetch: feedbackHistorySpy,
        cancel: jest.fn(),
        error: null,
        loading: false,
        data: {
          resource: [
            {
              updatedBy: 'pranesh.g@harness.io',
              logFeedback: {
                feedbackScore: 'NO_RISK_CONSIDER_FREQUENCY',
                description: 'It is not an issue',
                updatedAt: 1677414840933
              }
            }
          ]
        },
        absolutePath: '',
        response: null
      })

      const initialPropsWithFeedback = {
        data: mockedLogAnalysisDataWithFeedback.resource.content as LogAnalysisRowData[],
        goToPage: jest.fn()
      }

      const propsWithFeatureFlag = {
        ...initialPropsWithFeedback,
        activityId: 'updateActivityIdTest',
        featureFlagValues: { SRM_LOG_FEEDBACK_ENABLE_UI: true }
      }
      const { container } = render(<WrapperComponent {...propsWithFeatureFlag} />)

      const contextMenuOptionButton = container.querySelector('[data-icon="Options"]:first-child') as HTMLElement

      act(() => {
        userEvent.click(contextMenuOptionButton)
      })

      const viewDetailsButton = screen.getByText('cv.logs.viewEventDetails')
      const updateEventPreferenceButton = screen.getByText('pipeline.verification.logs.updateEventPreference')

      expect(viewDetailsButton).toBeInTheDocument()
      expect(updateEventPreferenceButton).toBeInTheDocument()

      act(() => {
        userEvent.click(viewDetailsButton)
      })

      expect(screen.getByTestId('LogAnalysis_detailsDrawer')).toBeInTheDocument()
      const updateEventPreferenceButtonInDrawer = screen.getByTestId('updateEventPreferenceButton-Drawer')

      const updatedFeedbackEl = screen.getByTestId('updatedFeedbackDisplay')
      const appliedFeedbackEl = screen.getByTestId('appliedFeedbackDisplay')

      expect(updatedFeedbackEl).toBeInTheDocument()
      expect(appliedFeedbackEl).toBeInTheDocument()

      expect(updateEventPreferenceButtonInDrawer).toBeInTheDocument()

      act(() => {
        userEvent.click(updateEventPreferenceButtonInDrawer)
      })

      await waitFor(() => {
        expect(feedbackHistorySpy).toHaveBeenCalledWith(logFeedbackHistoryPathParams)
      })

      const eventPreferenceDrawer = screen.getByTestId('updateEventPreferenceDrawer')

      expect(eventPreferenceDrawer).toBeInTheDocument()

      expect(updateFeedbackMutateSpy).not.toHaveBeenCalled()

      const feedbackHistory = screen.getByTestId('feedbackHistory-summary')

      await waitFor(() => {
        expect(screen.getByTestId('feedbackHistory-summary')).toBeInTheDocument()
      })

      act(() => {
        userEvent.click(feedbackHistory)
      })

      screen.debug(document, 90000)

      await waitFor(() => {
        expect(screen.getByText('It is not an issue')).toBeInTheDocument()
        expect(screen.getByText('pranesh.g@harness.io common.on 02/26/2023 12:34 PM')).toBeInTheDocument()
      })

      const eventPriorityDropdown = screen.getByPlaceholderText('- Select -')

      expect(eventPriorityDropdown).toHaveValue('cv.logs.eventPriorityValues.mediumRisk')

      act(() => {
        userEvent.click(eventPriorityDropdown)
      })

      expect(screen.getByText('cv.logs.eventPriorityValues.notARiskIgnore')).toBeInTheDocument()
      expect(screen.getAllByText('cv.logs.eventPriorityValues.notARiskConsider')).toHaveLength(2)
      expect(screen.getAllByText('cv.logs.eventPriorityValues.mediumRisk')).toHaveLength(2)
      expect(screen.getAllByText('cv.logs.eventPriorityValues.highRisk')).toHaveLength(2)
      expect(screen.getByText('cv.logs.eventPriorityValues.default')).toBeInTheDocument()

      act(() => {
        userEvent.click(screen.getByText('cv.logs.eventPriorityValues.notARiskIgnore'))
      })

      const reasonTextarea = screen.getByPlaceholderText('cv.logs.reasonPlaceholder')

      expect(reasonTextarea).toHaveValue('Some reason')

      act(() => {
        userEvent.clear(reasonTextarea)
        userEvent.type(reasonTextarea, 'This is not a risk')
      })

      const eventPreferenceSubmitButton = screen.getByTestId('updatePreferenceDrawerSubmit_button')

      expect(eventPreferenceSubmitButton).toBeInTheDocument()

      act(() => {
        userEvent.click(eventPreferenceSubmitButton)
      })

      await waitFor(() => {
        expect(updateFeedbackMutateSpy).toHaveBeenCalledWith(updateFeedbackExpectedPayload)
      })
    })
  })
})
