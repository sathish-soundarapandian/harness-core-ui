/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { RUNTIME_INPUT_VALUE } from '@harness/uicore'
import type { FormikErrors, FormikProps } from 'formik'
import { isEmpty, set } from 'lodash-es'
import {
  getValidationLabelByNameForTemplateInputs,
  getNestedFields
} from '@cv/pages/monitored-service/CVMonitoredService/MonitoredServiceInputSetsTemplate.utils'
import type { StringKeys } from 'framework/strings'
import type { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import type { MonitoredServiceDTO } from 'services/cv'
import type {
  ContinousVerificationData,
  MonitoredServiceTemplateVariable,
  spec,
  VerifyStepMonitoredService
} from '../../types'
import {
  isAnExpression,
  isFirstTimeOpenForDefaultMonitoredSvc
} from './components/ContinousVerificationWidgetSections/components/MonitoredService/MonitoredService.utils'
import { MONITORED_SERVICE_TYPE } from './components/ContinousVerificationWidgetSections/components/SelectMonitoredServiceType/SelectMonitoredServiceType.constants'
import {
  METRIC_DEFINITIONS,
  NEWRELIC_METRIC_DEFINITIONS,
  QUERIES,
  QUERY_DEFINITIONS
} from './components/ContinousVerificationWidgetSections/components/SelectMonitoredServiceType/components/MonitoredServiceInputTemplatesHealthSources/MonitoredServiceInputTemplatesHealthSources.constants'

export function healthSourcesValidation(
  monitoredServiceRef: string | undefined,
  healthSources: { identifier: string }[] | undefined,
  spec: any,
  getString: (key: StringKeys) => string,
  errors: FormikErrors<ContinousVerificationData>
): any {
  if (
    monitoredServiceRef !== RUNTIME_INPUT_VALUE &&
    !isAnExpression(monitoredServiceRef as string) &&
    monitoredServiceRef &&
    !healthSources?.length
  ) {
    spec = {
      ...spec,
      healthSources: getString('connectors.cdng.validations.healthSourceRequired')
    }
    errors['spec'] = spec
  }
  return spec
}

export function monitoredServiceRefValidation(
  monitoredServiceRef: string | undefined,
  spec: any,
  errors: FormikErrors<ContinousVerificationData>
): any {
  if (!monitoredServiceRef) {
    spec = {
      ...spec,
      monitoredServiceRef: 'Monitored service is required'
    }
    errors['spec'] = spec
  }
  return spec
}

export function configuredMonitoredServiceRefValidation(
  monitoredServiceRef: string | undefined,
  spec: any,
  errors: FormikErrors<ContinousVerificationData>
): any {
  if (!monitoredServiceRef) {
    spec = {
      ...spec,
      monitoredService: {
        spec: {
          monitoredServiceRef: 'Monitored service is required'
        }
      }
    }
    errors['spec'] = spec
  }
  return spec
}

export function templatisedMonitoredServiceValidation(
  monitoredServiceTemplateRef: string | undefined,
  spec: any,
  errors: FormikErrors<ContinousVerificationData>
): any {
  if (!monitoredServiceTemplateRef) {
    spec = {
      ...spec,
      monitoredService: {
        type: 'Template Selection is required.'
      }
    }
    errors['spec'] = spec
  }
  return spec
}

export function getMonitoredServiceRefFromType(
  monitoredService: VerifyStepMonitoredService,
  type: string,
  formData: ContinousVerificationData
): string {
  let monitoredServiceRef = monitoredService?.spec?.monitoredServiceRef as string
  if (type === MONITORED_SERVICE_TYPE.DEFAULT) {
    monitoredServiceRef = formData?.spec?.monitoredServiceRef as string
  }
  return monitoredServiceRef
}

export function validateMonitoredService(
  type: string,
  stepViewType: StepViewType | undefined,
  monitoredServiceRef: string,
  errors: FormikErrors<ContinousVerificationData>,
  healthSources: { identifier: string }[],
  getString: (key: StringKeys) => string,
  monitoredServiceTemplateRef: string,
  templateInputsToValidate: unknown,
  templateInputs: unknown
): FormikErrors<ContinousVerificationData> {
  let spec = {}
  // no validation for default monitored service when stepViewType is Template
  if (type === MONITORED_SERVICE_TYPE.DEFAULT && stepViewType !== 'Template') {
    spec = monitoredServiceRefValidation(monitoredServiceRef, spec, errors)
    spec = healthSourcesValidation(monitoredServiceRef, healthSources, spec, getString, errors)
  } else if (type === MONITORED_SERVICE_TYPE.CONFIGURED) {
    spec = configuredMonitoredServiceRefValidation(monitoredServiceRef, spec, errors)
    spec = healthSourcesValidation(monitoredServiceRef, healthSources, spec, getString, errors)
  } else if (type === MONITORED_SERVICE_TYPE.TEMPLATE) {
    templatisedMonitoredServiceValidation(monitoredServiceTemplateRef, spec, errors)
    validateTemplateInputs(templateInputsToValidate, templateInputs, errors, getString)
  }
  return errors
}

export function validateTemplateInputs(
  templateInputsToValidate: any,
  templateInputs: any,
  errors: FormikErrors<ContinousVerificationData>,
  getString: (key: StringKeys) => string
): void {
  Object.keys(templateInputsToValidate).map(key => {
    if (shouldValidateTemplateInputs(templateInputsToValidate, key, templateInputs)) {
      set(
        errors,
        `spec.monitoredService.spec.templateInputs.${key}`,
        `${getValidationLabelByNameForTemplateInputs(key, getString)}`
      )
    } else if (shouldValidateVariables(templateInputsToValidate, key)) {
      validateHealthSourceVariables(templateInputsToValidate, key, templateInputs, errors)
    } else if (shouldValidateHealthSources(templateInputsToValidate, key)) {
      validateTemplateInputsHealthSources(templateInputsToValidate, key, templateInputs, errors, getString)
    }
  })
}

export function shouldValidateVariables(templateInputsToValidate: any, key: string): boolean {
  return templateInputsToValidate[key] !== 'object' && key === 'variables' && templateInputsToValidate[key].length
}

export function validateHealthSourceVariables(
  templateInputsToValidate: any,
  key: string,
  templateInputs: any,
  errors: FormikErrors<ContinousVerificationData>
): void {
  templateInputsToValidate[key].forEach((variable: MonitoredServiceTemplateVariable, index: number) => {
    const actualVariables = templateInputs[key]
    const actualVariable = actualVariables?.length ? actualVariables[index] : null
    if (!actualVariable?.value) {
      set(errors, `spec.monitoredService.spec.templateInputs.variables.${index}.value`, `${variable?.name} is required`)
    }
  })
}

export function shouldValidateHealthSources(templateInputsToValidate: any, key: string): boolean {
  return (
    templateInputsToValidate[key] !== 'object' &&
    key === 'sources' &&
    templateInputsToValidate[key]?.healthSources &&
    templateInputsToValidate[key]?.healthSources?.length
  )
}

export function validateTemplateInputsHealthSources(
  templateInputsToValidate: any,
  key: string,
  templateInputs: any,
  errors: FormikErrors<ContinousVerificationData>,
  getString: (key: StringKeys) => string
): void {
  const healthSourcesToValidate = templateInputsToValidate[key]?.healthSources
  healthSourcesToValidate.forEach((healthSource: any, index: number) => {
    const actualHealthSources = templateInputs[key]?.healthSources || []
    const actualHealthSource = actualHealthSources?.length ? actualHealthSources[index] : null
    const metricDefinitionsKey = getMetricDefinitionsKey(healthSource)
    Object.keys(healthSource?.spec).map(healthSourceKey => {
      const path = `sources.healthSources.${index}.spec`
      if (healthSourceKey === metricDefinitionsKey) {
        const metricDefinitionsToValidate = healthSource?.spec[metricDefinitionsKey]
        const actualMetricDefinitionsToValidate = actualHealthSource?.spec[metricDefinitionsKey]
        if (metricDefinitionsToValidate.length) {
          validateMetricDefinitions(
            metricDefinitionsToValidate,
            actualMetricDefinitionsToValidate,
            path,
            errors,
            getString,
            metricDefinitionsKey
          )
        }
      } else if (!actualHealthSource?.spec[healthSourceKey]) {
        set(
          errors,
          `spec.monitoredService.spec.templateInputs.${path}.${healthSourceKey}`,
          `${getValidationLabelByNameForTemplateInputs(healthSourceKey, getString)}`
        )
      }
    })
  })
}

export function validateMetricDefinitions(
  metricDefinitionsToValidate: any,
  actualMetricDefinitionsToValidate: any,
  path: string,
  errors: FormikErrors<ContinousVerificationData>,
  getString: (key: StringKeys) => string,
  metricDefinitionsKey: string
): void {
  metricDefinitionsToValidate.forEach((metricDefinition: any, idx: number) => {
    const actualMetricDefinition = actualMetricDefinitionsToValidate[idx]
    const metricDefinitionFields = getNestedFields(metricDefinition, [], `${path}.${metricDefinitionsKey}.${idx}`)
    const actualMetricDefinitionFields = getNestedFields(
      actualMetricDefinition,
      [],
      `${path}.${metricDefinitionsKey}.${idx}`
    )

    for (const metricDefinitionField of metricDefinitionFields) {
      const actualMetricDefinitionField = actualMetricDefinitionFields.find(
        el => el.path === metricDefinitionField.path
      )

      if (!actualMetricDefinitionField || !actualMetricDefinitionField?.value) {
        set(
          errors,
          `spec.monitoredService.spec.templateInputs.${metricDefinitionField?.path}`,
          `${getValidationLabelByNameForTemplateInputs(metricDefinitionField?.name, getString)}`
        )
      }
    }
  })
}

export function shouldValidateTemplateInputs(templateInputsToValidate: any, key: string, templateInputs: any): boolean {
  return templateInputsToValidate[key] !== 'object' && !templateInputs[key]
}

export function getMetricDefinitionsKey(healthSource: any): string {
  let metricDefinitionsKey = METRIC_DEFINITIONS
  if (!isEmpty(healthSource?.spec[QUERY_DEFINITIONS])) {
    metricDefinitionsKey = QUERY_DEFINITIONS
  } else if (!isEmpty(healthSource?.spec[QUERIES])) {
    metricDefinitionsKey = QUERIES
  } else if (!isEmpty(healthSource?.spec[NEWRELIC_METRIC_DEFINITIONS])) {
    metricDefinitionsKey = NEWRELIC_METRIC_DEFINITIONS
  }
  return metricDefinitionsKey
}

export function resetFormik(
  formValues: ContinousVerificationData,
  newSpecs: {
    monitoredServiceRef?: string | undefined
    monitoredServiceName?: string | undefined
    type?: string | undefined
    healthSources?: { identifier: string }[] | undefined
    spec?: spec | undefined
    monitoredService: VerifyStepMonitoredService
    initialMonitoredService?: VerifyStepMonitoredService | undefined
  },
  formik: FormikProps<ContinousVerificationData>
): void {
  const formNewValues = { ...formValues, spec: newSpecs }
  formik.resetForm({ values: formNewValues })
}

export function resetFormikIfNeededForDefaultMonitoredService({
  formValues,
  monitoredServiceData,
  newSpecs,
  formik
}: {
  formValues: ContinousVerificationData
  monitoredServiceData: MonitoredServiceDTO | undefined
  newSpecs: {
    monitoredServiceRef?: string
    monitoredServiceName?: string
    type?: string
    healthSources?: { identifier: string }[]
    spec?: spec
    monitoredService: VerifyStepMonitoredService
    initialMonitoredService?: VerifyStepMonitoredService
  }
  formik: FormikProps<ContinousVerificationData>
}): void {
  if (
    isFirstTimeOpenForDefaultMonitoredSvc(formValues, monitoredServiceData) &&
    isMonitoredServiceTypeSame(formValues)
  ) {
    resetFormik(formValues, newSpecs, formik)
  }
}

export function resetFormikWhenNoChange(
  formValues: ContinousVerificationData,
  newSpecs: {
    monitoredServiceRef?: string
    monitoredServiceName?: string
    type?: string
    healthSources?: { identifier: string }[]
    spec?: spec
    monitoredService: VerifyStepMonitoredService
    initialMonitoredService?: VerifyStepMonitoredService
  },
  formik: FormikProps<ContinousVerificationData>
): void {
  if (isMonitoredServiceTypeSame(formValues)) {
    resetFormik(formValues, newSpecs, formik)
  }
}
export function isMonitoredServiceTypeSame(formValues: ContinousVerificationData): boolean {
  return formValues?.spec?.initialMonitoredService?.type === formValues?.spec?.monitoredService?.type
}
