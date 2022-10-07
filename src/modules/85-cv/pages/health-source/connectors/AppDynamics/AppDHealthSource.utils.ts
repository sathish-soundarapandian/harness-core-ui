/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { cloneDeep, isEmpty, isEqual } from 'lodash-es'
import type { FormikProps } from 'formik'
import { AllowedTypes, getMultiTypeFromValue, MultiTypeInputType, RUNTIME_INPUT_VALUE } from '@harness/uicore'
import type { StringKeys, UseStringsReturn } from 'framework/strings'
import type { StringsMap } from 'framework/strings/StringsContext'
import type {
  AppDMetricDefinitions,
  AppDynamicsHealthSourceSpec,
  AppdynamicsValidationResponse,
  MetricPackDTO
} from 'services/cv'
import type { SelectOption } from '@pipeline/components/PipelineSteps/Steps/StepsTypes'
import { isMultiTypeRuntime } from '@common/utils/utils'
import type { GroupedCreatedMetrics } from '@cv/components/MultiItemsSideNav/components/SelectedAppsSideNav/components/GroupedSideNav/GroupedSideNav.types'
import type { UpdatedHealthSource } from '../../HealthSourceDrawer/HealthSourceDrawerContent.types'
import { HealthSourceTypes } from '../../types'
import type {
  AppDynamicsData,
  AppDynamicsFomikFormInterface,
  MapAppDynamicsMetric,
  NonCustomFeildsInterface,
  PersistCustomMetricInterface,
  ValidateMappingInterface
} from './AppDHealthSource.types'
import type { BasePathData } from './Components/BasePath/BasePath.types'
import type { MetricPathData } from './Components/MetricPath/MetricPath.types'
import { AppDynamicsMonitoringSourceFieldNames, initCustomForm, ThresholdTypes } from './AppDHealthSource.constants'
import { PATHTYPE } from './Components/AppDCustomMetricForm/AppDCustomMetricForm.constants'
import type { CustomMappedMetric } from '../../common/CustomMetric/CustomMetric.types'
import { MetricThresholdPropertyName, MetricTypeValues } from '../../common/MetricThresholds/MetricThresholds.constants'
import {
  getFilteredCVDisabledMetricThresholds,
  getFilteredMetricThresholdValues,
  getMetricPacksForPayload,
  validateCommonFieldsForMetricThreshold
} from '../../common/MetricThresholds/MetricThresholds.utils'
import { createPayloadForAssignComponent } from '../../common/utils/HealthSource.utils'

export const convertStringBasePathToObject = (baseFolder: string | BasePathData): BasePathData => {
  let basePathObj = {} as any
  if (typeof baseFolder === 'string') {
    const list = [...baseFolder.split('|'), '']
    list.forEach((item, index) => {
      basePathObj[`basePathDropdown_${index}`] = {
        path: index === 0 ? '' : list.slice(0, index).join('|'),
        value: item
      }
    })
  } else {
    basePathObj = baseFolder
  }
  return basePathObj
}

export const convertStringMetricPathToObject = (metricPath: string | MetricPathData): MetricPathData => {
  let metricPathObj = {} as any
  if (typeof metricPath === 'string') {
    const list = [...metricPath.split('|'), '']
    let secondLastIndex = 0
    if (list.length > 1) {
      secondLastIndex = list.length - 2
    }
    list.forEach((item, index) => {
      metricPathObj[`metricPathDropdown_${index}`] = {
        value: item,
        path: index === 0 ? '' : list.slice(0, index).join('|'),
        isMetric: secondLastIndex === index ? true : false
      }
    })
  } else {
    metricPathObj = metricPath
  }
  return metricPathObj
}

export const createAppDynamicsData = (sourceData: any): AppDynamicsData => {
  const payload: UpdatedHealthSource = sourceData?.healthSourceList?.find(
    (source: UpdatedHealthSource) => source.identifier === sourceData.healthSourceIdentifier
  )

  const { applicationName = '', tierName = '', metricPacks } = (payload?.spec as AppDynamicsHealthSourceSpec) || {}

  const appdData = {
    name: sourceData?.healthSourceName,
    identifier: sourceData?.healthSourceIdentifier,
    connectorRef: sourceData?.connectorRef,
    isEdit: sourceData?.isEdit,
    product: sourceData?.product,
    type: HealthSourceTypes.AppDynamics,
    applicationName,
    tierName,
    metricPacks,
    mappedServicesAndEnvs: new Map()
  }

  for (const metricDefinition of (payload?.spec as AppDynamicsHealthSourceSpec)?.metricDefinitions || []) {
    if (metricDefinition?.metricName) {
      const { metricPathObj, basePathObj } = deriveBaseAndMetricPath(metricDefinition?.completeMetricPath, tierName)

      appdData.mappedServicesAndEnvs.set(metricDefinition.metricName, {
        metricPath: metricPathObj,
        basePath: basePathObj,
        completeMetricPath: metricDefinition.completeMetricPath,
        metricName: metricDefinition.metricName,
        metricIdentifier: metricDefinition.identifier,
        riskCategory:
          metricDefinition?.analysis?.riskProfile?.category && metricDefinition?.analysis?.riskProfile?.metricType
            ? `${metricDefinition?.analysis?.riskProfile?.category}/${metricDefinition?.analysis?.riskProfile?.metricType}`
            : '',
        lowerBaselineDeviation:
          metricDefinition?.analysis?.riskProfile?.thresholdTypes?.includes('ACT_WHEN_LOWER') || false,
        higherBaselineDeviation:
          metricDefinition?.analysis?.riskProfile?.thresholdTypes?.includes('ACT_WHEN_HIGHER') || false,
        groupName: { label: metricDefinition.groupName || '', value: metricDefinition.groupName || '' },
        continuousVerification: metricDefinition?.analysis?.deploymentVerification?.enabled,
        healthScore: metricDefinition?.analysis?.liveMonitoring?.enabled,
        sli: metricDefinition.sli?.enabled,
        serviceInstanceMetricPath: metricDefinition.completeServiceInstanceMetricPath
      })
    }
  }

  return appdData
}

const validateMetricThresholds = (
  errors: Record<keyof AppDynamicsFomikFormInterface | string, string>,
  values: AppDynamicsFomikFormInterface,
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

export const validateMapping = ({
  values,
  createdMetrics,
  selectedMetricIndex,
  getString,
  mappedMetrics,
  isMetricThresholdEnabled
}: ValidateMappingInterface): Record<keyof AppDynamicsFomikFormInterface | string, string> => {
  let errors = {} as Record<keyof AppDynamicsFomikFormInterface | string, string>

  const metricValueList = values?.metricData ? Object.values(values?.metricData).filter(val => val) : []

  if (!values.appdApplication) {
    errors[AppDynamicsMonitoringSourceFieldNames.APPDYNAMICS_APPLICATION] = getString(
      'cv.healthSource.connectors.AppDynamics.validation.application'
    )
  }

  if (!values.appDTier) {
    errors[AppDynamicsMonitoringSourceFieldNames.APPDYNAMICS_TIER] = getString(
      'cv.healthSource.connectors.AppDynamics.validation.tier'
    )
  }

  const hasMetricNameAndCustomMetricAdded = !!values.metricName && values?.showCustomMetric

  if (!metricValueList.length && !hasMetricNameAndCustomMetricAdded) {
    errors[AppDynamicsMonitoringSourceFieldNames.METRIC_DATA] = getString(
      'cv.monitoringSources.appD.validations.selectMetricPack'
    )
  }

  if (values?.showCustomMetric) {
    errors = validateCustomMetricFields(
      values,
      createdMetrics,
      selectedMetricIndex,
      errors,
      getString,
      mappedMetrics as Map<string, MapAppDynamicsMetric>
    )
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
  getString: (key: StringKeys) => string,
  mappedMetrics?: Map<string, MapAppDynamicsMetric>
): Record<keyof AppDynamicsFomikFormInterface | string, string> => {
  let _error = cloneDeep(errors)

  if (values.pathType === PATHTYPE.DropdownPath) {
    _error = validateMetricBasePath(values, _error, getString)
  }

  if (values.pathType === PATHTYPE.CompleteMetricPath) {
    const { completeMetricPath = '', appDTier = '' } = values
    const isCompleteMetricPathEmpty = !completeMetricPath?.length
    const isCompleteMetricPathRuntimeOrExpression =
      Boolean(completeMetricPath) && getMultiTypeFromValue(completeMetricPath) !== MultiTypeInputType.FIXED
    const completeMetricPathArray = completeMetricPath?.split('|') || []
    if (isCompleteMetricPathEmpty) {
      _error[PATHTYPE.CompleteMetricPath] = getString('cv.healthSource.connectors.AppDynamics.validation.fullPath')
    } else if (isCompleteMetricPathRuntimeOrExpression) {
      const incorrectPairing = completeMetricPathArray?.filter((item: string) => !item?.trim()?.length)?.length
      if (incorrectPairing) {
        _error[PATHTYPE.CompleteMetricPath] = getString(
          'cv.healthSource.connectors.AppDynamics.validation.inCorrectMetricPath'
        )
      }
    } else {
      const completeMetricPathContainsTierInfo = completeMetricPathArray
        ?.map((item: string) => item.trim())
        ?.includes(appDTier)
      const indexOfTierInCompleteMetricPath = completeMetricPathArray
        ?.map((item: string) => item.trim())
        ?.indexOf(appDTier)
      const countOfSeparator = completeMetricPathArray?.length - 1
      const incorrectPairing = completeMetricPathArray?.filter((item: string) => !item?.trim()?.length)?.length
      if (!(countOfSeparator > 1)) {
        _error[PATHTYPE.CompleteMetricPath] = getString(
          'cv.healthSource.connectors.AppDynamics.validation.inCorrectMetricPath'
        )
      } else if (
        indexOfTierInCompleteMetricPath === 0 ||
        indexOfTierInCompleteMetricPath === completeMetricPathArray.length - 1
      ) {
        _error[PATHTYPE.CompleteMetricPath] = getString(
          'cv.healthSource.connectors.AppDynamics.validation.inCorrectOrderOfTierInPath'
        )
      } else if (incorrectPairing) {
        _error[PATHTYPE.CompleteMetricPath] = getString(
          'cv.healthSource.connectors.AppDynamics.validation.inCorrectMetricPath'
        )
      } else if (!completeMetricPathContainsTierInfo) {
        _error[PATHTYPE.CompleteMetricPath] = getString(
          'cv.healthSource.connectors.AppDynamics.validation.missingTierInFullPath'
        )
      }
    }
  }

  const isAssignComponentValid = [values.sli, values.continuousVerification, values.healthScore].find(i => i)
  const isRiskCategoryValid = !!values?.riskCategory

  const selectedMetricIndexNew =
    createdMetrics.indexOf(values.metricName) > -1 ? selectedMetricIndex : createdMetrics.indexOf(values.metricName)

  const duplicateNames =
    createdMetrics.length < 2
      ? []
      : createdMetrics?.filter((metricName, index) => {
          if (index === selectedMetricIndexNew) {
            return false
          }
          return metricName === values.metricName
        })

  _error = validateIdentifier(values, createdMetrics, selectedMetricIndexNew, _error, getString, mappedMetrics)

  if (!values.groupName) {
    _error[AppDynamicsMonitoringSourceFieldNames.GROUP_NAME] = getString(
      'cv.monitoringSources.prometheus.validation.groupName'
    )
  }

  if (!values.metricName) {
    _error[AppDynamicsMonitoringSourceFieldNames.METRIC_NAME] = getString('cv.monitoringSources.metricNameValidation')
  }

  if (values.metricName && duplicateNames.length) {
    _error[AppDynamicsMonitoringSourceFieldNames.METRIC_NAME] = getString(
      'cv.monitoringSources.prometheus.validation.metricNameUnique'
    )
  }

  _error = validateAssignComponent(isAssignComponentValid, _error, getString, values, isRiskCategoryValid)
  return _error
}

const validateMetricBasePath = (values: any, errors: any, getString: (key: StringKeys) => string) => {
  const _error = cloneDeep(errors)
  const isBasePathValid = values?.basePath
    ? Object.values(values?.basePath as BasePathData).some(path => path?.value)
    : false

  const isMetricPathValid = values?.metricPath
    ? Object.values(values?.metricPath as MetricPathData).some(path => path?.value)
    : false

  const metricHasLeafNodeSelected = values?.metricPath
    ? Object.values(values?.metricPath as MetricPathData).some(item => item.isMetric)
    : false

  if (!isBasePathValid) {
    _error[AppDynamicsMonitoringSourceFieldNames.BASE_PATH] = getString(
      'cv.healthSource.connectors.AppDynamics.validation.basePath'
    )
  }

  if (!isMetricPathValid) {
    _error[AppDynamicsMonitoringSourceFieldNames.METRIC_PATH] = getString(
      'cv.healthSource.connectors.AppDynamics.validation.metricPath'
    )
  } else {
    if (!metricHasLeafNodeSelected) {
      _error[AppDynamicsMonitoringSourceFieldNames.METRIC_PATH] = getString(
        'cv.healthSource.connectors.AppDynamics.validation.metricPathWithoutLeafNode'
      )
    }
  }
  return _error
}

const validateIdentifier = (
  values: any,
  createdMetrics: string[],
  selectedMetricIndex: number,
  errors: any,
  getString: (key: StringKeys) => string,
  mappedMetrics?: Map<string, MapAppDynamicsMetric>
): ((key: string | boolean | string[]) => string) => {
  const _error = cloneDeep(errors)
  const identifiers = createdMetrics.map(metricName => mappedMetrics?.get(metricName)?.metricIdentifier)

  const duplicateIdentifier =
    identifiers.length < 2
      ? []
      : identifiers?.filter((identifier, index) => {
          if (index === selectedMetricIndex) {
            return false
          }
          return identifier === values.metricIdentifier
        })

  if (values.identifier && duplicateIdentifier.length) {
    _error[AppDynamicsMonitoringSourceFieldNames.METRIC_IDENTIFIER] = getString(
      'cv.monitoringSources.prometheus.validation.metricIdentifierUnique'
    )
  }
  return _error
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
    _error[AppDynamicsMonitoringSourceFieldNames.SLI] = getString(
      'cv.monitoringSources.gco.mapMetricsToServicesPage.validation.baseline'
    )
  } else if (isAssignComponentValid) {
    if (values.continuousVerification || values.healthScore) {
      if (values.lowerBaselineDeviation !== true && values.higherBaselineDeviation !== true) {
        _error[AppDynamicsMonitoringSourceFieldNames.LOWER_BASELINE_DEVIATION] = getString(
          'cv.monitoringSources.prometheus.validation.deviation'
        )
      }
      if (values.continuousVerification && !values.serviceInstanceMetricPath) {
        _error[AppDynamicsMonitoringSourceFieldNames.CONTINUOUS_VERIFICATION] = getString(
          'cv.healthSource.connectors.AppDynamics.validation.missingServiceInstanceMetricPath'
        )
      }
      if (!isRiskCategoryValid) {
        _error[AppDynamicsMonitoringSourceFieldNames.RISK_CATEGORY] = getString(
          'cv.monitoringSources.gco.mapMetricsToServicesPage.validation.riskCategory'
        )
      }
    }
  }
  return _error
}

export const getBaseAndMetricPath = (
  basePath: BasePathData,
  metricPath: MetricPathData,
  fullPath: string | null,
  appDTier: string
): { derivedBasePath: string; derivedMetricPath: string } => {
  // convert full path to metricPath and basePath
  let derivedBasePath = ''
  let derivedMetricPath = ''
  if (fullPath) {
    const data = convertFullPathToBaseAndMetric(fullPath, appDTier)
    derivedBasePath = data.derivedBasePath
    derivedMetricPath = data.derivedMetricPath
  } else if (basePath && metricPath) {
    derivedBasePath = basePath[Object.keys(basePath)[Object.keys(basePath).length - 1]]?.path
    derivedMetricPath = metricPath[Object.keys(metricPath)[Object.keys(metricPath).length - 1]]?.path
  }

  return { derivedBasePath, derivedMetricPath }
}

export const convertFullPathToBaseAndMetric = (
  fullPath: string,
  appDTier: string
): { derivedBasePath: string; derivedMetricPath: string } => {
  const fullPathArray = fullPath.split('|').map((item: string) => item.trim())
  const indexOfManager = fullPathArray.indexOf(appDTier)
  const derivedBasePath = fullPathArray.slice(0, indexOfManager).join('|')
  const derivedMetricPath = fullPathArray.slice(indexOfManager + 1, fullPathArray.length).join('|')
  return { derivedBasePath, derivedMetricPath }
}

export const createAppDynamicsPayload = (
  formData: any,
  isMetricThresholdEnabled: boolean
): UpdatedHealthSource | null => {
  const specPayload = {
    applicationName: (formData?.appdApplication?.label as string) || (formData.appdApplication as string),
    tierName: (formData?.appDTier?.label as string) || (formData.appDTier as string),
    metricData: formData.metricData,
    metricDefinitions: [] as AppDMetricDefinitions[]
  }

  if (formData.showCustomMetric) {
    for (const entry of formData.mappedServicesAndEnvs.entries()) {
      const {
        metricName,
        groupName,
        riskCategory,
        lowerBaselineDeviation,
        higherBaselineDeviation,
        sli,
        continuousVerification,
        healthScore,
        metricIdentifier,
        basePath,
        metricPath,
        serviceInstanceMetricPath,
        completeMetricPath
      } = entry[1]

      let derivedCompleteMetricPath = completeMetricPath
      if (formData.pathType === PATHTYPE.DropdownPath) {
        derivedCompleteMetricPath = `${basePath[Object.keys(basePath)[Object.keys(basePath).length - 1]]?.path}|${
          formData.appDTier
        }|${metricPath[Object.keys(metricPath)[Object.keys(metricPath).length - 1]]?.path}`
      }

      const assignComponentPayload = createPayloadForAssignComponent({
        sli,
        riskCategory,
        healthScore,
        continuousVerification,
        lowerBaselineDeviation,
        higherBaselineDeviation
      })

      specPayload?.metricDefinitions?.push({
        identifier: metricIdentifier,
        metricName,
        completeMetricPath: derivedCompleteMetricPath,
        groupName: groupName?.value as string,
        completeServiceInstanceMetricPath: serviceInstanceMetricPath,
        ...assignComponentPayload
      })
    }
  }

  return {
    name: formData.name || (formData.healthSourceName as string),
    identifier: formData.identifier || (formData.healthSourceIdentifier as string),
    type: 'AppDynamics' as any,
    spec: {
      ...specPayload,
      feature: 'Application Monitoring' as string,
      connectorRef: (formData?.connectorRef?.value as string) || (formData.connectorRef as string),
      metricPacks: getMetricPacksForPayload(formData, isMetricThresholdEnabled)
    }
  }
}

export const submitData = (
  formik: FormikProps<AppDynamicsFomikFormInterface>,
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

export const convertMetricPackToMetricData = (value?: MetricPackDTO[]) => {
  const dataObject: { [key: string]: boolean } = {}
  const metricList: MetricPackDTO[] = value || []
  metricList.forEach((i: MetricPackDTO) => {
    // `Custom` is being used for Metric threshold's Custom metric metricType
    if (i.identifier !== MetricTypeValues.Custom) {
      dataObject[i.identifier as string] = true
    }
  })
  return dataObject
}

export const createAppDFormData = (
  appDynamicsData: AppDynamicsData,
  mappedMetrics: Map<string, CustomMappedMetric>,
  selectedMetric: string,
  nonCustomFeilds: NonCustomFeildsInterface,
  showCustomMetric: boolean,
  isTemplate = false
): AppDynamicsFomikFormInterface => {
  const mappedMetricsData = mappedMetrics.get(selectedMetric) as MapAppDynamicsMetric
  const metricIdentifier = mappedMetricsData?.metricIdentifier || selectedMetric?.split(' ').join('_')
  const { completeMetricPath = '', serviceInstanceMetricPath = '' } = mappedMetricsData || {}
  if (isTemplate && serviceInstanceMetricPath === '' && mappedMetricsData) {
    mappedMetricsData.serviceInstanceMetricPath = RUNTIME_INPUT_VALUE
  }

  const isTierRuntimeOrExpression = getMultiTypeFromValue(nonCustomFeilds?.appDTier) !== MultiTypeInputType.FIXED
  const isApplicationRuntimeOrExpression =
    getMultiTypeFromValue(nonCustomFeilds.appdApplication) !== MultiTypeInputType.FIXED
  const isConnectorRuntimeOrExpression =
    getMultiTypeFromValue(appDynamicsData?.connectorRef?.value) !== MultiTypeInputType.FIXED

  const completeMetricPathForTemplates =
    (isTierRuntimeOrExpression || isApplicationRuntimeOrExpression || isConnectorRuntimeOrExpression) &&
    getMultiTypeFromValue(completeMetricPath) === MultiTypeInputType.FIXED
      ? RUNTIME_INPUT_VALUE
      : completeMetricPath

  return {
    name: appDynamicsData.name,
    identifier: appDynamicsData.identifier,
    connectorRef: appDynamicsData.connectorRef,
    isEdit: appDynamicsData.isEdit,
    product: appDynamicsData.product,
    type: appDynamicsData.type,
    pathType: isTemplate || completeMetricPath ? PATHTYPE.CompleteMetricPath : PATHTYPE.DropdownPath,
    mappedServicesAndEnvs: appDynamicsData.mappedServicesAndEnvs,
    ...nonCustomFeilds,
    ...(mappedMetrics.get(selectedMetric) as MapAppDynamicsMetric),
    completeMetricPath: isTemplate ? completeMetricPathForTemplates : completeMetricPath,
    metricName: selectedMetric,
    showCustomMetric,
    metricIdentifier
  }
}

export const initializeNonCustomFields = (
  appDynamicsData: AppDynamicsData,
  isMetricThresholdEnabled: boolean
): NonCustomFeildsInterface => {
  const ignoreThresholds = isMetricThresholdEnabled
    ? getFilteredMetricThresholdValues(ThresholdTypes.IgnoreThreshold, appDynamicsData.metricPacks)
    : []

  const failFastThresholds = isMetricThresholdEnabled
    ? getFilteredMetricThresholdValues(ThresholdTypes.FailImmediately, appDynamicsData.metricPacks)
    : []

  return {
    appdApplication: appDynamicsData.applicationName || '',
    appDTier: appDynamicsData.tierName || '',
    metricPacks: appDynamicsData.metricPacks || undefined,
    metricData: convertMetricPackToMetricData(appDynamicsData?.metricPacks),
    ignoreThresholds,
    failFastThresholds
  }
}

export const setAppDynamicsApplication = (
  appdApplication: string,
  tierOptions: SelectOption[],
  multiType?: MultiTypeInputType
): SelectOption | string | undefined => {
  const value = !appdApplication ? undefined : tierOptions.find((item: SelectOption) => item.label === appdApplication)

  if (multiType && isMultiTypeRuntime(multiType)) {
    return appdApplication
  }
  if (multiType === MultiTypeInputType.EXPRESSION) {
    return appdApplication
  }
  return multiType ? value : value || { label: '', value: '' }
}

export const setAppDynamicsTier = (
  tierLoading: boolean,
  appDTier: string,
  tierOptions: SelectOption[],
  multiType?: MultiTypeInputType
): SelectOption | string | undefined => {
  const value = tierLoading || !appDTier ? undefined : tierOptions.find((item: SelectOption) => item.label === appDTier)
  if (multiType && isMultiTypeRuntime(multiType)) {
    return appDTier
  }
  if (multiType === MultiTypeInputType.EXPRESSION) {
    return appDTier
  }
  return multiType ? value : value || { label: '', value: '' }
}

export const initAppDCustomFormValue = () => {
  return {
    ...initCustomForm,
    groupName: { label: '', value: '' }
  }
}

export const getPlaceholder = (
  loading: boolean,
  placeholderText: keyof StringsMap,
  getString: (key: StringKeys) => string
): string => (loading ? getString('loading') : getString(placeholderText))

export const showValidation = (appdApplication?: string, appDTier?: string): boolean =>
  Boolean(appDTier) && Boolean(appdApplication) && !(appdApplication === RUNTIME_INPUT_VALUE || appDTier === '<+input>')

export const getTypeOfInput = (value: SelectOption | string) => {
  const selectedItem = typeof value === 'string' ? value : value?.label
  if (getMultiTypeFromValue(selectedItem) === MultiTypeInputType.RUNTIME) {
    return MultiTypeInputType.RUNTIME
  }
  if (/^</.test(selectedItem)) {
    return MultiTypeInputType.EXPRESSION
  }
  return MultiTypeInputType.FIXED
}

export const setCustomFieldAndValidation = (
  value: string,
  setNonCustomFeilds: React.Dispatch<React.SetStateAction<NonCustomFeildsInterface>>,
  nonCustomFeilds: NonCustomFeildsInterface,
  setAppDValidation: React.Dispatch<
    React.SetStateAction<{
      status: string
      result: AppdynamicsValidationResponse[] | []
    }>
  >,
  validate = false
): void => {
  const updatedNonCustomValue = {
    ...nonCustomFeilds,
    appdApplication: value,
    appDTier: getTypeOfInput(value) !== MultiTypeInputType.FIXED ? RUNTIME_INPUT_VALUE : ''
  }
  setNonCustomFeilds(updatedNonCustomValue)
  if (validate) {
    setAppDValidation({ status: '', result: [] })
  }
}

export const checkAppAndTierAreNotFixed = (appName: string, tierName: string) =>
  getMultiTypeFromValue(appName) === MultiTypeInputType.RUNTIME ||
  getMultiTypeFromValue(appName) === MultiTypeInputType.EXPRESSION ||
  getMultiTypeFromValue(tierName) === MultiTypeInputType.RUNTIME ||
  getMultiTypeFromValue(tierName) === MultiTypeInputType.EXPRESSION

export const shouldMakeTierCall = (applicationName: string) =>
  applicationName &&
  getMultiTypeFromValue(applicationName) !== MultiTypeInputType.RUNTIME &&
  (getMultiTypeFromValue(applicationName) !== MultiTypeInputType.EXPRESSION || /^<+>/.test(applicationName))

export const getAllowedTypes = (isConnectorRuntimeOrExpression: boolean): AllowedTypes =>
  isConnectorRuntimeOrExpression
    ? [MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]
    : [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]

export const setAppAndTierAsInputIfConnectorIsInput = (
  isConnectorRuntimeOrExpression: boolean,
  nonCustomFeilds: NonCustomFeildsInterface,
  setNonCustomFeilds: (data: NonCustomFeildsInterface) => void
) => {
  if (isConnectorRuntimeOrExpression) {
    setNonCustomFeilds({
      ...nonCustomFeilds,
      appDTier: '<+input>',
      appdApplication: '<+input>'
    })
  }
}

export const resetShowCustomMetric = (
  selectedMetric: string,
  mappedMetrics: Map<string, CustomMappedMetric>,
  setShowCustomMetric: (value: React.SetStateAction<boolean>) => void
) => {
  if (!selectedMetric && !mappedMetrics.size) {
    setShowCustomMetric(false)
  }
}

export const persistCustomMetric = ({
  mappedMetrics,
  selectedMetric,
  nonCustomFeilds,
  formikValues,
  setMappedMetrics
}: PersistCustomMetricInterface): void => {
  const mapValue = mappedMetrics.get(selectedMetric) as MapAppDynamicsMetric
  if (!isEmpty(mapValue)) {
    const nonCustomValuesFromSelectedMetric = {
      appdApplication: mapValue?.appdApplication,
      appDTier: mapValue?.appDTier,
      metricPacks: mapValue?.metricPacks,
      metricData: mapValue?.metricData,
      ignoreThresholds: mapValue?.ignoreThresholds,
      failFastThresholds: mapValue?.failFastThresholds
    }

    if (selectedMetric === formikValues?.metricName && !isEqual(nonCustomFeilds, nonCustomValuesFromSelectedMetric)) {
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

export const deriveBaseAndMetricPath = (
  completeMetricPath: AppDMetricDefinitions['completeMetricPath'],
  tierName: string
): { metricPathObj: MetricPathData; basePathObj: BasePathData } => {
  const pathArray = completeMetricPath?.split('|')
  const tierIndex = pathArray?.indexOf(tierName) || 0
  const basePathArray = pathArray?.slice(0, tierIndex) || []
  const metricPathArray = pathArray?.slice(tierIndex + 1, pathArray.length) || []
  const metricPath = metricPathArray?.length > 1 ? metricPathArray.join('|') : metricPathArray[0]
  const baseFolder = basePathArray?.length > 1 ? basePathArray.join('|') : basePathArray[0]
  const basePathObj = convertStringBasePathToObject(baseFolder || '')
  const metricPathObj = convertStringMetricPathToObject(metricPath || '')
  return { metricPathObj, basePathObj }
}
