/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { object, ObjectSchema, string } from 'yup'
import { illegalIdentifiers, regexIdentifier } from '@common/utils/StringUtils'
import type { PipelineInfoConfig } from 'services/pipeline-ng'
import { isCronValid, scheduleTabsId } from '../components/utils'

interface TriggerOverviewPanelPropsInterface {
  formikProps?: any
  isEdit?: boolean
}

export const TriggerTypes = {
  WEBHOOK: 'Webhook',
  NEW_ARTIFACT: 'NewArtifact',
  SCHEDULE: 'Scheduled',
  MANIFEST: 'Manifest',
  ARTIFACT: 'Artifact'
}

export const originalPipeline = {
  name: 'pipeline-1',
  identifier: 'pipeline1',
  description: 'test',
  tags: undefined,
  stages: [
    {
      stage: {
        name: 's1',
        identifier: 's1',
        description: '',
        type: 'Deployment',
        spec: {
          service: {
            identifier: 'service1',
            name: 'service-1',
            description: '',
            serviceDefinition: {
              type: 'Kubernetes',
              spec: {
                artifacts: {
                  sidecars: []
                },
                manifests: [],
                artifactOverrideSets: [],
                manifestOverrideSets: []
              }
            },
            tags: null
          },
          infrastructure: {
            environment: {
              name: 'env1',
              identifier: 'env1',
              description: null,
              type: 'PreProduction'
            },
            infrastructureDefinition: {}
          },
          execution: {
            steps: [
              {
                step: {
                  name: 'Rollout Deployment',
                  identifier: 'rolloutDeployment',
                  type: 'K8sRollingDeploy',
                  spec: {
                    timeout: '10m',
                    skipDryRun: false
                  }
                }
              }
            ],
            rollbackSteps: [
              {
                step: {
                  name: 'Rollback Rollout Deployment',
                  identifier: 'rollbackRolloutDeployment',
                  type: 'K8sRollingRollback',
                  spec: {
                    timeout: '10m'
                  }
                }
              }
            ]
          }
        }
      }
    }
  ]
}

export const getMockTriggerConfigValues = ({
  identifier,
  expression,
  selectedScheduleTab = scheduleTabsId.MINUTES,
  amPm = 'AM',
  dayOfMonth = '*',
  dayOfWeek = [],
  hours = '*',
  minutes = '5',
  month = '*'
}: {
  identifier?: string
  expression?: string
  selectedScheduleTab?: string
  amPm?: string
  dayOfMonth?: string
  dayOfWeek?: string[]
  hours?: string
  minutes?: string
  month?: string
}): {
  identifier: string
  triggerType: string
  originalPipeline: PipelineInfoConfig
  expression: string | undefined
  selectedScheduleTab: string
  amPm: string
  dayOfMonth: string
  dayOfWeek: string[]
  hours: string
  minutes: string
  month: string
  pipeline: PipelineInfoConfig
} => ({
  identifier: identifier || '',
  triggerType: 'Scheduled',
  originalPipeline,
  expression,
  selectedScheduleTab: selectedScheduleTab,
  amPm,
  dayOfMonth,
  dayOfWeek,
  hours,
  minutes,
  month,
  pipeline: originalPipeline
})

export const getMockTriggerConfigDefaultProps = ({
  isEdit = false
}: {
  isEdit?: boolean
}): TriggerOverviewPanelPropsInterface => ({
  isEdit
})

export const getMockScheduleValidationSchema = (): ObjectSchema<Record<string, any> | undefined> => {
  // Scheduled
  return object().shape({
    name: string().trim().required('triggers.validation.triggerName'),
    identifier: string().when('name', {
      is: val => val?.length,
      then: string()
        .required('validation.identifierRequired')
        .matches(regexIdentifier, 'validation.validIdRegex')
        .notOneOf(illegalIdentifiers)
    }),
    expression: string().test(
      'triggers.validation.cronExpression',
      'triggers.validation.cronExpression',
      function (expression) {
        return isCronValid(expression || '')
      }
    )
  })
}
