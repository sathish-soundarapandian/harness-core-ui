import React, { useContext, useMemo } from 'react'
import { Formik } from 'formik'
import { noop } from 'lodash-es'
import { Container } from '@harness/uicore'
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

import css from './CloudWatch.module.scss'

export default function CloudWatch({ data, onSubmit }: CloudWatchProps): JSX.Element | null {
  const isCloudWatchEnabled = useFeatureFlag(FeatureFlag.SRM_ENABLE_HEALTHSOURCE_CLOUDWATCH_METRICS)

  const { onPrevious } = useContext(SetupSourceTabsContext)

  const { getString } = useStrings()

  const riskProfileResponse = useGetRiskCategoryForCustomHealthMetric({})

  const initialValues = getFormikInitialValue(data)

  const customMetricHelperContextValue = useMemo(() => {
    const value: CustomMetricsV2HelperContextType = {
      riskProfileResponse,
      groupedCreatedMetrics: {}
    }
    return value
  }, [riskProfileResponse])

  if (!isCloudWatchEnabled) {
    return null
  }

  return (
    <Container padding="medium" className={css.cloudWatch} data-testid="cloudWatchContainer">
      <Formik<CloudWatchFormType>
        validateOnMount
        initialValues={initialValues}
        validate={values => validateForm(values, getString)}
        onSubmit={noop}
      >
        {formikProps => {
          return (
            <>
              <CustomMetricsV2HelperContext.Provider value={customMetricHelperContextValue}>
                <CloudWatchContent />

                <Container height={200} />
                <DrawerFooter
                  isSubmit
                  onPrevious={onPrevious}
                  onNext={async () => {
                    formikProps.submitForm()

                    if (formikProps.isValid && isCloudWatchEnabled) {
                      const payload = createPayloadForCloudWatch({
                        setupSourceData: data,
                        formikValues: formikProps.values
                      })

                      await onSubmit(data, payload)
                    }
                  }}
                />
              </CustomMetricsV2HelperContext.Provider>
            </>
          )
        }}
      </Formik>
    </Container>
  )
}
