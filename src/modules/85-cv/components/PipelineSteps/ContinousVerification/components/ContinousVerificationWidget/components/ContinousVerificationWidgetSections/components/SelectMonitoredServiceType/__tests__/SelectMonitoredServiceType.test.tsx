/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import type { AllowedTypesWithRunTime } from '@harness/uicore'
import { TestWrapper } from '@common/utils/testUtils'

import SelectMonitoredServiceType, { SelectMonitoredServiceTypeProps } from '../SelectMonitoredServiceType'
import {
  mockedFormikWithTemplatesData,
  mockedTemplateData,
  mockedTemplateInputYaml,
  updatedSpecs
} from './SelectMonitoredServiceType.mock'
import {
  getInitialHealthSources,
  getInitialHealthSourceVariables,
  getInitialServiceAndEnv,
  getUpdatedSpecs
} from '../SelectMonitoredServiceType.utils'

jest.mock('services/cv', () => {
  return {
    useGetTemplateInputSetYaml: jest.fn().mockImplementation(() => {
      return {
        data: {},
        refetch: jest.fn(),
        error: null,
        loading: false,
        cancel: jest.fn()
      }
    })
  }
})

jest.mock('framework/Templates/TemplateSelectorContext/useTemplateSelector', () => ({
  useTemplateSelector: jest.fn().mockReturnValue({
    getTemplate: jest.fn().mockImplementation(() => ({ template: {}, isCopied: false }))
  })
}))

jest.mock('@cv/components/HarnessServiceAndEnvironment/HarnessServiceAndEnvironment', () => ({
  useGetHarnessServices: () => ({
    serviceOptions: [
      { label: 'service1', value: 'service1' },
      { label: 'AppDService101', value: 'AppDService101' }
    ]
  }),
  useGetHarnessEnvironments: () => {
    return {
      environmentOptions: [
        { label: 'env1', value: 'env1' },
        { label: 'AppDTestEnv1', value: 'AppDTestEnv1' }
      ]
    }
  }
}))

const WrapperComponent = (props: SelectMonitoredServiceTypeProps): JSX.Element => {
  return (
    <TestWrapper>
      <SelectMonitoredServiceType {...props} />
    </TestWrapper>
  )
}

describe('Unit tests for SelectMonitoredServiceType', () => {
  test('Verify if correct template inputs are rendered in the verify step', async () => {
    const props = {
      formik: mockedFormikWithTemplatesData,
      allowableTypes: ['FIXED', 'RUNTIME', 'EXPRESSION'] as AllowedTypesWithRunTime[]
    }
    const { getByText } = render(<WrapperComponent {...props} />)
    // validate service and env.
    expect(getByText('service')).toBeInTheDocument()
    expect(getByText('environment')).toBeInTheDocument()

    //validate healthsource fields
    expect(getByText('cv.monitoringSources.appD.applicationName')).toBeInTheDocument()
    expect(getByText('cv.monitoringSources.appD.tierName')).toBeInTheDocument()
    expect(getByText('connector')).toBeInTheDocument()

    //validate metric definitions field
    expect(getByText('cv.monitoringSources.appD.completeMetricPath')).toBeInTheDocument()
    expect(getByText('cv.monitoringSources.appD.serviceInstanceMetricPath')).toBeInTheDocument()

    //validate variables
    expect(getByText('connectorVariable')).toBeInTheDocument()
  })

  test('Verify if select button template button is present to select the template', () => {
    const props = {
      formik: mockedFormikWithTemplatesData,
      allowableTypes: ['FIXED', 'RUNTIME', 'EXPRESSION'] as AllowedTypesWithRunTime[]
    }
    const { queryByText } = render(<WrapperComponent {...props} />)
    const useTemplateButton = queryByText('common.useTemplate')
    expect(useTemplateButton).toBeInTheDocument()
  })

  test('Validate getUpdatedSpecs method', () => {
    expect(getUpdatedSpecs(mockedFormikWithTemplatesData.values, mockedTemplateInputYaml, mockedTemplateData)).toEqual(
      updatedSpecs
    )
  })

  test('Validate getInitialHealthSourceVariables method', () => {
    expect(getInitialHealthSourceVariables(mockedFormikWithTemplatesData.values)).toEqual([
      { name: 'connectorVariable', type: 'String', value: '<+input>' }
    ])
  })

  test('Validate getInitialServiceAndEnv method', () => {
    expect(getInitialServiceAndEnv(mockedFormikWithTemplatesData.values)).toEqual({
      environmentRef: '<+input>',
      serviceRef: '<+input>'
    })
  })

  test('Validate getInitialHealthSources method', () => {
    expect(getInitialHealthSources(mockedFormikWithTemplatesData.values)).toEqual([
      {
        identifier: 'Appd',
        spec: {
          applicationName: '<+input>',
          connectorRef: '<+input>',
          metricDefinitions: [
            {
              analysis: { deploymentVerification: { serviceInstanceMetricPath: '<+input>' } },
              completeMetricPath: '<+input>',
              identifier: 'appdMetric'
            }
          ],
          tierName: '<+input>'
        },
        type: 'AppDynamics'
      }
    ])
  })
})
