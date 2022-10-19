/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Formik, FormikForm } from '@wings-software/uicore'
import { render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import * as cvServices from 'services/cv'
import * as cdServices from 'services/cd-ng'
import CustomHealthSourceForm from '../CustomHealthSourceForm'
import { formikValue, sourceData, mappedMetricWithValue, recordsData, chartData } from './CustomHealthSource.mock'
import { riskCategoryMock } from '../../__tests__/HealthSources.mock'

jest.mock('@common/components/NameIdDescriptionTags/NameIdDescriptionTags', () => ({
  ...(jest.requireActual('@common/components/NameIdDescriptionTags/NameIdDescriptionTags') as any),
  NameId: function Mock() {
    return <div className="mockNameId" />
  }
}))

describe('Verify CustomHealthSourceForm', () => {
  beforeAll(() => {
    const getSampleData = jest.fn().mockReturnValue(recordsData)
    const getMetricPacks = jest.fn().mockReturnValue({})
    const getParsedSampleData = jest.fn().mockResolvedValue(chartData)

    jest
      .spyOn(cvServices, 'useFetchSampleData')
      .mockImplementation(() => ({ loading: false, error: null, mutate: getSampleData } as any))
    jest
      .spyOn(cvServices, 'useFetchParsedSampleData')
      .mockImplementation(() => ({ loading: false, error: null, mutate: getParsedSampleData } as any))
    jest
      .spyOn(cdServices, 'useGetConnector')
      .mockImplementation(() => ({ loading: false, error: null, data: {} } as any))
    jest
      .spyOn(cvServices, 'useGetMetricPacks')
      .mockImplementation(() => ({ loading: false, error: null, data: {}, refetch: getMetricPacks } as any))
    jest
      .spyOn(cvServices, 'useGetRiskCategoryForCustomHealthMetric')
      .mockImplementation(
        () => ({ loading: false, error: null, data: riskCategoryMock, refetch: getMetricPacks } as any)
      )
  })

  test('should render CustomHealthSourceForm with data', async () => {
    const onFieldChange = jest.fn()
    const onValueChange = jest.fn()
    const { container, getByText } = render(
      <TestWrapper>
        <Formik
          formName="test-form"
          initialValues={mappedMetricWithValue.get('CustomHealth Metric')}
          onSubmit={jest.fn()}
        >
          {() => (
            <FormikForm>
              <CustomHealthSourceForm
                formValue={formikValue}
                onFieldChange={onFieldChange}
                onValueChange={onValueChange}
                mappedMetrics={mappedMetricWithValue}
                selectedMetric={'CustomHealth Metric'}
                connectorIdentifier={sourceData?.connectorRef || ''}
              />
            </FormikForm>
          )}
        </Formik>
      </TestWrapper>
    )

    expect(container.querySelector('input[value="Group 1"]')).toBeInTheDocument()

    userEvent.click(getByText('cv.customHealthSource.Querymapping.title'))

    await waitFor(() => expect(container.querySelector('input[value="GET"]')).toBeChecked())

    await waitFor(() => expect(container.querySelector('input[value="SERVICE_BASED"]')).toBeChecked())

    await waitFor(() => expect(container.querySelector('input[name="baseURL"]')).toBeDisabled())

    await waitFor(() =>
      expect(container.querySelector('input[name="pathURL"]')).toHaveValue(
        'query?query=kubernetes.cpu.usage.total{*}by{pod_name}.rollup(avg,60)&from=start_time_seconds&to=end_time_seconds&pod_name=harness-datadog-dummy-pipeline-deployment-canary-76586cb6fvjsfp'
      )
    )
    await waitFor(() =>
      expect(container.querySelector('input[name="startTime.placeholder"]')).toHaveValue('start_time_seconds')
    )
    await waitFor(() =>
      expect(container.querySelector('input[name="startTime.timestampFormat"]')).toHaveValue('Seconds')
    )

    await waitFor(() =>
      expect(container.querySelector('input[name="endTime.placeholder"]')).toHaveValue('end_time_seconds')
    )
    await waitFor(() => expect(container.querySelector('input[name="endTime.timestampFormat"]')).toHaveValue('Seconds'))

    userEvent.click(getByText('cv.monitoringSources.gcoLogs.fetchRecords'))

    // edit values

    await waitFor(() => expect(container.querySelector('input[value="POST"]')).not.toBeChecked())
    userEvent.click(container.querySelector('input[value="POST"]')!)
    await waitFor(() => expect(container.querySelector('input[value="POST"]')).toBeChecked())

    await waitFor(() => expect(container.querySelector('input[value="HOST_BASED"]')).not.toBeChecked())
    await waitFor(() => expect(container.querySelector('textarea[name="query"]')).not.toBeInTheDocument())
    userEvent.click(container.querySelector('input[value="HOST_BASED"]')!)
    await waitFor(() => expect(container.querySelector('input[value="HOST_BASED"]')).toBeChecked())

    userEvent.click(getByText('cv.healthSource.connectors.NewRelic.metricValueAndCharts'))

    await waitFor(() => expect(getByText('$.series.[*].length')).toBeInTheDocument())
    await waitFor(() => expect(getByText('$.series.[*].query_index')).toBeInTheDocument())
    userEvent.click(getByText('cv.healthSource.connectors.buildChart'))

    userEvent.click(getByText('cv.monitoringSources.assign'))

    userEvent.click(container.querySelector('input[name="healthScore"]')!)
    await waitFor(() => expect(container.querySelector('input[name="healthScore"]')).toBeChecked())
    await waitFor(() => expect(container.querySelector('input[name="sli"]')).toBeChecked())

    userEvent.click(container.querySelector('input[value="Errors"]')!)
    userEvent.click(container.querySelector('input[name="higherBaselineDeviation"]')!)
  })

  test('should render CustomHealthSourceForm with no formikValue', async () => {
    const onFieldChange = jest.fn()
    const onValueChange = jest.fn()
    const { container, getByText } = render(
      <TestWrapper>
        <Formik
          formName="test-form"
          initialValues={mappedMetricWithValue.get('CustomHealth Metric')}
          onSubmit={jest.fn()}
        >
          {formikProps => (
            <FormikForm>
              <CustomHealthSourceForm
                formValue={formikProps.values}
                onFieldChange={onFieldChange}
                onValueChange={onValueChange}
                mappedMetrics={mappedMetricWithValue}
                selectedMetric={'CustomHealth Metric'}
                connectorIdentifier={sourceData?.connectorRef || ''}
              />
            </FormikForm>
          )}
        </Formik>
      </TestWrapper>
    )

    // Verify clicking on POST shows query textare
    userEvent.click(getByText('cv.customHealthSource.Querymapping.title'))
    await waitFor(() => expect(container.querySelector('input[value="POST"]')).not.toBeChecked())
    userEvent.click(container.querySelector('input[value="POST"]')!)
    await waitFor(() => expect(container.querySelector('input[value="POST"]')).toBeChecked())
    await waitFor(() => expect(container.querySelector('textarea[name="query"]')).toBeInTheDocument())

    // Selecting HostBased updates Assign component
    await waitFor(() => expect(container.querySelector('input[value="HOST_BASED"]')).not.toBeChecked())
    userEvent.click(container.querySelector('input[value="HOST_BASED"]')!)
    await waitFor(() => expect(container.querySelector('input[value="HOST_BASED"]')).toBeChecked())

    userEvent.click(getByText('cv.monitoringSources.assign'))
    await waitFor(() => expect(getByText('cv.monitoredServices.continuousVerification')).toBeInTheDocument())
    userEvent.click(container.querySelector('input[name="continuousVerification"]')!)
    await waitFor(() => expect(container.querySelector('input[name="continuousVerification"]')).toBeChecked())
    await waitFor(() => expect(container.querySelector('input[name="healthScore"]')).not.toBeInTheDocument())

    userEvent.click(getByText('cv.customHealthSource.Querymapping.title'))

    await waitFor(() => expect(container.querySelector('input[value="SERVICE_BASED"]')).not.toBeChecked())
    userEvent.click(container.querySelector('input[value="SERVICE_BASED"]')!)
    await waitFor(() => expect(container.querySelector('input[value="SERVICE_BASED"]')).toBeChecked())

    userEvent.click(getByText('cv.monitoringSources.assign'))
    await waitFor(() =>
      expect(getByText('cv.monitoredServices.monitoredServiceTabs.serviceHealth')).toBeInTheDocument()
    )
    await waitFor(() => expect(getByText('cv.slos.sli')).toBeInTheDocument())

    userEvent.click(container.querySelector('input[name="healthScore"]')!)
    await waitFor(() => expect(container.querySelector('input[name="sli"]')).toBeChecked())
    userEvent.click(container.querySelector('input[name="sli"]')!)

    await waitFor(() => expect(container.querySelector('input[name="healthScore"]')).toBeChecked())
    await waitFor(() => expect(container.querySelector('input[name="sli"]')).not.toBeChecked())

    userEvent.click(container.querySelector('input[value="Errors"]')!)
    userEvent.click(container.querySelector('input[name="higherBaselineDeviation"]')!)

    await waitFor(() => expect(container.querySelector('input[name="continuousVerification"]')).not.toBeInTheDocument())
  })
})
