/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { Formik } from 'formik'
import { FormikForm, useToaster } from '@harness/uicore'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import * as cvServices from 'services/cv'
import {
  getHealthSourceOptions,
  getMonitoredServiceOptions
} from '@cv/pages/slos/components/CVCreateSLOV2/CVCreateSLOV2.utils'
import {
  initialFormData,
  metricListResponse
} from '@cv/pages/slos/components/CVCreateSLOV2/__tests__/CVCreateSLOV2.mock'
import type { StringKeys } from 'framework/strings'
import { getSLITypeOptions, getSLIMetricOptions } from '@cv/pages/slos/components/CVCreateSLOV2/CVCreateSLOV2.constants'
import { EvaluationType, SLIMetricTypes } from '@cv/pages/slos/components/CVCreateSLOV2/CVCreateSLOV2.types'
import { shouldFetchMetricGraph } from '@cv/pages/slos/components/CVCreateSLOV2/components/CreateSimpleSloForm/CreateSimpleSloForm.utils'
import type { MonitoredServiceDTO, ResponsePageMSDropdownResponse } from 'services/cv'
import { getMonitoredServicesOptions } from '../SLI.utils'
import SLI from '../SLI'
import {
  expectedMonitoredServiceOptions,
  mockedMonitoredService,
  mockedMonitoredServiceData,
  mockedMonitoredServiceDataWithNullData,
  monitoredServiceMockData
} from './SLI.mock'
import { ConfigureSLIProvider } from '../SLIContext'

jest.mock('@common/hooks', () => ({
  ...(jest.requireActual('@common/hooks') as any),
  useMutateAsGet: jest.fn()
}))

jest.mock('@harness/uicore', () => ({
  ...jest.requireActual('@harness/uicore'),
  useToaster: jest.fn().mockReturnValue({ showSuccess: jest.fn(), showError: jest.fn() })
}))

function WrapperComponent(props: { initialValues: any }): JSX.Element {
  const { initialValues } = props
  return (
    <TestWrapper>
      <Formik
        enableReinitialize={true}
        initialValues={{ ...initialValues, healthSourceRef: 'hs101' }}
        onSubmit={jest.fn()}
      >
        {formikProps => {
          const { eventType, evaluationType, SLIMetricType, goodRequestMetric, validRequestMetric } = formikProps.values
          const isWindowBased = evaluationType === EvaluationType.WINDOW
          const isRatioBased = SLIMetricType === SLIMetricTypes.RATIO
          const showSLIMetricChart = shouldFetchMetricGraph({
            isWindow: isWindowBased,
            isRatioBased,
            validRequestMetric,
            goodRequestMetric,
            eventType
          })
          return (
            <FormikForm>
              <ConfigureSLIProvider
                isWindowBased={isWindowBased}
                isRatioBased={isRatioBased}
                showSLIMetricChart={showSLIMetricChart}
              >
                <SLI showMetricChart formikProps={formikProps} retryOnError={jest.fn()} />
              </ConfigureSLIProvider>
            </FormikForm>
          )
        }}
      </Formik>
    </TestWrapper>
  )
}

jest.mock('services/cv', () => ({
  useGetMonitoredService: jest.fn().mockImplementation(() => ({
    data: {},
    loading: false,
    error: null,
    refetch: jest.fn()
  })),
  useGetSLOAssociatedMonitoredServices: jest.fn().mockImplementation(() => {
    return { data: {}, refetch: jest.fn(), error: null, loading: false }
  }),
  useGetSloMetrics: jest.fn().mockImplementation(() => ({ refetch: jest.fn() })),
  useGetMetricOnboardingGraph: jest.fn().mockImplementation(() => ({ refetch: jest.fn() }))
}))

function getString(key: StringKeys): StringKeys {
  return key
}

describe('Test SLI component', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  test('should render SLI component', async () => {
    const { container, getByText } = render(<WrapperComponent initialValues={initialFormData} />)
    act(async () => {
      await userEvent.click(getByText('cv.healthSource.newHealthSource'))
    })
    expect(container).toMatchSnapshot()
  })

  test('should render SLI metric chart component for Ratio and Threshold', async () => {
    const refetchMS = jest.fn()
    const refetchMetric = jest.fn()
    jest.spyOn(cvServices, 'useGetMonitoredService').mockImplementation(
      () =>
        ({
          data: monitoredServiceMockData,
          refetch: refetchMS
        } as any)
    )
    jest.spyOn(cvServices, 'useGetSloMetrics').mockImplementation(
      () =>
        ({
          data: metricListResponse,
          refetch: refetchMetric
        } as any)
    )
    refetchMS.mockImplementation(
      () =>
        ({
          data: monitoredServiceMockData,
          error: null,
          loading: false,
          refetch: refetchMS
        } as any)
    )

    const { container, getByText } = render(
      <WrapperComponent initialValues={{ ...initialFormData, monitoredServiceRef: 'ms101' }} />
    )

    // select healthsource
    const durationDropdown = container.querySelector('[data-icon="chevron-down"]') as HTMLInputElement
    await waitFor(() => expect(durationDropdown!).toBeInTheDocument())
    await act(() => {
      fireEvent.click(durationDropdown)
    })
    await waitFor(() => expect(document.querySelectorAll('ul.bp3-menu li').length).toEqual(1))
    await act(() => {
      fireEvent.click(document.querySelectorAll('ul.bp3-menu li')[0])
    })
    expect(container.querySelector('input[name="healthSourceRef"]')).toHaveValue('AppD for SLO 2 metric')

    // select event type
    await act(async () => {
      await userEvent.click(container.querySelector('input[name="eventType"]')!)
    })
    await waitFor(() => expect(document.querySelectorAll('ul.bp3-menu li').length).toEqual(2))
    await act(() => {
      fireEvent.click(document.querySelectorAll('ul.bp3-menu li')[0])
    })
    expect(container.querySelector('input[name="eventType"]')).toHaveValue('cv.good')

    //  select metric validRequestMetric
    expect(container.querySelectorAll('[data-icon="chevron-down"]').length).toEqual(6)
    await act(async () => {
      await userEvent.click(container.querySelector('input[name="validRequestMetric"]')!)
    })
    await waitFor(() => expect(document.querySelectorAll('ul.bp3-menu li').length).toEqual(2))
    await act(() => {
      fireEvent.click(document.querySelectorAll('ul.bp3-menu li')[0])
    })
    expect(container.querySelector('input[name="validRequestMetric"]')).toHaveValue('appdMetric 2')

    //  select metric goodRequestMetric
    await act(async () => {
      await userEvent.click(container.querySelector('input[name="goodRequestMetric"]')!)
    })
    await waitFor(() => expect(document.querySelectorAll('ul.bp3-menu li').length).toEqual(2))
    await act(() => {
      fireEvent.click(document.querySelectorAll('ul.bp3-menu li')[1])
    })
    expect(container.querySelector('input[name="goodRequestMetric"]')).toHaveValue('appdMetric 1')
    expect(container.querySelector('div[data-testid="appdMetric_1_metricChart"]')).toBeInTheDocument()
    expect(container.querySelector('div[data-testid="appdMetric_2_metricChart"]')).toBeInTheDocument()
    expect(container.querySelector('div[data-testid="ratio_metricChart"]')).toBeInTheDocument()
    expect(container).toMatchSnapshot()

    await act(() => {
      fireEvent.click(getByText('cv.slos.slis.metricOptions.thresholdBased'))
    })

    expect(container.querySelector('div[data-testid="appdMetric_2_metricChart"]')).toBeInTheDocument()
    expect(container).toMatchSnapshot()
  })

  test('verify getMonitoredServicesOptions method', async () => {
    const actualMonitoredServiceOptions = getMonitoredServiceOptions(mockedMonitoredServiceData.data)
    expect(actualMonitoredServiceOptions).toEqual(expectedMonitoredServiceOptions)
  })

  test('verify getMonitoredServicesOptions method when null monitored service is passed', async () => {
    const actualMonitoredServiceOptions = getMonitoredServicesOptions(
      mockedMonitoredServiceDataWithNullData as ResponsePageMSDropdownResponse | null
    )
    expect(actualMonitoredServiceOptions).toEqual([])
  })

  test('verify healthSourcesOptions method', async () => {
    const actualHealthSources = getHealthSourceOptions(mockedMonitoredService as MonitoredServiceDTO)
    expect(actualHealthSources).toEqual([{ label: 'NR-1', value: 'NR1' }])
  })

  test('verify getSliTypeOptions method', async () => {
    expect(getSLITypeOptions(getString)).toEqual([
      { label: 'cv.slos.slis.type.availability', value: 'Availability' },
      { label: 'cv.slos.slis.type.latency', value: 'Latency' }
    ])
  })

  test('verify getSliMetricOptions method', async () => {
    expect(getSLIMetricOptions(getString)).toEqual([
      {
        label: 'cv.slos.slis.metricOptions.thresholdBased',
        value: 'Threshold'
      },
      {
        label: 'cv.slos.slis.metricOptions.ratioBased',
        value: 'Ratio'
      }
    ])
  })

  describe('PickMetric', () => {
    test('should render when useGetSloMetrics fails', async () => {
      const showError = jest.fn()
      const showSuccess = jest.fn()
      ;(useToaster as jest.Mock).mockReturnValue({ showError, showSuccess })
      jest.spyOn(cvServices, 'useGetSloMetrics').mockImplementation(
        () =>
          ({
            data: null,
            loading: false,
            error: {
              data: 'error'
            },
            refetch: jest.fn()
          } as any)
      )
      render(<WrapperComponent initialValues={initialFormData} />)
      await waitFor(() => expect(showError).toHaveBeenCalled())
    })

    test('Event type and Good request metrics dropdowns should not be in the document for Threshold', async () => {
      render(<WrapperComponent initialValues={initialFormData} />)

      const ratioMetricRadio = screen.getByRole('radio', {
        name: /cv.slos.slis.metricOptions.ratioBased/i,
        hidden: true
      })
      await userEvent.click(ratioMetricRadio)
      expect(ratioMetricRadio).toBeChecked()
      expect(screen.queryByText('cv.slos.slis.ratioMetricType.eventType')).toBeInTheDocument()
      expect(screen.queryByText('cv.slos.slis.ratioMetricType.goodRequestsMetrics')).toBeInTheDocument()

      const thresholdMetricRadio = screen.getByRole('radio', {
        name: /cv.slos.slis.metricOptions.thresholdBased/i,
        hidden: true
      })

      await userEvent.click(thresholdMetricRadio)

      expect(thresholdMetricRadio).toBeChecked()
      expect(screen.queryByText('cv.slos.slis.ratioMetricType.eventType')).not.toBeInTheDocument()
      expect(screen.queryByText('cv.slos.slis.ratioMetricType.goodRequestsMetrics')).not.toBeInTheDocument()
    })
  })
})
