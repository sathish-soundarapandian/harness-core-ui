import CardWithOuterTitle from '@common/components/CardWithOuterTitle/CardWithOuterTitle'
import { Connectors } from '@connectors/constants'
import MetricsVerificationModal from '@cv/components/MetricsVerificationModal/MetricsVerificationModal'
import { Color, Layout, Text } from '@harness/uicore'
import type { FormikProps } from 'formik'
import { useStrings } from 'framework/strings'
import { css } from 'highcharts'
import React, { Dispatch, SetStateAction, useCallback } from 'react'
import type { AppdynamicsValidationResponse, TimeSeriesMetricPackDTO } from 'services/cv'
import type {
  AppDynamicsFomikFormInterface,
  NonCustomFeildsInterface
} from '../../../AppDynamics/AppDHealthSource.types'
import MetricPackCustom from '../../../MetricPackCustom'
import { HealthSoureSupportedConnectorTypes } from '../../../MonitoredServiceConnector.constants'
import { getUpdatedNonCustomFields } from '../../../MonitoredServiceConnector.utils'

interface MetricPacksProps {
  setSelectedMetricPacks: Dispatch<SetStateAction<TimeSeriesMetricPackDTO[]>>
  formik: FormikProps<AppDynamicsFomikFormInterface>
  isMetricThresholdEnabled: boolean
  nonCustomFeilds: NonCustomFeildsInterface
  setNonCustomFeilds: Dispatch<SetStateAction<NonCustomFeildsInterface>>
  onValidate: (appName: string, tierName: string, metricObject: { [key: string]: any }) => Promise<void>
  guidMap: Map<any, any>
  validationResultData?: AppdynamicsValidationResponse[]
  setValidationResultData: Dispatch<SetStateAction<AppdynamicsValidationResponse[] | undefined>>
}

export default function MetricPacks(props: MetricPacksProps) {
  const {
    setSelectedMetricPacks,
    formik,
    isMetricThresholdEnabled,
    nonCustomFeilds,
    setNonCustomFeilds,
    onValidate,
    guidMap,
    validationResultData,
    setValidationResultData
  } = props
  const { getString } = useStrings()

  const handleMetricPackUpdate = useCallback(
    async (metricPackIdentifier: string, updatedValue: boolean, appdApplication: string, appDTier: string) => {
      if (typeof metricPackIdentifier === 'string') {
        const updatedNonCustomFields = getUpdatedNonCustomFields(
          isMetricThresholdEnabled,
          nonCustomFeilds,
          metricPackIdentifier,
          updatedValue
        )

        setNonCustomFeilds(updatedNonCustomFields as NonCustomFeildsInterface)

        if (appdApplication && appDTier) {
          await onValidate(appdApplication, appDTier, updatedNonCustomFields.metricData)
        }
      }
    },
    [isMetricThresholdEnabled, nonCustomFeilds, onValidate]
  )

  return (
    <CardWithOuterTitle title={getString('metricPacks')}>
      <Layout.Vertical>
        <Text color={Color.BLACK}>{getString('cv.healthSource.connectors.AppDynamics.metricPackLabel')}</Text>
        <Layout.Horizontal spacing={'large'} className={css.horizontalCenterAlign}>
          <MetricPackCustom
            setMetricDataValue={value => {
              setNonCustomFeilds({
                ...nonCustomFeilds,
                metricData: value
              })
            }}
            metricPackValue={formik.values.metricPacks}
            metricDataValue={formik.values.metricData}
            setSelectedMetricPacks={setSelectedMetricPacks}
            connector={HealthSoureSupportedConnectorTypes.APP_DYNAMICS}
            isMetricThresholdEnabled={isMetricThresholdEnabled}
            onChange={(metricPackIdentifier, updatedValue) =>
              handleMetricPackUpdate(
                metricPackIdentifier,
                updatedValue,
                formik?.values.appdApplication,
                formik?.values.appDTier
              )
            }
          />
          {validationResultData && (
            <MetricsVerificationModal
              verificationData={validationResultData}
              guid={guidMap.get(formik?.values?.appDTier)}
              onHide={setValidationResultData as () => void}
              verificationType={Connectors.APP_DYNAMICS}
            />
          )}
        </Layout.Horizontal>
      </Layout.Vertical>
    </CardWithOuterTitle>
  )
}
