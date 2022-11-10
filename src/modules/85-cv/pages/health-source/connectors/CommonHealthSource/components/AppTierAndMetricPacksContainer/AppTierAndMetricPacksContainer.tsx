import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { StatusOfValidation } from '@cv/pages/components/ValidationStatus/ValidationStatus.constants'
import { Utils } from '@harness/uicore'
import type { FormikProps } from 'formik'
import React, { Dispatch, SetStateAction, useCallback, useState } from 'react'
import { useParams } from 'react-router'
import type { AppdynamicsValidationResponse, TimeSeriesMetricPackDTO } from 'services/cv'
import type {
  AppDynamicsData,
  NonCustomFeildsInterface,
  AppDynamicsFomikFormInterface
} from '../../../AppDynamics/AppDHealthSource.types'
import { checkAppAndTierAreNotFixed } from '../../../AppDynamics/AppDHealthSource.utils'
import { HealthSoureSupportedConnectorTypes } from '../../../MonitoredServiceConnector.constants'
import { validateMetrics } from '../../../MonitoredServiceConnector.utils'
import AppTier from '../AppTier/AppTier'
import MetricPacks from '../MetricPacks/MetricPacks'

interface AppTierAndMetricPacksContainerProps {
  healthSourceData: AppDynamicsData
  isTemplate?: boolean
  expressions?: string[]
  appDTier: string
  appdApplication: string
  nonCustomFeilds: NonCustomFeildsInterface
  setNonCustomFeilds: Dispatch<SetStateAction<NonCustomFeildsInterface>>
  formik: FormikProps<AppDynamicsFomikFormInterface>
  isMetricThresholdEnabled: boolean
  //TODO - fix the any
  appTierAndMetricPackConfig: any
}

export default function AppTierAndMetricPacksContainer(props: AppTierAndMetricPacksContainerProps) {
  const {
    healthSourceData,
    isTemplate,
    expressions,
    appDTier,
    appdApplication,
    nonCustomFeilds,
    setNonCustomFeilds,
    formik,
    isMetricThresholdEnabled,
    appTierAndMetricPackConfig
  } = props

  const [selectedMetricPacks, setSelectedMetricPacks] = useState<TimeSeriesMetricPackDTO[]>([])
  const [appDValidation, setHealthSourceValidation] = useState<{
    status: string
    result: AppdynamicsValidationResponse[] | []
  }>({
    status: '',
    result: []
  })
  const [guidMap, setGuidMap] = useState(new Map())
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const connectorIdentifier = (healthSourceData?.connectorRef?.value || healthSourceData?.connectorRef) as string
  const [validationResultData, setValidationResultData] = useState<AppdynamicsValidationResponse[]>()
  const { appTier, metricPacks } = appTierAndMetricPackConfig

  const onValidate = useCallback(
    async (appName: string, tierName: string, metricObject: { [key: string]: any }): Promise<void> => {
      if (checkAppAndTierAreNotFixed(appName, tierName)) {
        return
      }
      setHealthSourceValidation({ status: StatusOfValidation.IN_PROGRESS, result: [] })
      const filteredMetricPack = selectedMetricPacks.filter(item => metricObject[item.identifier as string])
      const guid = Utils.randomId()
      setGuidMap(oldMap => {
        oldMap.set(tierName, guid)
        return new Map(oldMap)
      })
      const { validationStatus, validationResult } = await validateMetrics(
        filteredMetricPack || [],
        {
          accountId,
          appName: appName,
          tierName: tierName,
          connectorIdentifier: connectorIdentifier,
          orgIdentifier,
          projectIdentifier,
          requestGuid: guid
        },
        HealthSoureSupportedConnectorTypes.APP_DYNAMICS
      )
      setHealthSourceValidation({
        status: validationStatus as string,
        result: validationResult as AppdynamicsValidationResponse[]
      })
    },
    [accountId, connectorIdentifier, orgIdentifier, projectIdentifier, selectedMetricPacks]
  )

  return (
    <>
      {appTier?.enabled ? (
        <AppTier
          connectorIdentifier={connectorIdentifier}
          healthSourceData={healthSourceData}
          expressions={expressions}
          isTemplate={isTemplate}
          appDTier={appDTier}
          appdApplication={appdApplication}
          nonCustomFeilds={nonCustomFeilds}
          setNonCustomFeilds={setNonCustomFeilds}
          // Later add only required fields from formik or take formik context
          formik={formik}
          appDValidation={appDValidation}
          setHealthSourceValidation={setHealthSourceValidation}
          onValidate={onValidate}
          setValidationResultData={setValidationResultData}
          selectedMetricPacks={selectedMetricPacks}
          appTierConfig={appTier}
        />
      ) : null}
      {metricPacks?.enabled ? (
        <MetricPacks
          guidMap={guidMap}
          setSelectedMetricPacks={setSelectedMetricPacks}
          formik={formik}
          isMetricThresholdEnabled={isMetricThresholdEnabled}
          nonCustomFeilds={nonCustomFeilds}
          setNonCustomFeilds={setNonCustomFeilds}
          onValidate={onValidate}
          validationResultData={validationResultData}
          setValidationResultData={setValidationResultData}
        />
      ) : null}
    </>
  )
}
