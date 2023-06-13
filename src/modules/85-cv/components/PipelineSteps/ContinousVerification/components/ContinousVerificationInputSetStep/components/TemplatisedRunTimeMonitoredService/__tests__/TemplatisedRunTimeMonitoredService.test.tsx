/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { AllowedTypesWithRunTime, Button, Container } from '@harness/uicore'
import * as formik from 'formik'
import * as FeatureFlag from '@common/hooks/useFeatureFlag'
import { TestWrapper } from '@common/utils/testUtils'

import type {
  MonitoredServiceTemplateVariable,
  VerifyStepMonitoredService
} from '@cv/components/PipelineSteps/ContinousVerification/types'
import TemplatisedRunTimeMonitoredService, {
  TemplatisedRunTimeMonitoredServiceProps
} from '../TemplatisedRunTimeMonitoredService'
import { TemplatisedRunTimeMonitoredServiceMockProps } from './TemplatisedRunTimeMonitoredService.mock'
import { ServiceEnvironmentInputSetWrapper } from '../components/ServiceEnvironmentInputSetWrapper/ServiceEnvironmentInputSetWrapper'

const WrapperComponent = (props: TemplatisedRunTimeMonitoredServiceProps): JSX.Element => {
  return (
    <TestWrapper>
      <TemplatisedRunTimeMonitoredService {...props} />
    </TestWrapper>
  )
}

jest.mock(
  '@cv/pages/monitored-service/components/Configurations/components/Service/components/MonitoredServiceOverview/component/OrgAccountLevelServiceEnvField/OrgAccountLevelServiceEnvField',
  () => ({
    __esModule: true,
    default: (props: any) => (
      <Container data-testid="OrgAccountLevelServiceEnvField">
        <Button
          onClick={() => props?.serviceOnSelect({ label: 'newService', value: 'newService' })}
          title="On Service Select"
        />
        <Button
          onClick={() => props?.environmentOnSelect({ label: 'newEnv', value: 'newEnv' })}
          title="On Environment Select"
        />
      </Container>
    )
  })
)

jest.mock('@cv/components/HarnessServiceAndEnvironment/HarnessServiceAndEnvironment', () => {
  const HarnessServiceAndEnvironmentOriginal = jest.requireActual(
    '@cv/components/HarnessServiceAndEnvironment/HarnessServiceAndEnvironment'
  )
  return {
    ...HarnessServiceAndEnvironmentOriginal,
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
  }
})

describe('Unit tests for TemplatisedRunTimeMonitoredService', () => {
  const useFormikContextMock = jest.spyOn(formik, 'useFormikContext')

  beforeEach(() => {
    useFormikContextMock.mockReturnValue({
      setFieldValue: jest.fn()
    } as unknown as any)
  })

  test('Verify if correct runtime fields are rendered in runtime screen of templatised monitored service', async () => {
    const props = {
      prefix:
        'template.templateInputs.stages[0].stage.template.templateInputs.spec.execution.steps[0].step.template.templateInputs.',
      monitoredService: {
        type: 'Template',
        spec: {
          templateInputs: {
            type: 'MonitoredService',
            serviceRef: '<+input>',
            environmentRef: '<+input>',
            sources: {
              healthSources: [
                {
                  identifier: 'AppD_temp',
                  type: 'AppDynamics',
                  spec: {
                    applicationName: '<+input>',
                    tierName: '<+input>'
                  }
                }
              ]
            }
          } as VerifyStepMonitoredService['spec']['templateInputs']
        }
      },
      expressions: ['org.identifier', 'org.name'],
      allowableTypes: ['FIXED', 'RUNTIME', 'EXPRESSION'] as AllowedTypesWithRunTime[]
    }
    jest.spyOn(FeatureFlag, 'useFeatureFlags').mockReturnValue({
      CDS_OrgAccountLevelServiceEnvEnvGroup: false
    })
    const { getByText } = render(<WrapperComponent {...props} />)
    expect(getByText('cv.healthSource.serviceLabel')).toBeInTheDocument()
    expect(getByText('cv.healthSource.environmentLabel')).toBeInTheDocument()
    expect(getByText('pipeline.applicationName')).toBeInTheDocument()
    expect(getByText('cv.monitoringSources.appD.tierName')).toBeInTheDocument()
  })

  test('Verify if correct runtime fields are rendered in runtime screen of templatised monitored service when healthsource,  metric definitions and variables are also present', async () => {
    const props = {
      prefix: 'stages[0].stage.spec.execution.steps[0].step.',
      expressions: [],
      allowableTypes: ['FIXED', 'EXPRESSION'] as AllowedTypesWithRunTime[],
      monitoredService: {
        type: 'Template',
        spec: {
          templateInputs: {
            type: 'Application',
            serviceRef: '<+input>',
            environmentRef: '<+input>',
            sources: {
              healthSources: [
                {
                  identifier: 'AddD_Health_source',
                  type: 'AppDynamics',
                  spec: {
                    applicationName: '<+input>',
                    tierName: '<+input>',
                    metricDefinitions: [
                      {
                        identifier: 'appdMetric',
                        completeMetricPath: '<+input>',
                        analysis: {
                          deploymentVerification: {
                            serviceInstanceMetricPath: '<+input>'
                          }
                        }
                      }
                    ]
                  }
                }
              ]
            },
            variables: [
              {
                name: 'connectorRef',
                type: 'String',
                value: '<+input>'
              }
            ]
          } as VerifyStepMonitoredService['spec']['templateInputs']
        }
      }
    }
    jest.spyOn(FeatureFlag, 'useFeatureFlags').mockReturnValue({
      CDS_OrgAccountLevelServiceEnvEnvGroup: false
    })
    const { getByText } = render(<WrapperComponent {...props} />)
    expect(getByText('cv.healthSource.serviceLabel')).toBeInTheDocument()
    expect(getByText('cv.healthSource.environmentLabel')).toBeInTheDocument()
    expect(getByText('pipeline.applicationName')).toBeInTheDocument()
    expect(getByText('cv.monitoringSources.appD.tierName')).toBeInTheDocument()
    expect(getByText('cv.monitoringSources.appD.completeMetricPath')).toBeInTheDocument()
    expect(getByText('cv.monitoringSources.appD.serviceInstanceMetricPath')).toBeInTheDocument()
    for (const variable of props.monitoredService.spec.templateInputs
      ?.variables as MonitoredServiceTemplateVariable[]) {
      expect(getByText(variable.name)).toBeInTheDocument()
    }
  })

  test('Verify if correct runtime fields are rendered in runtime screen of templatised monitored service when CDS_OrgAccountLevelServiceEnvEnvGroup is true', async () => {
    jest.spyOn(FeatureFlag, 'useFeatureFlags').mockReturnValue({
      CDS_OrgAccountLevelServiceEnvEnvGroup: true
    })
    const { container, getByText } = render(<WrapperComponent {...TemplatisedRunTimeMonitoredServiceMockProps} />)
    expect(getByText('cv.monitoredServices.serviceAndEnvironment')).toBeInTheDocument()
    expect(container.querySelector('[title="On Service Select"]')).toBeInTheDocument()
    expect(container.querySelector('[title="On Environment Select"]')).toBeInTheDocument()
    expect(getByText('pipeline.applicationName')).toBeInTheDocument()
    expect(getByText('cv.monitoringSources.appD.tierName')).toBeInTheDocument()
    expect(getByText('cv.monitoringSources.appD.completeMetricPath')).toBeInTheDocument()
    expect(getByText('cv.monitoringSources.appD.serviceInstanceMetricPath')).toBeInTheDocument()
    for (const variable of TemplatisedRunTimeMonitoredServiceMockProps.monitoredService.spec.templateInputs
      ?.variables as MonitoredServiceTemplateVariable[]) {
      expect(getByText(variable.name)).toBeInTheDocument()
    }
  })

  test('Verify if correct runtime fields are rendered in runtime screen of templatised monitored service when CDS_OrgAccountLevelServiceEnvEnvGroup is true and Service/Env are not runtime', async () => {
    jest.spyOn(FeatureFlag, 'useFeatureFlags').mockReturnValue({
      CDS_OrgAccountLevelServiceEnvEnvGroup: true
    })
    const { container, getByTestId } = render(
      <TestWrapper>
        <ServiceEnvironmentInputSetWrapper
          prefix={''}
          onChange={jest.fn()}
          serviceRef={'Service 1'}
          environmentRef={'Environment 1'}
        />
      </TestWrapper>
    )
    expect(getByTestId('OrgAccountLevelServiceEnvField')).toBeInTheDocument()
    expect(container.querySelector('[title="On Service Select"]')).toBeInTheDocument()
    expect(container.querySelector('[title="On Environment Select"]')).toBeInTheDocument()
  })
})
