/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { AllowedTypes, getMultiTypeFromValue, MultiTypeInputType } from '@harness/uicore'
import { defaultTo } from 'lodash-es'
import { AppDynamicsMonitoringSourceFieldNames } from '../../AppDHealthSource.constants'
import type { AppDynamicsFomikFormInterface } from '../../AppDHealthSource.types'
import type { BasePathData } from '../BasePath/BasePath.types'
import type { MetricPathData } from '../MetricPath/MetricPath.types'
import { PATHTYPE } from './AppDCustomMetricForm.constants'
import type { SetServiceInstanceInterface } from './AppDCustomMetricForm.types'

export const getBasePathValue = (basePath: BasePathData): string => {
  return basePath ? Object.values(basePath)[Object.values(basePath).length - 1]?.path : ''
}

export const getMetricPathValue = (basePath: MetricPathData): string => {
  return basePath ? Object.values(basePath)[Object.values(basePath).length - 1]?.path : ''
}

export const setServiceIntance = ({
  serviceInsanceData,
  formikValues,
  formikSetField
}: SetServiceInstanceInterface): void => {
  if (
    serviceInsanceData &&
    formikValues?.continuousVerification &&
    formikValues?.serviceInstanceMetricPath !== serviceInsanceData.data
  ) {
    formikSetField(AppDynamicsMonitoringSourceFieldNames.SERVICE_INSTANCE_METRIC_PATH, serviceInsanceData?.data)
  } else if (!formikValues?.continuousVerification && formikValues.serviceInstanceMetricPath?.length) {
    formikSetField(AppDynamicsMonitoringSourceFieldNames.SERVICE_INSTANCE_METRIC_PATH, '')
  }
}

export const checkRuntimeFields = (formikValues: AppDynamicsFomikFormInterface) =>
  getMultiTypeFromValue(formikValues?.continuousVerification) !== MultiTypeInputType.FIXED ||
  getMultiTypeFromValue(formikValues.appdApplication) !== MultiTypeInputType.FIXED ||
  getMultiTypeFromValue(formikValues.completeMetricPath) !== MultiTypeInputType.FIXED

export const getDerivedCompleteMetricPath = (formikValues: AppDynamicsFomikFormInterface) => {
  const baseFolder = getBasePathValue(formikValues?.basePath)
  const metricPath = getMetricPathValue(formikValues?.metricPath)
  let derivedCompleteMetricPath = ''
  if (formikValues?.pathType === PATHTYPE.DropdownPath && baseFolder && formikValues.appDTier && metricPath) {
    derivedCompleteMetricPath = `${baseFolder?.trim()}|${formikValues?.appDTier?.trim()}|${metricPath?.trim()}`
  } else if (formikValues?.pathType === PATHTYPE.CompleteMetricPath) {
    derivedCompleteMetricPath = defaultTo(formikValues.completeMetricPath, '')
  }
  return derivedCompleteMetricPath
}

export const getAllowedTypeForCompleteMetricPath = ({
  appDTier,
  appdApplication,
  connectorIdentifier
}: {
  appDTier?: string
  appdApplication?: string
  connectorIdentifier?: string
}): AllowedTypes => {
  const isTierRuntimeOrExpression = getMultiTypeFromValue(appDTier) !== MultiTypeInputType.FIXED
  const isApplicationRuntimeOrExpression = getMultiTypeFromValue(appdApplication) !== MultiTypeInputType.FIXED
  const isConnectorRuntimeOrExpression = getMultiTypeFromValue(connectorIdentifier) !== MultiTypeInputType.FIXED

  return isConnectorRuntimeOrExpression || isApplicationRuntimeOrExpression || isTierRuntimeOrExpression
    ? [MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]
    : [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]
}
