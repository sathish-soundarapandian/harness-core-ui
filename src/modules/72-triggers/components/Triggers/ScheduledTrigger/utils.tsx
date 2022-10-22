/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { object, ObjectSchema, string } from 'yup'
import { isEmpty } from 'lodash-es'
import { illegalIdentifiers, regexIdentifier } from '@common/utils/StringUtils'
import { isCronValid } from '@triggers/components/steps/SchedulePanel/components/utils'
import type { StringKeys, UseStringsReturn } from 'framework/strings'
import type { NGTriggerSourceV2, PipelineInfoConfig } from 'services/pipeline-ng'
import type { PanelInterface } from '@triggers/components/TabWizard/TabWizard'
import type { ScheduleType, TriggerBaseType } from '../TriggerInterface'

export interface ScheduledInitialValuesInterface {
  triggerType: TriggerBaseType
  scheduleType: ScheduleType
}

export interface FlatInitialValuesInterface {
  triggerType: NGTriggerSourceV2['type']
  identifier?: string
  tags?: {
    [key: string]: string
  }
  pipeline?: string | PipelineInfoConfig
  originalPipeline?: PipelineInfoConfig
  resolvedPipeline?: PipelineInfoConfig
  inputSetTemplateYamlObj?: {
    pipeline: PipelineInfoConfig | Record<string, never>
  }
  name?: string
  selectedScheduleTab?: string
  pipelineBranchName?: string
  inputSetRefs?: string[]
}

export interface FlatOnEditValuesInterface {
  name?: string
  identifier?: string
  // targetIdentifier: string
  description?: string
  tags?: {
    [key: string]: string
  }
  pipeline?: PipelineInfoConfig
  triggerType: NGTriggerSourceV2['type']
  manifestType?: string
  artifactType?: string
  originalPipeline?: PipelineInfoConfig
  resolvedPipeline?: PipelineInfoConfig
  selectedScheduleTab?: string
  minutes?: string
  expression?: string
  stageId?: string
  inputSetTemplateYamlObj?: {
    pipeline: PipelineInfoConfig | Record<string, never>
  }
  versionValue?: string
  versionOperator?: string
  buildValue?: string
  buildOperator?: string
  pipelineBranchName?: string
  inputSetRefs?: string[]
}

export interface FlatValidScheduleFormikValuesInterface {
  name: string
  identifier: string
  description?: string
  tags?: {
    [key: string]: string
  }
  target?: string
  targetIdentifier?: string
  pipeline: PipelineInfoConfig
  resolvedPipeline?: PipelineInfoConfig
  sourceRepo: string
  triggerType: NGTriggerSourceV2['type']
  expression: string
  pipelineBranchName?: string
  inputSetRefs?: string[]
}

const isIdentifierIllegal = (identifier: string): boolean =>
  regexIdentifier.test(identifier) && illegalIdentifiers.includes(identifier)

const checkValidOverview = ({ formikValues }: { formikValues: { [key: string]: any } }): boolean =>
  isIdentifierIllegal(formikValues?.identifier) ? false : true

const checkValidCronExpression = ({ formikValues }: { formikValues: { [key: string]: any } }): boolean =>
  isCronValid(formikValues?.expression || '')

const checkValidPipelineInput = ({ formikErrors }: { formikErrors: { [key: string]: any } }): boolean => {
  if (!isEmpty(formikErrors?.pipeline) || !isEmpty(formikErrors?.stages)) {
    return false
  }
  return true
}

export const getPanels = (getString: UseStringsReturn['getString']): PanelInterface[] | [] => {
  return [
    {
      id: 'Trigger Overview',
      tabTitle: getString('overview'),
      checkValidPanel: checkValidOverview,
      requiredFields: ['name', 'identifier'] // conditional required validations checkValidTriggerConfiguration
    },
    {
      id: 'Schedule',
      tabTitle: getString('common.schedule'),
      checkValidPanel: checkValidCronExpression,
      requiredFields: ['expression']
    },
    {
      id: 'Pipeline Input',
      tabTitle: getString('triggers.pipelineInputLabel'),
      checkValidPanel: checkValidPipelineInput
    }
  ]
}

export const getValidationSchema = (
  getString: (key: StringKeys, params?: any) => string
): ObjectSchema<Record<string, any> | undefined> => {
  return object().shape({
    name: string().trim().required(getString('triggers.validation.triggerName')),
    identifier: string().when('name', {
      is: val => val?.length,
      then: string()
        .required(getString('validation.identifierRequired'))
        .matches(regexIdentifier, getString('validation.validIdRegex'))
        .notOneOf(illegalIdentifiers)
    }),
    expression: string().test(
      getString('triggers.validation.cronExpression'),
      getString('triggers.validation.cronExpression'),
      function (expression) {
        return isCronValid(expression || '')
      }
    )
  })
}
