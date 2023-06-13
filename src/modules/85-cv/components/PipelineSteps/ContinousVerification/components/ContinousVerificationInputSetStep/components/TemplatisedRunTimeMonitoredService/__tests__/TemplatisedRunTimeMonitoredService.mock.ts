/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { AllowedTypesWithRunTime } from '@harness/uicore'
import type { VerifyStepMonitoredService } from '@cv/components/PipelineSteps/ContinousVerification/types'

const templateInputs = {
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

export const TemplatisedRunTimeMonitoredServiceMockProps = {
  prefix: 'stages[0].stage.spec.execution.steps[0].step.',
  expressions: [],
  allowableTypes: ['FIXED', 'EXPRESSION'] as AllowedTypesWithRunTime[],
  monitoredService: {
    type: 'Template',
    spec: {
      templateInputs
    }
  }
}
