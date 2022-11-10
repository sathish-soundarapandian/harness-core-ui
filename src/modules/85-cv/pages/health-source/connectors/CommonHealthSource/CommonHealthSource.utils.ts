import type { AppDMetricDefinitions, AppDynamicsHealthSourceSpec } from 'services/cv'
import { getMetricPacksForPayload } from '../../common/MetricThresholds/MetricThresholds.utils'
import { createPayloadForAssignComponentV2 } from '../../common/utils/HealthSource.utils'
import type { UpdatedHealthSource } from '../../HealthSourceDrawer/HealthSourceDrawerContent.types'
import { HealthSourceTypes } from '../../types'
import type { AppDynamicsData } from '../AppDynamics/AppDHealthSource.types'
import { deriveBaseAndMetricPath } from '../AppDynamics/AppDHealthSource.utils'
import { PATHTYPE } from '../AppDynamics/Components/AppDCustomMetricForm/AppDCustomMetricForm.constants'

// TODO - these functions has to be made in a generic way.
export const createHealthSourceData = (sourceData: any): AppDynamicsData => {
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
        riskCategory: metricDefinition?.analysis?.riskProfile?.riskCategory,
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

// TODO - these functions has to be made in a generic way.
export const createHealthSourcePayload = (
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

      const assignComponentPayload = createPayloadForAssignComponentV2({
        sli,
        riskCategory,
        healthScore,
        continuousVerification,
        lowerBaselineDeviation,
        higherBaselineDeviation
      })

      let serviceInstanceMetricPathData = {}
      if (assignComponentPayload.analysis?.deploymentVerification?.enabled) {
        serviceInstanceMetricPathData = {
          completeServiceInstanceMetricPath: serviceInstanceMetricPath
        }
      }

      specPayload?.metricDefinitions?.push({
        identifier: metricIdentifier,
        metricName,
        completeMetricPath: derivedCompleteMetricPath,
        groupName: groupName?.value as string,
        ...serviceInstanceMetricPathData,
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
