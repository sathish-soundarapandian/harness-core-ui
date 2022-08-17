/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, render, waitFor, act, screen } from '@testing-library/react'
import { Connectors } from '@connectors/constants'
import { TestWrapper, TestWrapperProps } from '@common/utils/testUtils'
import { SetupSourceTabs } from '@cv/components/CVSetupSourcesView/SetupSourceTabs/SetupSourceTabs'
import routes from '@common/RouteDefinitions'
import * as cvServices from 'services/cv'
import * as useFeatureFlagMock from '@common/hooks/useFeatureFlag'
import { accountPathProps, projectPathProps } from '@common/utils/routeUtils'
import NewRelicHealthSourceContainer from '../NewRelicHealthSourceContainer'
import NewRelicHealthSource from '../NewRelicHealthSource'
import {
  metricPack,
  applicationData,
  sourceData,
  validationData,
  onPreviousPayload,
  onSubmitPayload,
  healthSourcePayload,
  NewRelicInputFormData,
  mockedFormDataCreate
} from './NewRelic.mock'
import { createNewRelicFormData } from '../NewRelicHealthSource.utils'
import { newRelicDefaultMetricName } from '../NewRelicHealthSource.constants'

const createModeProps: TestWrapperProps = {
  path: routes.toCVAddMonitoringServicesSetup({ ...accountPathProps, ...projectPathProps }),
  pathParams: {
    accountId: '1234_accountId',
    projectIdentifier: '1234_project',
    orgIdentifier: '1234_org'
  }
}

jest.mock('@common/hooks/useFeatureFlag')

const onNextMock = jest.fn().mockResolvedValue(jest.fn())
const onPrevious = jest.fn().mockResolvedValue(jest.fn())
const refetchMock = jest.fn()

jest.mock('@cv/hooks/IndexedDBHook/IndexedDBHook', () => ({
  useIndexedDBHook: jest.fn().mockReturnValue({
    isInitializingDB: false,
    dbInstance: {
      put: jest.fn(),
      get: jest.fn().mockReturnValue(undefined)
    }
  }),
  CVObjectStoreNames: {}
}))

jest.mock('@cv/components/CVSetupSourcesView/SetupSourceTabs/SetupSourceTabs', () => ({
  ...(jest.requireActual('@cv/components/CVSetupSourcesView/SetupSourceTabs/SetupSourceTabs') as any),
  get SetupSourceTabsContext() {
    return React.createContext({
      tabsInfo: [],
      sourceData: { sourceType: Connectors.NEW_RELIC },
      onNext: onNextMock,
      onPrevious: onPrevious
    })
  }
}))

describe('Unit tests for NewRelic health source', () => {
  beforeAll(() => {
    jest.spyOn(useFeatureFlagMock, 'useFeatureFlag').mockReturnValue(true)
    jest
      .spyOn(cvServices, 'useGetNewRelicApplications')
      .mockImplementation(() => ({ loading: false, error: null, data: applicationData, refetch: refetchMock } as any))
    jest
      .spyOn(cvServices, 'useGetMetricPacks')
      .mockImplementation(() => ({ loading: false, error: null, data: metricPack, refetch: refetchMock } as any))
    jest
      .spyOn(cvServices, 'getNewRelicMetricDataPromise')
      .mockImplementation(() => ({ error: null, data: validationData.data } as any))
  })

  test('Test NewRelic healthSource container loads', async () => {
    const submitData = jest.fn()
    const { container, getByText } = render(
      <TestWrapper {...createModeProps}>
        <SetupSourceTabs data={{}} tabTitles={['Tab1']} determineMaxTab={() => 1}>
          <NewRelicHealthSourceContainer data={sourceData} onSubmit={submitData} />
        </SetupSourceTabs>
      </TestWrapper>
    )
    await waitFor(() => expect(getByText('submit')).not.toBeNull())
    fireEvent.click(getByText('previous'))
    await waitFor(() => expect(onPrevious).toHaveBeenCalledWith(expect.objectContaining(onPreviousPayload)))

    fireEvent.click(getByText('submit'))
    await waitFor(() => expect(submitData).toHaveBeenCalledWith(onSubmitPayload, healthSourcePayload))

    expect(container).toMatchSnapshot()
  })

  test('Validate metric packs', async () => {
    const submitData = jest.fn()
    const { container, getByText } = render(
      <TestWrapper {...createModeProps}>
        <SetupSourceTabs data={{}} tabTitles={['Tab1']} determineMaxTab={() => 1}>
          <NewRelicHealthSource data={NewRelicInputFormData} onSubmit={submitData} onPrevious={jest.fn()} />
        </SetupSourceTabs>
      </TestWrapper>
    )

    // default all metrics are selected
    container.querySelectorAll('[type="checkbox"]').forEach(metricCheckbox => {
      expect(metricCheckbox).toBeChecked()
    })
    const performanceCheckbox = container.querySelector('input[name="metricData.Performance"]')
    await waitFor(() => expect(performanceCheckbox).toBeChecked())
    act(() => {
      fireEvent.click(performanceCheckbox!)
    })
    await act(() => {
      fireEvent.click(getByText('submit'))
    })
    // metric pack error is visible
    await waitFor(() => expect(getByText('cv.monitoringSources.appD.validations.selectMetricPack')).toBeTruthy())
  })

  test('Validation in create mode', async () => {
    const submitData = jest.fn()
    const { container, getByText } = render(
      <TestWrapper {...createModeProps}>
        <SetupSourceTabs data={{}} tabTitles={['Tab1']} determineMaxTab={() => 1}>
          <NewRelicHealthSourceContainer data={{}} onSubmit={submitData} />
        </SetupSourceTabs>
      </TestWrapper>
    )
    await waitFor(() => expect(getByText('submit')).not.toBeNull())
    const performanceCheckbox = container.querySelector('input[name="metricData.Performance"]')
    expect(performanceCheckbox).toBeChecked()
    act(() => {
      fireEvent.click(performanceCheckbox!)
    })

    act(() => {
      fireEvent.click(getByText('submit'))
    })
    await waitFor(() => expect(getByText('cv.healthSource.connectors.NewRelic.validations.application')).toBeTruthy())
    expect(container).toMatchSnapshot()
  })

  test('createNewRelicFormData utils method', () => {
    const nonCustomFeilds = {
      newRelicApplication: {
        label: '',
        value: ''
      },
      metricPacks: [],
      metricData: {}
    }
    expect(
      createNewRelicFormData(NewRelicInputFormData as any, new Map(), newRelicDefaultMetricName, nonCustomFeilds, false)
    ).toEqual(mockedFormDataCreate)
  })

  test('Should render form for custom metrics when Add metric link is clicked', async () => {
    const submitData = jest.fn()
    const { getByText } = render(
      <TestWrapper {...createModeProps}>
        <SetupSourceTabs data={{}} tabTitles={['Tab1']} determineMaxTab={() => 1}>
          <NewRelicHealthSourceContainer data={{}} onSubmit={submitData} />
        </SetupSourceTabs>
      </TestWrapper>
    )
    await waitFor(() => expect(getByText('cv.monitoringSources.addMetric')).not.toBeNull())
    fireEvent.click(getByText('cv.monitoringSources.addMetric'))
    await waitFor(() =>
      expect(getByText('cv.monitoringSources.prometheus.querySpecificationsAndMappings')).toBeTruthy()
    )
  })

  describe('Metric thresholds', () => {
    beforeEach(() => {
      jest.mock('@cv/components/CVSetupSourcesView/SetupSourceTabs/SetupSourceTabs', () => ({
        ...(jest.requireActual('@cv/components/CVSetupSourcesView/SetupSourceTabs/SetupSourceTabs') as any),
        get SetupSourceTabsContext() {
          return React.createContext({
            tabsInfo: [],
            sourceData: { sourceType: Connectors.NEW_RELIC },
            onNext: onNextMock,
            onPrevious: onPrevious
          })
        }
      }))
    })
    test('should render metric thresholds', async () => {
      const submitData = jest.fn()
      const { container } = render(
        <TestWrapper {...createModeProps}>
          <SetupSourceTabs data={{}} tabTitles={['Tab1']} determineMaxTab={() => 1}>
            <NewRelicHealthSourceContainer data={sourceData} onSubmit={submitData} />
          </SetupSourceTabs>
        </TestWrapper>
      )

      expect(screen.getByText('cv.monitoringSources.appD.ignoreThresholds (0)')).toBeInTheDocument()
      expect(screen.getByText('cv.monitoringSources.appD.failFastThresholds (0)')).toBeInTheDocument()

      expect(container.querySelector("input[name='metricData.Performance']")).toBeChecked()

      const addButton = screen.getByTestId('AddThresholdButton')

      expect(addButton).toBeInTheDocument()

      fireEvent.click(addButton)

      expect(screen.getByText('cv.monitoringSources.appD.ignoreThresholds (1)')).toBeInTheDocument()
    })

    test('should not render metric thresholds when feature flag is disabled', () => {
      jest.spyOn(useFeatureFlagMock, 'useFeatureFlag').mockReturnValue(false)

      const submitData = jest.fn()
      render(
        <TestWrapper {...createModeProps}>
          <SetupSourceTabs data={{}} tabTitles={['Tab1']} determineMaxTab={() => 1}>
            <NewRelicHealthSourceContainer data={sourceData} onSubmit={submitData} />
          </SetupSourceTabs>
        </TestWrapper>
      )

      expect(screen.queryByText('cv.monitoringSources.appD.ignoreThresholds (0)')).not.toBeInTheDocument()
      expect(screen.queryByText('cv.monitoringSources.appD.failFastThresholds (0)')).not.toBeInTheDocument()
    })
  })
})
