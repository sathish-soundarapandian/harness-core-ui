import React, { useContext, useMemo } from 'react'
import { Formik, FormikForm, Container, getMultiTypeFromValue, MultiTypeInputType } from '@harness/uicore'
import { noop } from 'lodash-es'
import { useStrings } from 'framework/strings'
import { useGetRiskCategoryForCustomHealthMetric } from 'services/cv'
import { SetupSourceTabsContext } from '@cv/components/CVSetupSourcesView/SetupSourceTabs/SetupSourceTabs'
import { useFeatureFlag } from '@common/hooks/useFeatureFlag'
import { FeatureFlag } from '@common/featureFlags'
import CloudWatchContent from './components/CloudWatchContent'
import type { CloudWatchFormType, CloudWatchProps } from './CloudWatch.types'
import DrawerFooter from '../../common/DrawerFooter/DrawerFooter'
import { createPayloadForCloudWatch, getFormikInitialValue, validateForm } from './CloudWatch.utils'
import { CustomMetricsV2HelperContext } from '../../common/CustomMetricV2/CustomMetricV2.constants'
import type { CustomMetricsV2HelperContextType } from '../../common/CustomMetricV2/CustomMetric.types'
import MetricThresholdProvider from './components/MetricThresholds/MetricThresholdProvider'
import { getGroupedCustomMetrics } from '../../common/CustomMetricV2/CustomMetric.utils'
import { getCustomMetricGroupNames } from '../../common/MetricThresholds/MetricThresholds.utils'
import { getConnectorRef } from '../../common/utils/HealthSource.utils'
import css from './CloudWatch.module.scss'

export default function CloudWatch({ data, onSubmit, isTemplate, expressions }: CloudWatchProps): JSX.Element | null {
  const isCloudWatchEnabled = useFeatureFlag(FeatureFlag.SRM_ENABLE_HEALTHSOURCE_CLOUDWATCH_METRICS)

  const { onPrevious } = useContext(SetupSourceTabsContext)

  const isMetricThresholdEnabled = useFeatureFlag(FeatureFlag.CVNG_METRIC_THRESHOLD) && !isTemplate

  const { getString } = useStrings()

  const riskProfileResponse = useGetRiskCategoryForCustomHealthMetric({})

  const initialValues = getFormikInitialValue(data, isMetricThresholdEnabled)

  const connectorIdentifier = getConnectorRef(data?.connectorRef)
  const isConnectorRuntimeOrExpression = getMultiTypeFromValue(connectorIdentifier) !== MultiTypeInputType.FIXED

  const customMetricHelperContextValue = useMemo(() => {
    const value: CustomMetricsV2HelperContextType = {
      riskProfileResponse,
      groupedCreatedMetrics: {},
      isTemplate,
      expressions,
      isConnectorRuntimeOrExpression
    }
    return value
  }, [expressions, isConnectorRuntimeOrExpression, isTemplate, riskProfileResponse])

  if (!isCloudWatchEnabled) {
    return null
  }

  return (
    <Container padding="medium" className={css.cloudWatch} data-testid="cloudWatchContainer">
      <Formik<CloudWatchFormType>
        formName="cloudWatch"
        validateOnMount
        initialValues={initialValues}
        validate={values => validateForm(values, getString, isMetricThresholdEnabled)}
        onSubmit={noop}
      >
        {formikProps => {
          const groupedCreatedMetrics = getGroupedCustomMetrics(formikProps.values.customMetrics, getString)

          return (
            <FormikForm>
              <CustomMetricsV2HelperContext.Provider value={customMetricHelperContextValue}>
                <CloudWatchContent />

                {isMetricThresholdEnabled && Boolean(getCustomMetricGroupNames(groupedCreatedMetrics).length) && (
                  <MetricThresholdProvider
                    formikValues={formikProps.values}
                    groupedCreatedMetrics={groupedCreatedMetrics}
                  />
                )}

                <Container height={200} />
                <DrawerFooter
                  isSubmit
                  onPrevious={onPrevious}
                  onNext={async () => {
                    formikProps.submitForm()

                    if (formikProps.isValid && isCloudWatchEnabled) {
                      const payload = createPayloadForCloudWatch({
                        setupSourceData: data,
                        formikValues: formikProps.values,
                        isMetricThresholdEnabled
                      })

                      await onSubmit(data, payload)
                    }
                  }}
                />
              </CustomMetricsV2HelperContext.Provider>
            </FormikForm>
          )
        }}
      </Formik>
    </Container>
  )
}
