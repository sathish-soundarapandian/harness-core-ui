/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import * as uuid from 'uuid'
import { fireEvent, render, waitFor, act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { fillAtForm, InputTypes, setFieldValue } from '@common/utils/JestFormHelper'
import { Connectors } from '@connectors/constants'
import * as useFeatureFlagMock from '@common/hooks/useFeatureFlag'
import { TestWrapper, TestWrapperProps } from '@common/utils/testUtils'
import { SetupSourceTabs } from '@cv/components/CVSetupSourcesView/SetupSourceTabs/SetupSourceTabs'
import routes from '@common/RouteDefinitions'
import * as cvServices from 'services/cv'
import { accountPathProps, projectPathProps } from '@common/utils/routeUtils'
import AppDHealthSourceContainer from '../AppDHealthSourceContainer'
import {
  sourceData,
  appTier,
  applicationName,
  metricPack,
  validationData,
  onPreviousPayload,
  onSubmitPayload,
  appDynamicsDataFull
} from './AppDMonitoredSource.mock'
import AppDMonitoredSource from '../AppDHealthSource'

const createModeProps: TestWrapperProps = {
  path: routes.toCVAddMonitoringServicesSetup({ ...accountPathProps, ...projectPathProps }),
  pathParams: {
    accountId: '1234_accountId',
    projectIdentifier: '1234_project',
    orgIdentifier: '1234_org'
  }
}

jest.mock('uuid')
jest.mock('@common/hooks/useFeatureFlag')

const onNextMock = jest.fn().mockResolvedValue(jest.fn())
const onPrevious = jest.fn().mockResolvedValue(jest.fn())

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
      sourceData: { sourceType: Connectors.APP_DYNAMICS },
      onNext: onNextMock,
      onPrevious: onPrevious
    })
  }
}))

describe('Unit tests for createAppd monitoring source', () => {
  const refetchMock = jest.fn()

  beforeAll(() => {
    beforeEach(() => jest.spyOn(useFeatureFlagMock, 'useFeatureFlag').mockReturnValue(true))
    jest
      .spyOn(cvServices, 'useGetAppDynamicsTiers')
      .mockImplementation(() => ({ loading: false, error: null, data: appTier, refetch: refetchMock } as any))
    jest
      .spyOn(cvServices, 'useGetAppDynamicsApplications')
      .mockImplementation(() => ({ loading: false, error: null, data: applicationName, refetch: refetchMock } as any))
    jest
      .spyOn(cvServices, 'useGetMetricPacks')
      .mockImplementation(() => ({ loading: false, error: null, data: metricPack, refetch: refetchMock } as any))
    jest
      .spyOn(cvServices, 'useGetAppdynamicsMetricStructure')
      .mockImplementation(
        () => ({ loading: false, error: null, data: [{ name: 'cvng', type: 'leaf' }], refetch: refetchMock } as any)
      )
    jest
      .spyOn(cvServices, 'useGetAppdynamicsBaseFolders')
      .mockImplementation(
        () => ({ loading: false, error: null, data: { data: ['overall performane'] }, refetch: refetchMock } as any)
      )
    jest
      .spyOn(cvServices, 'useGetServiceInstanceMetricPath')
      .mockImplementation(() => ({ loading: false, error: null, data: {}, refetch: refetchMock } as any))
    jest
      .spyOn(cvServices, 'useGetAppdynamicsMetricDataByPath')
      .mockImplementation(() => ({ loading: false, error: null, data: {}, refetch: refetchMock } as any))
    jest
      .spyOn(cvServices, 'getAppDynamicsMetricDataPromise')
      .mockImplementation(() => ({ error: null, data: validationData.data } as any))
  })

  // Skipped as it is not checking the checkbox correctly, will be checked by Deepesh soon
  // eslint-disable-next-line jest/no-disabled-tests
  test.skip('Component renders in edit mode', async () => {
    jest.spyOn(uuid, 'v4').mockReturnValue('MockedUUID')
    const submitData = jest.fn()
    const { container, getByText } = render(
      <TestWrapper {...createModeProps}>
        <SetupSourceTabs data={{}} tabTitles={['Tab1']} determineMaxTab={() => 1}>
          <AppDHealthSourceContainer data={sourceData} onSubmit={submitData} />
        </SetupSourceTabs>
      </TestWrapper>
    )
    await waitFor(() => expect(getByText('submit')).not.toBeNull())
    fireEvent.click(getByText('previous'))
    await waitFor(() => expect(onPrevious).toHaveBeenCalledWith(expect.objectContaining(onPreviousPayload)))

    act(() => {
      fireEvent.click(container.querySelector('div[data-testid="riskProfile-summary"]')!)
    })

    await fillAtForm([
      { container, type: InputTypes.CHECKBOX, fieldId: 'continuousVerification', value: 'continuousVerification' }
    ])

    act(() => {
      fireEvent.click(getByText('cv.monitoringSources.lowerCounts'))
    })

    act(() => {
      fireEvent.click(getByText('submit'))
    })

    await waitFor(() => expect(submitData).toHaveBeenCalledWith(expect.anything(), onSubmitPayload))
  })

  // eslint-disable-next-line jest/no-disabled-tests
  test.skip('Validate metric packs', async () => {
    const submitData = jest.fn()
    const { container, getByText } = render(
      <TestWrapper {...createModeProps}>
        <SetupSourceTabs data={{}} tabTitles={['Tab1']} determineMaxTab={() => 1}>
          <AppDMonitoredSource data={{} as any} onSubmit={submitData} onPrevious={jest.fn()} />
        </SetupSourceTabs>
      </TestWrapper>
    )

    // default all metrics are selected
    container.querySelectorAll('[type="checkbox"]').forEach(async metricCheckbox => {
      await waitFor(() => expect(metricCheckbox).toBeChecked())
    })

    await waitFor(() => expect(getByText('Errors')).toBeTruthy())

    // uncheck all metric pack
    container.querySelectorAll('[type="checkbox"]').forEach(async metricCheckbox => {
      await act(() => {
        fireEvent.click(metricCheckbox)
      })
    })

    await act(() => {
      fireEvent.click(getByText('submit'))
    })
    // metric pack error is visible
    await waitFor(() => expect(getByText('cv.monitoringSources.appD.validations.selectMetricPack')).toBeTruthy())
  })

  test('Validation in create mode', async () => {
    const submitData = jest.fn()
    const { getByText, container } = render(
      <TestWrapper {...createModeProps}>
        <SetupSourceTabs data={{}} tabTitles={['Tab1']} determineMaxTab={() => 1}>
          <AppDHealthSourceContainer data={{}} onSubmit={submitData} />
        </SetupSourceTabs>
      </TestWrapper>
    )
    await waitFor(() => expect(getByText('submit')).not.toBeNull())
    expect(container.querySelector('input[name="appdApplication"]')).toBeInTheDocument()
    await act(() => {
      fireEvent.click(getByText('submit'))
    })

    await waitFor(() => expect(getByText('cv.healthSource.connectors.AppDynamics.validation.application')).toBeTruthy())
  })

  describe('Metric thresholds', () => {
    beforeEach(() => {
      jest.mock('@cv/components/CVSetupSourcesView/SetupSourceTabs/SetupSourceTabs', () => ({
        ...(jest.requireActual('@cv/components/CVSetupSourcesView/SetupSourceTabs/SetupSourceTabs') as any),
        get SetupSourceTabsContext() {
          return React.createContext({
            tabsInfo: [],
            sourceData: { sourceType: Connectors.APP_DYNAMICS },
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
            <AppDMonitoredSource data={appDynamicsDataFull} onSubmit={submitData} onPrevious={jest.fn()} />
          </SetupSourceTabs>
        </TestWrapper>
      )

      expect(screen.getByText('cv.monitoringSources.appD.ignoreThresholds (0)')).toBeInTheDocument()
      expect(screen.getByText('cv.monitoringSources.appD.failFastThresholds (0)')).toBeInTheDocument()

      expect(container.querySelector("input[name='metricData.Errors']")).toBeChecked()
      expect(container.querySelector("input[name='metricData.Performance']")).toBeChecked()

      const addButton = screen.getByTestId('AddThresholdButton')

      expect(addButton).toBeInTheDocument()

      fireEvent.click(addButton)

      expect(screen.getByText('cv.monitoringSources.appD.ignoreThresholds (1)')).toBeInTheDocument()
    })

    test('should render metric thresholds when there is a custom metric with CV enabled', async () => {
      const submitData = jest.fn()
      const { container } = render(
        <TestWrapper {...createModeProps}>
          <SetupSourceTabs data={{}} tabTitles={['Tab1']} determineMaxTab={() => 1}>
            <AppDMonitoredSource data={appDynamicsDataFull} onSubmit={submitData} onPrevious={jest.fn()} />
          </SetupSourceTabs>
        </TestWrapper>
      )

      expect(screen.getByText('cv.monitoringSources.appD.ignoreThresholds (0)')).toBeInTheDocument()
      expect(screen.getByText('cv.monitoringSources.appD.failFastThresholds (0)')).toBeInTheDocument()

      expect(container.querySelector("input[name='metricData.Errors']")).toBeChecked()
      expect(container.querySelector("input[name='metricData.Performance']")).toBeChecked()

      userEvent.click(container.querySelector("input[name='metricData.Errors']")!)
      userEvent.click(container.querySelector("input[name='metricData.Performance']")!)

      expect(container.querySelector("input[name='metricData.Errors']")).not.toBeChecked()
      expect(container.querySelector("input[name='metricData.Performance']")).not.toBeChecked()

      expect(screen.queryByText('cv.monitoringSources.appD.ignoreThresholds (0)')).not.toBeInTheDocument()
      expect(screen.queryByText('cv.monitoringSources.appD.failFastThresholds (0)')).not.toBeInTheDocument()

      await waitFor(() => expect(screen.getByText('cv.monitoringSources.addMetric')).not.toBeNull())
      userEvent.click(screen.getByText('cv.monitoringSources.addMetric'))

      await waitFor(() =>
        expect(screen.getByText('cv.monitoringSources.prometheus.querySpecificationsAndMappings')).toBeTruthy()
      )

      const icon = container.querySelector('[data-icon="chevron-down"]')
      if (!icon) {
        throw Error('Input was not rendered.')
      }

      // click on new option
      fireEvent.click(icon)
      await waitFor(() => expect(screen.getByText('cv.addNew')).not.toBeNull())
      fireEvent.click(screen.getByText('cv.addNew'))

      //expect modal to show and fill out new name
      await waitFor(() => expect(screen.getByText('cv.monitoringSources.appD.newGroupName')).not.toBeNull())
      await setFieldValue({
        container: document.body,
        type: InputTypes.TEXTFIELD,
        fieldId: 'name',
        value: 'G1'
      })

      fireEvent.click(screen.getAllByText('submit')[0])

      expect(screen.queryByText('cv.monitoringSources.appD.ignoreThresholds (0)')).not.toBeInTheDocument()
      expect(screen.queryByText('cv.monitoringSources.appD.failFastThresholds (0)')).not.toBeInTheDocument()

      await waitFor(() => expect(screen.getByText('cv.monitoringSources.assign')).not.toBeNull())
      fireEvent.click(screen.getByText('cv.monitoringSources.assign'))

      await waitFor(() => expect(screen.getByText('cv.monitoredServices.continuousVerification')).toBeInTheDocument())
      userEvent.click(container.querySelector('input[name="continuousVerification"]')!)

      expect(screen.queryByText('cv.monitoringSources.appD.ignoreThresholds (0)')).toBeInTheDocument()
      expect(screen.queryByText('cv.monitoringSources.appD.failFastThresholds (0)')).toBeInTheDocument()
    })

    test('should not render metric thresholds when feature flag is disabled', () => {
      jest.spyOn(useFeatureFlagMock, 'useFeatureFlag').mockReturnValue(false)

      const submitData = jest.fn()
      render(
        <TestWrapper {...createModeProps}>
          <SetupSourceTabs data={{}} tabTitles={['Tab1']} determineMaxTab={() => 1}>
            <AppDMonitoredSource data={appDynamicsDataFull} onSubmit={submitData} onPrevious={jest.fn()} />
          </SetupSourceTabs>
        </TestWrapper>
      )

      expect(screen.queryByText('cv.monitoringSources.appD.ignoreThresholds (0)')).not.toBeInTheDocument()
      expect(screen.queryByText('cv.monitoringSources.appD.failFastThresholds (0)')).not.toBeInTheDocument()
    })
  })
})
