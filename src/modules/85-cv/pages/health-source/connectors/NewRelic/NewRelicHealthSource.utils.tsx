/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { cloneDeep, isEmpty, isEqual, omit } from 'lodash-es'
import { getMultiTypeFromValue, MultiTypeInputType, RUNTIME_INPUT_VALUE, SelectOption } from '@wings-software/uicore'
import type { StringKeys, UseStringsReturn } from 'framework/strings'
import type { MetricPackDTO } from 'services/cv'
import { StatusOfValidation } from '@cv/pages/components/ValidationStatus/ValidationStatus.constants'
import type {
  CreatedMetricsWithSelectedIndex,
  MapNewRelicMetric,
  NewRelicData,
  NonCustomMetricFields,
  PersistCustomMetricInterface,
  SelectedAndMappedMetrics
} from './NewRelicHealthSource.types'
import type { CustomMappedMetric, GroupedCreatedMetrics } from '../../common/CustomMetric/CustomMetric.types'
import {
  getFilteredCVDisabledMetricThresholds,
  getFilteredMetricThresholdValues,
  validateCommonFieldsForMetricThreshold
} from '../../common/MetricThresholds/MetricThresholds.utils'
import {
  MetricThresholdPropertyName,
  MetricThresholdTypes
} from '../../common/MetricThresholds/MetricThresholds.constants'

const validateMetricThresholds = (
  errors: Record<string, string>,
  values: any,
  getString: UseStringsReturn['getString']
): void => {
  // ignoreThresholds Validation
  validateCommonFieldsForMetricThreshold(
    MetricThresholdPropertyName.IgnoreThreshold,
    errors,
    values[MetricThresholdPropertyName.IgnoreThreshold],
    getString,
    true
  )

  // failFastThresholds Validation
  validateCommonFieldsForMetricThreshold(
    MetricThresholdPropertyName.FailFastThresholds,
    errors,
    values[MetricThresholdPropertyName.FailFastThresholds],
    getString,
    true
  )
}

export const validateMapping = (
  values: any,
  createdMetrics: string[],
  selectedMetricIndex: number,
  getString: (key: StringKeys) => string,
  isMetricThresholdEnabled: boolean
): ((key: string | boolean | string[]) => string) => {
  let errors = {} as any

  const metricValueList = Object.values(values?.metricData).filter(val => val)
  if (!metricValueList.length) {
    errors['metricData'] = getString('cv.monitoringSources.appD.validations.selectMetricPack')
  }

  if (
    getMultiTypeFromValue(values?.newRelicApplication) === MultiTypeInputType.FIXED &&
    values?.newRelicApplication &&
    (!values.newRelicApplication.value || values.newRelicApplication.value === 'loading')
  ) {
    errors['newRelicApplication'] = getString('cv.healthSource.connectors.NewRelic.validations.application')
  }

  // if custom metrics are present then validate custom metrics form
  if (values?.showCustomMetric) {
    errors = validateCustomMetricFields(values, createdMetrics, selectedMetricIndex, errors, getString)
  }

  if (isMetricThresholdEnabled) {
    validateMetricThresholds(errors, values, getString)
  }

  return errors
}

const validateCustomMetricFields = (
  values: any,
  createdMetrics: string[],
  selectedMetricIndex: number,
  errors: any,
  getString: (key: StringKeys) => string
): ((key: string | boolean | string[]) => string) => {
  let completErrors = cloneDeep(errors)

  const isAssignComponentValid = [values.sli, values.continuousVerification, values.healthScore].find(i => i)
  const isRiskCategoryValid = !!values?.riskCategory

  const duplicateNames = createdMetrics?.filter((metricName, index) => {
    if (index === selectedMetricIndex) {
      return false
    }
    return metricName === values.metricName
  })

  if (!values.groupName || !values.groupName?.value) {
    completErrors['groupName'] = getString('cv.monitoringSources.prometheus.validation.groupName')
  }

  if (!values.metricName) {
    completErrors['metricName'] = getString('cv.monitoringSources.metricNameValidation')
  }

  if (!values.query) {
    completErrors['query'] = getString('cv.healthSource.connectors.NewRelic.validations.nrql')
  }

  if (!values.metricValue) {
    completErrors['metricValue'] = getString('cv.healthSource.connectors.NewRelic.validations.metricValue')
  }

  if (!values.timestamp) {
    completErrors['timestamp'] = getString('cv.healthSource.connectors.NewRelic.validations.timestamp')
  }

  if (values.metricName && duplicateNames.length) {
    completErrors['metricName'] = getString('cv.monitoringSources.prometheus.validation.metricNameUnique')
  }

  completErrors = validateAssignComponent(isAssignComponentValid, completErrors, getString, values, isRiskCategoryValid)
  return completErrors
}

const validateAssignComponent = (
  isAssignComponentValid: boolean,
  errors: any,
  getString: (key: StringKeys) => string,
  values: any,
  isRiskCategoryValid: boolean
): ((key: string | boolean | string[]) => string) => {
  const _error = cloneDeep(errors)
  if (!isAssignComponentValid) {
    _error['sli'] = getString('cv.monitoringSources.gco.mapMetricsToServicesPage.validation.baseline')
  } else if (isAssignComponentValid) {
    if (values.continuousVerification || values.healthScore) {
      if (values.lowerBaselineDeviation !== true && values.higherBaselineDeviation !== true) {
        _error['lowerBaselineDeviation'] = getString('cv.monitoringSources.prometheus.validation.deviation')
      }
      if (!isRiskCategoryValid) {
        _error['riskCategory'] = getString('cv.monitoringSources.gco.mapMetricsToServicesPage.validation.riskCategory')
      }
    }
  }
  return _error
}

export function initializeSelectedMetricsMap(
  defaultSelectedMetricName: string,
  mappedServicesAndEnvs?: Map<string, MapNewRelicMetric>
): SelectedAndMappedMetrics {
  return {
    selectedMetric: (Array.from(mappedServicesAndEnvs?.keys() || [])?.[0] as string) || defaultSelectedMetricName,
    mappedMetrics:
      mappedServicesAndEnvs ||
      new Map([
        [
          defaultSelectedMetricName,
          {
            metricName: defaultSelectedMetricName,
            groupName: { label: '', value: '' },
            query: '',
            metricValue: '',
            timestamp: '',
            timestampFormat: '',
            serviceInstanceIdentifier: '',
            sli: false,
            healthScore: false,
            continuousVerification: false
          }
        ]
      ])
  }
}

export function initializeCreatedMetrics(
  defaultSelectedMetricName: string,
  selectedMetric: string,
  mappedMetrics: SelectedAndMappedMetrics['mappedMetrics']
): CreatedMetricsWithSelectedIndex {
  return {
    createdMetrics: Array.from(mappedMetrics.keys()) || [defaultSelectedMetricName],
    selectedMetricIndex: Array.from(mappedMetrics.keys()).findIndex(metric => metric === selectedMetric)
  }
}

export const convertMetricPackToMetricData = (value?: MetricPackDTO[]) => {
  const dataObject: { [key: string]: boolean } = {}
  const metricList: MetricPackDTO[] = value || []
  metricList.forEach((i: MetricPackDTO) => (dataObject[i.identifier as string] = true))
  return dataObject
}

export const initializeNonCustomFields = (
  newRelicData: NewRelicData,
  isMetricThresholdEnabled: boolean
): NonCustomMetricFields => {
  const ignoreThresholds = isMetricThresholdEnabled
    ? getFilteredMetricThresholdValues(MetricThresholdTypes.IgnoreThreshold, newRelicData?.metricPacks)
    : []

  const failFastThresholds = isMetricThresholdEnabled
    ? getFilteredMetricThresholdValues(MetricThresholdTypes.FailImmediately, newRelicData?.metricPacks)
    : []

  return {
    newRelicApplication:
      getMultiTypeFromValue(newRelicData?.applicationName) === MultiTypeInputType.FIXED
        ? { label: newRelicData?.applicationName, value: newRelicData?.applicationId }
        : newRelicData?.applicationName,
    metricPacks: newRelicData?.metricPacks || undefined,
    metricData: convertMetricPackToMetricData(newRelicData?.metricPacks),
    ignoreThresholds,
    failFastThresholds
  }
}

export const createNewRelicFormData = (
  newRelicData: NewRelicData,
  mappedMetrics: Map<string, CustomMappedMetric>,
  selectedMetric: string,
  nonCustomFeilds: {
    newRelicApplication: SelectOption | string
    metricPacks?: MetricPackDTO[]
    metricData: {
      [key: string]: boolean
    }
  },
  showCustomMetric: boolean
): any => {
  return {
    name: newRelicData.name,
    identifier: newRelicData.identifier,
    connectorRef: newRelicData.connectorRef,
    isEdit: newRelicData.isEdit,
    product: newRelicData.product,
    type: newRelicData.type,
    mappedServicesAndEnvs: newRelicData.mappedServicesAndEnvs,
    ...nonCustomFeilds,
    ...mappedMetrics.get(selectedMetric),
    metricName: selectedMetric,
    metricIdentifier: selectedMetric?.split(' ').join('_'),
    showCustomMetric
  }
}

export const setApplicationIfConnectorIsInput = (
  isConnectorRuntimeOrExpression: boolean,
  nonCustomFeilds: any,
  setNonCustomFeilds: (data: any) => void
): void => {
  if (isConnectorRuntimeOrExpression) {
    setNonCustomFeilds({
      ...nonCustomFeilds,
      newRelicApplication: RUNTIME_INPUT_VALUE,
      metricValue: RUNTIME_INPUT_VALUE,
      timestamp: RUNTIME_INPUT_VALUE
    })
  }
}

export const createNewRelicPayloadBeforeSubmission = (
  formik: any,
  mappedMetrics: Map<string, CustomMappedMetric>,
  selectedMetric: string,
  onSubmit: (healthSourcePayload: any) => void,
  groupedCreatedMetrics: GroupedCreatedMetrics
): void => {
  const updatedMetric = formik.values
  if (updatedMetric) {
    mappedMetrics.set(selectedMetric, updatedMetric)
  }

  const filteredCVDisabledMetricThresholds = getFilteredCVDisabledMetricThresholds(
    formik.values.ignoreThresholds,
    formik.values.failFastThresholds,
    groupedCreatedMetrics
  )

  const updatedValues = {
    ...formik.values,
    ...filteredCVDisabledMetricThresholds,
    mappedServicesAndEnvs: mappedMetrics
  }
  onSubmit(updatedValues)
}

export const setNewRelicApplication = (
  newRelicApplication: string,
  applicationOptions: SelectOption[]
): SelectOption | undefined =>
  !newRelicApplication
    ? { label: '', value: '' }
    : applicationOptions.find((item: SelectOption) => item.label === newRelicApplication)

export const shouldRunValidation = ({
  isEdit,
  hasMetricPacks,
  validationStatus,
  isConnectorRuntimeOrExpression
}: {
  isEdit: boolean
  hasMetricPacks: boolean
  validationStatus: string
  isConnectorRuntimeOrExpression?: boolean
}): boolean =>
  isEdit && hasMetricPacks && validationStatus !== StatusOfValidation.IN_PROGRESS && !isConnectorRuntimeOrExpression

export const shouldFetchApplication = (query?: string, isConnectorRuntimeOrExpression?: boolean) =>
  query?.trim().length &&
  !isConnectorRuntimeOrExpression &&
  getMultiTypeFromValue(query?.trim().length) === MultiTypeInputType.FIXED

export const persistCustomMetric = ({
  mappedMetrics,
  selectedMetric,
  nonCustomFeilds,
  formikValues,
  setMappedMetrics
}: PersistCustomMetricInterface): void => {
  const mapValue = mappedMetrics.get(selectedMetric) as unknown as NonCustomMetricFields
  if (!isEmpty(mapValue)) {
    const nonCustomValuesFromSelectedMetric = {
      newRelicApplication: mapValue?.newRelicApplication,
      metricPacks: mapValue?.metricPacks,
      metricData: mapValue?.metricData,
      ignoreThresholds: mapValue?.ignoreThresholds,
      failFastThresholds: mapValue?.failFastThresholds
    }

    const areAllFilled =
      nonCustomValuesFromSelectedMetric.newRelicApplication && nonCustomValuesFromSelectedMetric.metricData
    if (
      areAllFilled &&
      selectedMetric === formikValues?.metricName &&
      !isEqual(omit(nonCustomFeilds, ['metricValue', 'timestamp']), nonCustomValuesFromSelectedMetric)
    ) {
      const clonedMappedMetrics = cloneDeep(mappedMetrics)
      clonedMappedMetrics.forEach((data, key) => {
        if (selectedMetric === data.metricName) {
          clonedMappedMetrics.set(selectedMetric, { ...formikValues, ...nonCustomFeilds })
        } else {
          clonedMappedMetrics.set(key, { ...data, ...nonCustomFeilds })
        }
      })
      setMappedMetrics({ selectedMetric: selectedMetric, mappedMetrics: clonedMappedMetrics })
    }
  }
}
