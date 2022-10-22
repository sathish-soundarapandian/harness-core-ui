/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { Formik } from '@harness/uicore'
import { TestWrapper } from '@common/utils/testUtils'
import { templateRefData, useGetTemplateData } from './HealthSourceInputset.test.mock'
import HealthSourceInputset from '../HealthSourceInputset'

const mockInitValue = {
  identifier: '<+monitoredService.serviceRef>_<+monitoredService.environmentRef>',
  type: 'Application',
  serviceRef: '',
  environmentRef: '',
  sources: {
    healthSources: [
      {
        identifier: 'AppD_default_metrics_runtime_connector',
        type: 'AppDynamics',
        spec: { applicationName: '', tierName: '', connectorRef: '' }
      },
      {
        identifier: 'Appd_with_custom_and_runtime_connector',
        type: 'AppDynamics',
        spec: {
          applicationName: '',
          tierName: '',
          metricDefinitions: [
            {
              identifier: 'appdMetric_101',
              completeMetricPath: '',
              analysis: { deploymentVerification: { serviceInstanceMetricPath: '' } }
            }
          ],
          connectorRef: ''
        }
      }
    ]
  }
}

describe('Validate HealthSourceInputset', () => {
  test('should render HealthSourceInputset', () => {
    const msTemplateRefetch = jest.fn().mockResolvedValue({})
    const { container, rerender } = render(
      <TestWrapper>
        <Formik formName="" initialValues={mockInitValue} onSubmit={() => undefined}>
          <HealthSourceInputset
            data={{
              data: { ...useGetTemplateData, identifier: 'identifier', accountId: 'accountId', name: 'name' },
              correlationId: ''
            }}
            loading={true}
            error={null}
            refetch={msTemplateRefetch}
            templateRefData={templateRefData}
            isReadOnlyInputSet={true}
            healthSourcesWithRuntimeList={[
              'AppD_default_metrics_runtime_connector',
              'Appd_with_custom_and_runtime_connector'
            ]}
          />
        </Formik>
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
    rerender(
      <TestWrapper>
        <Formik formName="" initialValues={mockInitValue} onSubmit={() => undefined}>
          <HealthSourceInputset
            data={{
              data: { ...useGetTemplateData, identifier: 'identifier', accountId: 'accountId', name: 'name' },
              correlationId: ''
            }}
            loading={true}
            error={null}
            refetch={msTemplateRefetch}
            templateRefData={templateRefData}
            isReadOnlyInputSet={false}
            healthSourcesWithRuntimeList={[
              'AppD_default_metrics_runtime_connector',
              'Appd_with_custom_and_runtime_connector'
            ]}
          />
        </Formik>
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('should render HealthSourceInputset in loading state', () => {
    const { container } = render(
      <TestWrapper>
        <HealthSourceInputset
          data={{}}
          loading={true}
          error={null}
          refetch={jest.fn()}
          templateRefData={templateRefData}
          isReadOnlyInputSet={true}
          healthSourcesWithRuntimeList={[]}
        />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('should render HealthSourceInputset in error state', () => {
    const { container, getByText } = render(
      <TestWrapper>
        <HealthSourceInputset
          data={{}}
          loading={false}
          error={{ data: { message: 'api call failed' }, message: 'api call failed' }}
          refetch={jest.fn()}
          templateRefData={templateRefData}
          isReadOnlyInputSet={true}
          healthSourcesWithRuntimeList={[]}
        />
      </TestWrapper>
    )
    expect(getByText('api call failed')).toBeInTheDocument()
    expect(container).toMatchSnapshot()
  })

  test('should render HealthSourceInputset in no data state', () => {
    const { container } = render(
      <TestWrapper>
        <HealthSourceInputset
          data={{}}
          loading={true}
          error={null}
          refetch={jest.fn()}
          templateRefData={templateRefData}
          isReadOnlyInputSet={true}
          healthSourcesWithRuntimeList={[]}
        />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
