/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import { Formik } from 'formik'
import { FormikForm } from '@wings-software/uicore'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import { fillAtForm, InputTypes } from '@common/utils/JestFormHelper'
import { initialFormData } from '@cv/pages/slos/components/CVCreateSLO/__tests__/CVCreateSLO.mock'
import type { StringKeys } from 'framework/strings'
import { Comparators, SLOFormFields } from '@cv/pages/slos/components/CVCreateSLO/CVCreateSLO.types'
import {
  getHealthSourceOptions,
  getMonitoredServiceOptions
} from '@cv/pages/slos/components/CVCreateSLO/CVCreateSLO.utils'
import { getSLIMetricOptions, getSLITypeOptions } from '@cv/pages/slos/components/CVCreateSLO/CVCreateSLO.constants'
import type { MonitoredServiceDTO, ResponseListMonitoredServiceWithHealthSources } from 'services/cv'
import { getMonitoredServicesOptions } from '../SLI.utils'
import SLI from '../SLI'
import {
  expectedMonitoredServiceOptions,
  mockedMonitoredService,
  mockedMonitoredServiceData,
  mockedMonitoredServiceDataWithNullData
} from './SLI.mock'

jest.mock('@cv/pages/slos/components/SLOTargetChart/SLOTargetChart', () => ({
  __esModule: true,
  default: function SLOTargetChart() {
    return <span data-testid="SLO-target-chart" />
  }
}))

function WrapperComponent(props: { initialValues: any }): JSX.Element {
  const { initialValues } = props
  return (
    <TestWrapper>
      <Formik enableReinitialize={true} initialValues={initialValues} onSubmit={jest.fn()}>
        {formikProps => {
          return (
            <FormikForm>
              <SLI formikProps={formikProps} retryOnError={jest.fn()}>
                <></>
              </SLI>
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
  useGetAllMonitoredServicesWithTimeSeriesHealthSources: jest.fn().mockImplementation(() => {
    return { data: {}, refetch: jest.fn(), error: null, loading: false }
  }),
  useGetSloMetrics: jest.fn().mockImplementation(() => ({ refetch: jest.fn() }))
}))

function getString(key: StringKeys): StringKeys {
  return key
}

describe('Test SLI component', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  test('should render SLI component', async () => {
    const { container } = render(<WrapperComponent initialValues={initialFormData} />)
    expect(screen.getByTestId('SLO-target-chart')).toBeInTheDocument()
    expect(container).toMatchSnapshot()
  })

  test('verify getMonitoredServicesOptions method', async () => {
    const actualMonitoredServiceOptions = getMonitoredServiceOptions(mockedMonitoredServiceData.data)
    expect(actualMonitoredServiceOptions).toEqual(expectedMonitoredServiceOptions)
  })

  test('verify getMonitoredServicesOptions method when null monitored service is passed', async () => {
    const actualMonitoredServiceOptions = getMonitoredServicesOptions(
      mockedMonitoredServiceDataWithNullData as ResponseListMonitoredServiceWithHealthSources | null
    )
    expect(actualMonitoredServiceOptions).toEqual([
      { label: 'Service_101_QA', value: 'Service_101_QA' },
      { label: 'Service_102_QA', value: 'Service_102_QA' }
    ])
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
    test('Event type and Good request metrics dropdowns should not be in the document for Threshold', () => {
      render(<WrapperComponent initialValues={initialFormData} />)

      const ratioMetricRadio = screen.getByRole('radio', {
        name: /cv.slos.slis.metricOptions.ratioBased/i,
        hidden: true
      })

      expect(ratioMetricRadio).toBeChecked()
      expect(screen.queryByText('cv.slos.slis.ratioMetricType.eventType')).toBeInTheDocument()
      expect(screen.queryByText('cv.slos.slis.ratioMetricType.goodRequestsMetrics')).toBeInTheDocument()

      const thresholdMetricRadio = screen.getByRole('radio', {
        name: /cv.slos.slis.metricOptions.thresholdBased/i,
        hidden: true
      })

      userEvent.click(thresholdMetricRadio)

      expect(thresholdMetricRadio).toBeChecked()
      expect(screen.queryByText('cv.slos.slis.ratioMetricType.eventType')).not.toBeInTheDocument()
      expect(screen.queryByText('cv.slos.slis.ratioMetricType.goodRequestsMetrics')).not.toBeInTheDocument()
    })

    test('Suffix "than" should be in the document for operators < and >', () => {
      const { container } = render(<WrapperComponent initialValues={initialFormData} />)

      fillAtForm([
        {
          container,
          type: InputTypes.SELECT,
          fieldId: SLOFormFields.OBJECTIVE_COMPARATOR,
          value: Comparators.LESS
        }
      ])

      expect(screen.getByText('cv.thanObjectiveValue')).toBeInTheDocument()
      expect(screen.queryByText('cv.toObjectiveValue')).not.toBeInTheDocument()
    })

    test('Suffix "to" should be in the document for operators <= and >=', () => {
      const { container } = render(<WrapperComponent initialValues={initialFormData} />)

      fillAtForm([
        {
          container,
          type: InputTypes.SELECT,
          fieldId: SLOFormFields.OBJECTIVE_COMPARATOR,
          value: Comparators.LESS_EQUAL
        }
      ])

      expect(screen.getByText('cv.toObjectiveValue')).toBeInTheDocument()
      expect(screen.queryByText('cv.thanObjectiveValue')).not.toBeInTheDocument()
    })
  })
})
