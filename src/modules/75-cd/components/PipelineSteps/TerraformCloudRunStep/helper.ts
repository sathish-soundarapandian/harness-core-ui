/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { getMultiTypeFromValue, MultiTypeInputType, SelectOption } from '@harness/uicore'
import { v4 as uuid } from 'uuid'
import * as Yup from 'yup'
import { defaultTo, flatMap, isEmpty, omit, get } from 'lodash-es'
import type { UseStringsReturn } from 'framework/strings'
import { getDurationValidationSchema } from '@common/components/MultiTypeDuration/helper'
import type { ListType } from '@common/components/List/List'
import { IdentifierSchemaWithOutName } from '@common/utils/Validation'
import { getNameAndIdentifierSchema } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import type { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { isMultiTypeRuntime } from '@common/utils/utils'
import { getConnectorSchema, getValue } from '../PipelineStepsUtil'
import type { TerraformCloudRunFormData } from './types'

export const runTypeLabel = 'pipeline.terraformStep.runTypeLabel'
export const organizationLabel = 'orgLabel'
export const workspaceLabel = 'pipeline.terraformStep.workspaceName'
export const errorMessage = 'data.message'

const getEntries = function <T>(object: T, prefix = ''): Array<any> {
  return flatMap(Object.entries(object), ([k, v]: { k: string; v: any }[]) =>
    Object(v) === v ? getEntries(v, `${prefix}${k}.`) : [[`${prefix}${k}`, v]]
  )
}

export function getSanitizedflatObjectForVariablesView(object: Record<string, any>): Record<string, unknown> {
  // Omits 'name' , 'identifier' and 'timeout' values to avoid redundancy since they are already taken care of.
  const sanitizedObject = omit(object, ['name', 'timeout', 'identifier'])
  return getEntries(sanitizedObject).reduce((o, k) => ((o[k[0]] = k[1]), o), {})
}

export enum RunTypes {
  RefreshState = 'RefreshState',
  PlanOnly = 'PlanOnly',
  PlanAndApply = 'PlanAndApply',
  PlanAndDestroy = 'PlanAndDestroy',
  Plan = 'Plan',
  Apply = 'Apply'
}

export const variableTypes: SelectOption[] = [
  { label: 'String', value: 'String' },
  { label: 'Number', value: 'Number' },
  { label: 'Secret', value: 'Secret' }
]

export const processFormData = (values: TerraformCloudRunFormData): TerraformCloudRunFormData => {
  const specValues = values.spec?.spec
  const { workspace, organization, variables, provisionerIdentifier } = defaultTo(specValues, {})

  const targets = specValues?.targets as MultiTypeInputType
  const targetMap: ListType = []
  if (Array.isArray(targets)) {
    targets.forEach(target => {
      if (target.value) {
        targetMap.push(target.value)
      }
    })
  }

  const varMap: any = []
  if (Array.isArray(variables)) {
    variables.forEach(mapValue => {
      if (mapValue.value) {
        varMap.push({
          name: mapValue.key,
          value: mapValue.value,
          type: 'String'
        })
      }
    })
  }

  if (get(values.spec, 'runType') === RunTypes.Apply) {
    return {
      ...values,
      spec: {
        runType: values.spec?.runType,
        spec: {
          provisionerIdentifier: provisionerIdentifier
        }
      }
    }
  } else {
    return {
      ...values,
      spec: {
        ...values.spec,
        spec: {
          ...specValues,
          organization: getValue(organization),
          workspace: getValue(workspace),
          variables: varMap,
          targets: isMultiTypeRuntime(getMultiTypeFromValue(targets)) ? targets : targetMap
        }
      }
    }
  }
}

export const processInitialValues = (values: TerraformCloudRunFormData): TerraformCloudRunFormData => {
  const specValues = values.spec?.spec
  const { workspace, organization, variables, targets, discardPendingRuns, overridePolicies } = defaultTo(
    specValues,
    {}
  )
  const isVarRunTime = getMultiTypeFromValue(variables as any) === MultiTypeInputType.RUNTIME
  return {
    ...values,
    spec: {
      ...values.spec,
      spec: {
        ...specValues,
        organization:
          organization && getMultiTypeFromValue(organization) === MultiTypeInputType.FIXED
            ? {
                label: organization.toString(),
                value: organization.toString()
              }
            : organization,
        workspace:
          workspace && getMultiTypeFromValue(workspace) === MultiTypeInputType.FIXED
            ? {
                label: workspace.toString(),
                value: workspace.toString()
              }
            : workspace,
        variables: !isVarRunTime
          ? Array.isArray(variables)
            ? variables.map(variable => ({
                key: defaultTo(variable.name, ''),
                value: variable.value,
                id: uuid()
              }))
            : [{ key: '', value: '', id: uuid() }]
          : variables,
        discardPendingRuns: defaultTo(discardPendingRuns, false),
        ...((get(values.spec, 'runType') === RunTypes.PlanAndApply ||
          get(values.spec, 'runType') === RunTypes.PlanAndDestroy) && {
          overridePolicies: defaultTo(overridePolicies, false)
        }),
        targets: !(getMultiTypeFromValue(targets as string) === MultiTypeInputType.RUNTIME)
          ? Array.isArray(targets)
            ? (targets as string[]).map((target: string) => ({
                value: target,
                id: uuid()
              }))
            : [{ value: '', id: uuid() }]
          : targets
      }
    }
  }
}

export function getValidationSchema(
  getString: UseStringsReturn['getString'],
  stepViewType?: StepViewType
): Yup.ObjectSchema {
  return Yup.object().shape({
    ...getNameAndIdentifierSchema(getString, stepViewType),
    timeout: getDurationValidationSchema({ minimum: '10s' }).required(getString('validation.timeout10SecMinimum')),
    spec: Yup.object().shape({
      runType: Yup.string().required(getString('common.validation.fieldIsRequired', { name: getString(runTypeLabel) })),
      spec: Yup.object()
        .when('runType', {
          is: val => !isEmpty(val) && val !== RunTypes.Apply,
          then: Yup.object().shape({
            connectorRef: getConnectorSchema(getString),
            organization: Yup.lazy((value): Yup.Schema<unknown> => {
              if (typeof value === 'string') {
                return Yup.string().required(
                  getString('common.validation.fieldIsRequired', { name: getString(organizationLabel) })
                )
              }
              return Yup.object().test({
                test(valueObj: SelectOption): boolean | Yup.ValidationError {
                  if (isEmpty(valueObj) || isEmpty(valueObj.value)) {
                    return this.createError({
                      message: getString('common.validation.fieldIsRequired', { name: getString(organizationLabel) })
                    })
                  }
                  return true
                }
              })
            }),
            workspace: Yup.lazy((value): Yup.Schema<unknown> => {
              if (typeof value === 'string') {
                return Yup.string().required(
                  getString('common.validation.fieldIsRequired', { name: getString(workspaceLabel) })
                )
              }
              return Yup.object().test({
                test(valueObj: SelectOption): boolean | Yup.ValidationError {
                  if (isEmpty(valueObj) || isEmpty(valueObj.value)) {
                    return this.createError({
                      message: getString('common.validation.fieldIsRequired', { name: getString(workspaceLabel) })
                    })
                  }
                  return true
                }
              })
            })
          })
        })
        .when('runType', {
          is: val => val !== RunTypes.RefreshState,
          then: Yup.object().shape({
            provisionerIdentifier: Yup.lazy((value): Yup.Schema<unknown> => {
              if (getMultiTypeFromValue(value as any) === MultiTypeInputType.FIXED) {
                return IdentifierSchemaWithOutName(getString, {
                  requiredErrorMsg: getString('common.validation.provisionerIdentifierIsRequired'),
                  regexErrorMsg: getString('common.validation.provisionerIdentifierPatternIsNotValid')
                })
              }
              return Yup.string().required(getString('common.validation.provisionerIdentifierIsRequired'))
            })
          })
        })
        .when('runType', {
          is: val => val === RunTypes.PlanOnly || val === RunTypes.Plan,
          then: Yup.object().shape({
            planType: Yup.mixed().required(
              getString('common.validation.fieldIsRequired', {
                name: getString('commandLabel')
              })
            )
          })
        })
    })
  })
}
