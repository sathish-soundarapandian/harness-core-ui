/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import * as uuid from 'uuid'
import { fireEvent, render, waitFor, act } from '@testing-library/react'
import { Connectors } from '@connectors/constants'
import { TestWrapper } from '@common/utils/testUtils'
import * as useFeatureFlagMock from '@common/hooks/useFeatureFlag'
import { SetupSourceTabs } from '@cv/components/CVSetupSourcesView/SetupSourceTabs/SetupSourceTabs'
import * as cvServices from 'services/cv'
import AppDHealthSourceContainer from '../AppDHealthSourceContainer'
import {
  appTier,
  applicationName,
  metricPack,
  validationData,
  templateSourceData,
  onPreviousPayloadTemplate,
  onSubmitPayloadTemplate,
  templateSourceDataWithCustomMetric,
  defaultTemplateData,
  defaultPayload
} from './AppDMonitoredSource.mock'
import AppDMonitoredSource from '../AppDHealthSource'

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

  test('Component renders in edit mode', async () => {
    jest.spyOn(useFeatureFlagMock, 'useFeatureFlag').mockReturnValue(true)
    jest.spyOn(uuid, 'v4').mockReturnValue('MockedUUID')
    const submitData = jest.fn()
    const { getByText } = render(
      <TestWrapper>
        <SetupSourceTabs data={{}} tabTitles={['Tab1']} determineMaxTab={() => 1}>
          <AppDHealthSourceContainer isTemplate={true} data={templateSourceData} onSubmit={submitData} />
        </SetupSourceTabs>
      </TestWrapper>
    )
    await waitFor(() => expect(getByText('submit')).not.toBeNull())
    fireEvent.click(getByText('previous'))
    await waitFor(() => expect(onPrevious).toHaveBeenCalledWith(expect.objectContaining(onPreviousPayloadTemplate)))

    act(() => {
      fireEvent.click(getByText('submit'))
    })

    await waitFor(() => expect(submitData).toHaveBeenCalledWith(expect.anything(), onSubmitPayloadTemplate))
  })

  test('Component renders in edit mode with custom metric', async () => {
    jest.spyOn(uuid, 'v4').mockReturnValue('MockedUUID')
    const submitData = jest.fn()
    const { container, getByText } = render(
      <TestWrapper>
        <SetupSourceTabs data={{}} tabTitles={['Tab1']} determineMaxTab={() => 1}>
          <AppDHealthSourceContainer
            isTemplate={true}
            data={templateSourceDataWithCustomMetric}
            onSubmit={submitData}
          />
        </SetupSourceTabs>
      </TestWrapper>
    )
    expect(container.querySelector('input[name="appDTier"]')).toHaveValue('<+input>')
    expect(container.querySelector('input[name="appdApplication"]')).toHaveValue('<+input>')
    expect(container.querySelector('input[name="completeMetricPath"]')).toHaveValue('<+input>')

    await waitFor(() => expect(getByText('submit')).not.toBeNull())

    act(() => {
      fireEvent.click(container.querySelector('div[data-testid="riskProfile-summary"]')!)
    })

    act(() => {
      fireEvent.click(getByText('submit'))
    })
    expect(container).toMatchSnapshot()
  })

  test('should render when connector is runtime', () => {
    const onSubmit = jest.fn()
    const { container, getByText } = render(
      <TestWrapper>
        <AppDMonitoredSource
          data={{ ...defaultTemplateData } as any}
          onSubmit={onSubmit}
          onPrevious={jest.fn()}
          isTemplate={true}
          expressions={[]}
        />
      </TestWrapper>
    )
    // for runtime connector app and tier are runtime
    expect(container.querySelector('input[name="appDTier"]')).toHaveValue('<+input>')
    expect(container.querySelector('input[name="appdApplication"]')).toHaveValue('<+input>')
    act(() => {
      fireEvent.click(getByText('submit'))
    })
    expect(container).toMatchSnapshot()
  })

  test('should render in  when connector is fixed', () => {
    const onSubmit = jest.fn()
    const { container, getByText } = render(
      <TestWrapper>
        <AppDMonitoredSource
          data={
            {
              ...defaultTemplateData,
              connectorRef: 'appdconnector',
              applicationName: 'cv-app',
              tierName: 'manager'
            } as any
          }
          onSubmit={onSubmit}
          onPrevious={jest.fn()}
          isTemplate={true}
          expressions={[]}
        />
      </TestWrapper>
    )
    // for fixed connector app and tier are fixed
    expect(container.querySelector('input[value="manager"]')).toHaveValue('manager')
    expect(container.querySelector('input[value="cv-app"]')).toHaveValue('cv-app')
    act(() => {
      fireEvent.click(getByText('submit'))
    })
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining(defaultPayload))
    expect(container).toMatchSnapshot()
  })

  test('should render in  when connector is fixed', () => {
    const { container } = render(
      <TestWrapper>
        <AppDMonitoredSource
          data={
            {
              name: 'appdtemplate',
              identifier: 'appdtemplate',
              connectorRef: 'appdconnector',
              isEdit: false,
              product: { value: 'Application Monitoring', label: 'Application Monitoring' },
              type: 'AppDynamics',
              applicationName: 'cv-app',
              tierName: 'manager',
              mappedServicesAndEnvs: {}
            } as any
          }
          onSubmit={jest.fn()}
          onPrevious={jest.fn()}
          isTemplate={true}
          expressions={[]}
        />
      </TestWrapper>
    )
    // for fixed connector app and tier are fixed
    expect(container.querySelector('input[value="manager"]')).toHaveValue('manager')
    expect(container.querySelector('input[value="cv-app"]')).toHaveValue('cv-app')
    expect(container).toMatchSnapshot()
  })
})
