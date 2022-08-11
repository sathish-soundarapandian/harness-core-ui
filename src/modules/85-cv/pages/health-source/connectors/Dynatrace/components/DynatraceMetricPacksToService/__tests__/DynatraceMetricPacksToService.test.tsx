/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */
import React, { useEffect } from 'react'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { act } from 'react-test-renderer'
import { TestWrapper } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import { accountPathProps, projectPathProps } from '@common/utils/routeUtils'
import * as cvService from 'services/cv'
import { SetupSourceTabs } from '@cv/components/CVSetupSourcesView/SetupSourceTabs/SetupSourceTabs'
import {
  DynatraceHealthSourceSpecMock,
  DynatraceMockHealthSourceData,
  MockDynatraceMetricData,
  mockUseGetDynatraceServices
} from '@cv/pages/health-source/connectors/Dynatrace/__tests__/DynatraceHealthSource.mock'
import type { ValidationStatusProps } from '@cv/pages/components/ValidationStatus/ValidationStatus.types'
import * as MonitoredServiceConnectorUtils from '@cv/pages/health-source/connectors/MonitoredServiceConnector.utils'
import { DynatraceMetricPacksToServicePropsMock } from '@cv/pages/health-source/connectors/Dynatrace/components/DynatraceMetricPacksToService/__tests__/DynatraceMetricPacksToService.mock'
import type { MetricPackDTO } from 'services/cv'
import type { DynatraceMetricPacksToServiceProps } from '../DynatraceMetricPacksToService.types'
import DynatraceMetricPacksToService from '../DynatraceMetricPacksToService'

jest.mock('@cv/hooks/IndexedDBHook/IndexedDBHook', () => ({
  useIndexedDBHook: jest.fn().mockReturnValue({ isInitializingDB: false, dbInstance: { get: jest.fn() } }),
  CVObjectStoreNames: {}
}))

jest.mock(
  '@cv/pages/health-source/connectors/MetricPackCustom',
  () =>
    (props: {
      onChange: (data: { [key: string]: boolean }) => void
      setMetricDataValue: (value: { [key: string]: boolean }) => void
      setSelectedMetricPacks: React.Dispatch<React.SetStateAction<MetricPackDTO[]>>
    }) => {
      return (
        <>
          <button
            data-testid={'setSelectedMetricPacksButtonMock'}
            onClick={() => {
              props.setSelectedMetricPacks(DynatraceHealthSourceSpecMock.metricPacks || [])
            }}
          />
          <button
            name={'customMetricCheckboxChangeMock'}
            onClick={() => {
              props.onChange({ Performance: true })
            }}
          />
          <button
            data-testid={'setMetricDataValueButtonMock'}
            onClick={() => {
              props.setMetricDataValue({ Performance: true })
            }}
          />
        </>
      )
    }
)
const validationStatusComponentRenderedMock = jest.fn()
jest.mock('@cv/pages/components/ValidationStatus/ValidationStatus', () => (props: ValidationStatusProps) => {
  useEffect(() => {
    validationStatusComponentRenderedMock()
  }, [])
  useEffect(() => {
    props?.onClick?.()
  }, [props?.onClick])

  return (
    <>
      <button
        data-testid={'triggerOnRetryButtonMock'}
        onClick={() => {
          props.onRetry?.()
        }}
      />
    </>
  )
})

const metricVerificationModalComponentRenderedMock = jest.fn()
jest.mock('@cv/components/MetricsVerificationModal/MetricsVerificationModal', () => () => {
  useEffect(() => {
    metricVerificationModalComponentRenderedMock()
  }, [])
  return <></>
})

function WrapperComponent(props: DynatraceMetricPacksToServiceProps): JSX.Element {
  return (
    <TestWrapper
      path={routes.toCVActivitySourceEditSetup({
        ...accountPathProps,
        ...projectPathProps
      })}
      pathParams={{
        accountId: projectPathProps.accountId,
        projectIdentifier: projectPathProps.projectIdentifier,
        orgIdentifier: projectPathProps.orgIdentifier,
        activitySource: '1234_activitySource',
        activitySourceId: '1234_sourceId'
      }}
    >
      <SetupSourceTabs data={DynatraceMockHealthSourceData} tabTitles={['MapMetrics']} determineMaxTab={() => 0}>
        <DynatraceMetricPacksToService {...props} />
      </SetupSourceTabs>
    </TestWrapper>
  )
}

describe('Validate DynatraceCustomMetricPacksToService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(cvService, 'useGetDynatraceServices').mockReturnValue(mockUseGetDynatraceServices as any)
  })

  test('Should render ValidationStatus component when service is chosen', async () => {
    render(<WrapperComponent {...DynatraceMetricPacksToServicePropsMock} />)
    expect(validationStatusComponentRenderedMock).toHaveBeenCalledTimes(1)
  })

  test('Should trigger validation when metric packs are selected', async () => {
    const validateMetricsMock = jest
      .spyOn(MonitoredServiceConnectorUtils, 'validateMetrics')
      .mockReturnValue(Promise.resolve({ validationStatus: 'SUCCESS', validationResult: [{}] as any }))
    const { getByTestId } = render(<WrapperComponent {...DynatraceMetricPacksToServicePropsMock} />)

    act(() => {
      fireEvent.click(getByTestId('setSelectedMetricPacksButtonMock'))
    })
    await waitFor(() => {
      expect(validateMetricsMock).toHaveBeenCalledTimes(1)
    })
  })

  test('Should NOT render ValidationStatus component when service is not chosen', async () => {
    const propsWithoutSelectedService: DynatraceMetricPacksToServiceProps = {
      ...DynatraceMetricPacksToServicePropsMock,
      metricValues: {
        ...MockDynatraceMetricData,
        selectedService: {
          label: '',
          value: ''
        }
      }
    }
    render(<WrapperComponent {...propsWithoutSelectedService} />)
    expect(validationStatusComponentRenderedMock).toHaveBeenCalledTimes(0)
  })

  test('Should validate that MetricsVerificationModal is shown', async () => {
    // mock validateMappings and return mocked, no empty validation result
    // this will provide that modal is opened when click on ValidationStatus component occurs
    jest
      .spyOn(MonitoredServiceConnectorUtils, 'validateMetrics')
      .mockReturnValue(Promise.resolve({ validationStatus: 'SUCCESS', validationResult: [{}] as any }))

    const { container } = render(<WrapperComponent {...DynatraceMetricPacksToServicePropsMock} />)
    const onMetricPackChangeButton = container.querySelector(
      'button[name="customMetricCheckboxChangeMock"]'
    ) as HTMLElement
    act(() => {
      fireEvent.click(onMetricPackChangeButton)
    })
    await waitFor(() => expect(metricVerificationModalComponentRenderedMock).toHaveBeenCalledTimes(1))
  })
  test('should validate proper service is set as chosen', async () => {
    // provided props contain dynatraceMetricData which has selected service with 'mock_service_name'
    const { container } = render(<WrapperComponent {...DynatraceMetricPacksToServicePropsMock} />)
    const serviceSelectElement = container.querySelector('input[value="mock_service_name"]') as HTMLElement
    expect(serviceSelectElement).toBeTruthy()
  })

  test('should not trigger validation when service is not chosen', async () => {
    const validateMetricsMock = jest
      .spyOn(MonitoredServiceConnectorUtils, 'validateMetrics')
      .mockReturnValue(Promise.resolve({ validationStatus: 'SUCCESS', validationResult: [{}] as any }))

    const metricPacksWithoutService: DynatraceMetricPacksToServiceProps = {
      ...DynatraceMetricPacksToServicePropsMock,
      dynatraceMetricData: { ...MockDynatraceMetricData, selectedService: { label: '', value: '' } }
    }
    render(<WrapperComponent {...metricPacksWithoutService} />)
    expect(validateMetricsMock).toHaveBeenCalledTimes(0)
  })

  test('should trigger validation when retry is clicked', async () => {
    const validateMetricsMock = jest
      .spyOn(MonitoredServiceConnectorUtils, 'validateMetrics')
      .mockReturnValue(Promise.resolve({ validationStatus: 'SUCCESS', validationResult: [{}] as any }))

    const { getByTestId } = render(<WrapperComponent {...DynatraceMetricPacksToServicePropsMock} />)

    act(() => {
      fireEvent.click(getByTestId('triggerOnRetryButtonMock'))
    })
    await waitFor(() => expect(validateMetricsMock).toHaveBeenCalledTimes(1))
  })

  test('should call setDynatraceMetricData state when CustomMetric packs emits selection change', async () => {
    const setDynatraceMetricDataMock = jest.fn()
    const propsWithSetServiceMock = {
      ...DynatraceMetricPacksToServicePropsMock,
      setDynatraceMetricData: setDynatraceMetricDataMock
    }
    const { getByTestId } = render(<WrapperComponent {...propsWithSetServiceMock} />)

    act(() => {
      fireEvent.click(getByTestId('setMetricDataValueButtonMock'))
    })
    await waitFor(() => {
      expect(setDynatraceMetricDataMock).toHaveBeenCalledTimes(1)
    })
  })
  test('should show Loading when service retrieving is in progress', async () => {
    jest.spyOn(cvService, 'useGetDynatraceServices').mockReturnValue({ loading: true, refetch: jest.fn() } as any)
    const { getByText } = render(<WrapperComponent {...DynatraceMetricPacksToServicePropsMock} />)
    expect(() => getByText('Loading')).toBeTruthy()
  })
})
