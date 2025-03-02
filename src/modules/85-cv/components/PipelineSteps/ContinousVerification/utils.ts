/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { getMultiTypeFromValue, MultiTypeInputType, RUNTIME_INPUT_VALUE, SelectOption } from '@harness/uicore'
import { isEmpty, isNull, isUndefined, omit, omitBy, set } from 'lodash-es'
import { FormikErrors, yupToFormErrors } from 'formik'
import * as Yup from 'yup'
import type { UseStringsReturn } from 'framework/strings'
import { getDurationValidationSchema } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import type { HealthSourceTypes, UpdatedHealthSourceWithAllSpecs } from '@cv/pages/health-source/types'
import type { ConnectorInfoDTO, HealthSource } from 'services/cv'
import { healthSourceTypeMapping } from '@cv/pages/monitored-service/MonitoredServiceInputSetsTemplate/MonitoredServiceInputSetsTemplate.utils'
import { Scope } from '@common/interfaces/SecretsInterface'
import type { DeploymentStageElementConfig, StageElementWrapper } from '@pipeline/utils/pipelineTypes'
import type { ContinousVerificationData, spec, VerifyStepMonitoredService } from './types'
import {
  VerificationSensitivityOptions,
  durationOptions,
  baseLineOptions,
  trafficSplitPercentageOptions,
  SensitivityTypes,
  defaultMonitoredServiceSpec,
  monitoredServiceRefPath,
  extendedDurationOptions,
  V2_HEALTHSOURCES
} from './constants'
import { MONITORED_SERVICE_TYPE } from './components/ContinousVerificationWidget/components/ContinousVerificationWidgetSections/components/SelectMonitoredServiceType/SelectMonitoredServiceType.constants'
import { validateTemplateInputs } from './components/ContinousVerificationWidget/ContinousVerificationWidget.utils'
import {
  METRIC_DEFINITIONS,
  NEWRELIC_METRIC_DEFINITIONS,
  QUERIES,
  QUERY_DEFINITIONS,
  V2
} from './components/ContinousVerificationWidget/components/ContinousVerificationWidgetSections/components/SelectMonitoredServiceType/components/MonitoredServiceInputTemplatesHealthSources/MonitoredServiceInputTemplatesHealthSources.constants'
import { isAnExpression } from './components/ContinousVerificationWidget/components/ContinousVerificationWidgetSections/components/MonitoredService/MonitoredService.utils'

/**
 * checks if a field is a runtime input.
 * @param field
 * @returns boolean
 */
export function checkIfRunTimeInput(field: string | SelectOption | number | undefined): boolean {
  return getMultiTypeFromValue(field as string) === MultiTypeInputType.RUNTIME
}

/**
 * validates a particular field for errors.
 * @param fieldValue
 * @param fieldKey
 * @param data
 * @param errors
 * @param getString
 * @param isRequired
 */
export function validateField(
  fieldValue: string,
  fieldKey: string,
  data: ContinousVerificationData,
  errors: FormikErrors<ContinousVerificationData>,
  getString: UseStringsReturn['getString'],
  isRequired = true
): void {
  if (checkIfRunTimeInput(fieldValue) && isRequired && isEmpty(data?.spec?.spec && data?.spec?.spec[fieldKey])) {
    set(errors, `spec.spec.${fieldKey}`, getString('fieldRequired', { field: fieldKey }))
  }
}

export function validateMonitoredService(
  data: ContinousVerificationData,
  errors: FormikErrors<ContinousVerificationData>,
  getString: UseStringsReturn['getString'],
  isRequired: boolean,
  monitoredService?: VerifyStepMonitoredService
): void {
  if (
    checkIfRunTimeInput(monitoredService?.spec?.monitoredServiceRef) &&
    isRequired &&
    isEmpty(data?.spec?.monitoredService?.spec?.monitoredServiceRef)
  ) {
    set(errors, monitoredServiceRefPath, getString('fieldRequired', { field: 'Monitored service' }))
  }
}

export function validateMonitoredServiceTemplateInputs(
  data: ContinousVerificationData,
  errors: FormikErrors<ContinousVerificationData>,
  getString: UseStringsReturn['getString'],
  monitoredService?: VerifyStepMonitoredService
): void {
  if (monitoredService?.type === MONITORED_SERVICE_TYPE.TEMPLATE) {
    validateTemplateInputs(
      monitoredService?.spec?.templateInputs,
      data?.spec?.monitoredService?.spec?.templateInputs,
      errors,
      getString
    )
  }
}

/**
 * validates timeout field.
 * @param template
 * @param getString
 * @param data
 * @param errors
 */
export function validateTimeout(
  getString: UseStringsReturn['getString'],
  data: ContinousVerificationData,
  errors: any,
  template?: ContinousVerificationData,
  isRequired = true
): void {
  if (checkIfRunTimeInput(template?.timeout)) {
    let timeout: Yup.ObjectSchema
    if (isRequired) {
      timeout = Yup.object().shape({
        timeout: getDurationValidationSchema({ minimum: '10s' }).required(getString?.('validation.timeout10SecMinimum'))
      })
    } else {
      timeout = Yup.object().shape({
        timeout: getDurationValidationSchema({ minimum: '10s' })
      })
    }

    try {
      timeout.validateSync(data)
    } catch (e) {
      if (e instanceof Yup.ValidationError) {
        const err = yupToFormErrors(e)
        Object.assign(errors, err)
      }
    }
  }
}

/**
 * returns yaml data for spec field.
 * @param specInfo
 * @returns spec
 */
export function getSpecYamlData(specInfo?: spec, type?: string): spec {
  let validspec = omitBy(specInfo, v => isUndefined(v) || isNull(v) || v === '')
  switch (type) {
    case 'LoadTest':
      validspec = omit(validspec, ['trafficsplit'])
      break
    case 'Bluegreen':
    case 'Canary':
      validspec = omit(validspec, ['baseline'])
      break
    default:
      break
  }

  Object.keys(validspec).map((key: string) => {
    //TODO logic in if block will be removed once backend api is fixed : https://harness.atlassian.net/browse/CVNG-2481
    if (key === 'sensitivity') {
      validspec[key] = validspec[key].value
        ? SensitivityTypes[validspec[key].value as keyof typeof SensitivityTypes]
        : validspec[key]
    } else {
      validspec[key] = validspec[key].value ? validspec[key].value : validspec[key]
    }
  })

  return validspec
}

export function getMonitoredServiceYamlData(spec: ContinousVerificationData['spec']): VerifyStepMonitoredService {
  let monitoredService: VerifyStepMonitoredService = defaultMonitoredServiceSpec
  const monitoredServiceTemplateSpec = omit(spec?.monitoredService?.spec, ['monitoredServiceRef'])

  switch (spec?.monitoredService?.type) {
    case MONITORED_SERVICE_TYPE.DEFAULT:
      monitoredService = defaultMonitoredServiceSpec
      break
    case MONITORED_SERVICE_TYPE.CONFIGURED:
      monitoredService = {
        type: MONITORED_SERVICE_TYPE.CONFIGURED,
        spec: {
          monitoredServiceRef: getMonitoredServiceRef(spec)
        }
      }
      break
    case MONITORED_SERVICE_TYPE.TEMPLATE:
      monitoredService = {
        type: MONITORED_SERVICE_TYPE.TEMPLATE,
        spec: { ...monitoredServiceTemplateSpec }
      }
      break
    default:
      monitoredService = defaultMonitoredServiceSpec
  }
  return monitoredService
}

export function getMonitoredServiceRef(spec: ContinousVerificationData['spec']): string {
  return spec?.monitoredService?.spec?.monitoredServiceRef as string
}

/**
 * returns forms data for spec field.
 * @param specInfo
 * @returns spec
 */
export function getSpecFormData(specInfo: spec | undefined): spec {
  const validspec: spec | undefined = { ...specInfo }
  if (specInfo) {
    Object.keys(specInfo).map((key: string) => {
      switch (key) {
        case 'sensitivity':
          setFieldData(validspec, 'sensitivity', VerificationSensitivityOptions)
          break
        case 'duration':
          setFieldData(validspec, 'duration', [...durationOptions, ...extendedDurationOptions])
          break
        case 'baseline':
          setFieldData(validspec, 'baseline', baseLineOptions)
          break
        case 'trafficsplit':
          setFieldData(validspec, 'trafficsplit', trafficSplitPercentageOptions)
          break
        default:
      }
    })
  }
  return validspec
}

/**
 * sets particular field data
 * @param validspec
 * @param field
 * @param options
 */
export function setFieldData(validspec: spec | undefined, field: string, fieldOptions: SelectOption[]): void {
  //finding the complete option if the field is fixed input
  if (validspec && validspec[field] && validspec[field] !== RUNTIME_INPUT_VALUE && !isAnExpression(validspec[field])) {
    //TODO logic in if block will be removed once backend api is fixed : https://harness.atlassian.net/browse/CVNG-2481
    if (field === 'sensitivity') {
      validspec[field] = fieldOptions.find(
        (el: SelectOption) => SensitivityTypes[el.value as keyof typeof SensitivityTypes] === validspec[field]
      )
    } else {
      validspec[field] = fieldOptions.find((el: SelectOption) => el.value === validspec[field])
    }
  }
}

export function isDefaultMonitoredServiceAndServiceOrEnvRunTime(
  type: string,
  serviceIdentifierFromStage: string,
  envIdentifierDataFromStage: string
): boolean {
  return (
    (serviceIdentifierFromStage === RUNTIME_INPUT_VALUE || envIdentifierDataFromStage === RUNTIME_INPUT_VALUE) &&
    type === MONITORED_SERVICE_TYPE.DEFAULT
  )
}

export function isConfiguredMonitoredServiceRunTime(
  type: string,
  monitoredService?: VerifyStepMonitoredService
): boolean {
  return type === MONITORED_SERVICE_TYPE.CONFIGURED && checkIfRunTimeInput(monitoredService?.spec?.monitoredServiceRef)
}

export function isTemplatisedMonitoredService(type: string): boolean {
  return type === MONITORED_SERVICE_TYPE.TEMPLATE
}

export function doesHealthSourceHasQueries(healthSource: any): boolean {
  return healthSource?.spec?.queries !== undefined
}

export const getDurationOptions = (enableVerifyStepLongDuration?: boolean): SelectOption[] =>
  enableVerifyStepLongDuration ? [...durationOptions, ...extendedDurationOptions] : durationOptions

export const setCommaSeperatedList = (
  value: string,
  onChange: (field: string, value: any, shouldValidate?: boolean | undefined) => void,
  path: string
): void => {
  let actualValue: string | string[] = value
  const isFixedValue = getMultiTypeFromValue(value) === MultiTypeInputType.FIXED
  if (isFixedValue) {
    actualValue = value?.toString()?.split(',')
  }
  onChange?.(path, actualValue)
}

export const getMetricDefinitionData = (
  healthSource: UpdatedHealthSourceWithAllSpecs,
  path: string
): {
  metricDefinitions: unknown
  metricDefinitionInptsetFormPath: string
} => {
  const hasQueries = doesHealthSourceHasQueries(healthSource)
  const isNewRelicMetric = Boolean(healthSource?.spec?.newRelicMetricDefinitions)
  let metricDefinitions = []
  let metricDefinitionInptsetFormPath = null

  if (isHealthSourceVersionV2(healthSource)) {
    metricDefinitions = healthSource?.spec?.queryDefinitions || []
    metricDefinitionInptsetFormPath = `${path}.${QUERY_DEFINITIONS}`
  } else {
    metricDefinitions = hasQueries
      ? healthSource?.spec?.queries
      : healthSource?.spec?.metricDefinitions || healthSource?.spec?.newRelicMetricDefinitions || []

    metricDefinitionInptsetFormPath = `${path}.${
      hasQueries ? QUERIES : isNewRelicMetric ? NEWRELIC_METRIC_DEFINITIONS : METRIC_DEFINITIONS
    }`
  }

  return { metricDefinitions, metricDefinitionInptsetFormPath }
}

export function showQueriesText(healthSource: any): boolean {
  return doesHealthSourceHasQueries(healthSource) || isHealthSourceVersionV2(healthSource)
}

export function isHealthSourceVersionV2(healthSource: HealthSource): boolean {
  return healthSource?.version === V2
}

export function enrichHealthSourceWithVersionForHealthsourceType(
  healthSource: UpdatedHealthSourceWithAllSpecs
): UpdatedHealthSourceWithAllSpecs {
  let updatedHealthSource = { ...healthSource }
  if (V2_HEALTHSOURCES.includes(healthSource?.type as HealthSourceTypes)) {
    updatedHealthSource = { ...healthSource, version: V2 }
  }
  return updatedHealthSource
}

export function getSourceTypeForConnector(healthSource: HealthSource): ConnectorInfoDTO['type'] | undefined {
  return healthSourceTypeMapping(healthSource?.type as HealthSourceTypes) as ConnectorInfoDTO['type']
}

export function shouldRenderField(input: { name: string; path: string }): boolean {
  return (
    input.name !== METRIC_DEFINITIONS &&
    input.name !== QUERIES &&
    input.name !== QUERY_DEFINITIONS &&
    input.name !== NEWRELIC_METRIC_DEFINITIONS
  )
}
export function getScopedIdentifier(templateScope: string | undefined, identifier: string): string {
  return templateScope !== Scope.PROJECT ? `${templateScope}.${identifier}` : identifier
}

export const getIsMultiServiceOrEnvs = (
  selectedStage: StageElementWrapper<DeploymentStageElementConfig> | undefined
): boolean => {
  const services = selectedStage?.stage?.spec?.services?.values || []
  const envs = selectedStage?.stage?.spec?.environments?.values || []
  return Boolean(services.length || envs.length)
}
