/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
import { noop } from 'lodash-es'
import { Container, Formik, FormikForm } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import DrawerFooter from '@cv/pages/health-source/common/DrawerFooter/DrawerFooter'
import { useFeatureFlag } from '@common/hooks/useFeatureFlag'
import { FeatureFlag } from '@common/featureFlags'
import type {
  CommonHealthSourceConfigurations,
  CommonCustomMetricFormikInterface,
  HealthSourceConfig,
  HealthSourceInitialData
} from './CommonHealthSource.types'
import CustomMetricFormContainer from './components/CustomMetricForm/CustomMetricFormContainer'
import { initHealthSourceCustomForm, transformCommonHealthSourceToSetupSource } from './CommonHealthSource.utils'
import {
  initGroupedCreatedMetrics,
  initializeSelectedMetricsMap
} from '../../common/CommonCustomMetric/CommonCustomMetric.utils'
import CommonHealthSourceProvider from './components/CustomMetricForm/components/CommonHealthSourceContext/CommonHealthSourceContext'
import { getCanShowMetricThresholds } from '../../common/MetricThresholds/MetricThresholds.utils'
import MetricThresholdProvider from './components/MetricThresholds/MetricThresholdProvider'
import css from './CommonHealthSource.module.scss'

export interface CommonHealthSourceProps {
  data: HealthSourceInitialData
  onSubmit: (healthSourcePayload: any) => void
  onPrevious: (formikValues: CommonHealthSourceConfigurations) => void
  isTemplate?: boolean
  expressions?: string[]
  healthSourceConfig: HealthSourceConfig
}

export default function CommonHealthSource({
  data: healthSourceData,
  onPrevious,
  isTemplate,
  expressions,
  healthSourceConfig
}: CommonHealthSourceProps): JSX.Element {
  const { getString } = useStrings()
  const isMetricThresholdEnabled = useFeatureFlag(FeatureFlag.CVNG_METRIC_THRESHOLD) && !isTemplate
  const connectorIdentifier = (healthSourceData?.connectorRef?.value || healthSourceData?.connectorRef) as string

  const transformedSourceData = useMemo(
    () => transformCommonHealthSourceToSetupSource(healthSourceData, getString),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [healthSourceData]
  )

  const { selectedMetric, mappedMetrics } = initializeSelectedMetricsMap(
    'health source metric',
    initHealthSourceCustomForm(),
    transformedSourceData?.customMetricsMap || new Map(),
    transformedSourceData?.selectedMetric
  )

  const { ignoreThresholds = [], failFastThresholds = [] } = transformedSourceData

  const healthSourceConfigurationsInitialValues = {
    // Custom metric fields
    customMetricsMap: mappedMetrics,
    selectedMetric,

    // metric threshold section
    ignoreThresholds,
    failFastThresholds
  }

  return (
    <Formik<CommonHealthSourceConfigurations>
      enableReinitialize
      initialValues={healthSourceConfigurationsInitialValues}
      formName="healthSourceConfigurationsForm"
      onSubmit={() => {
        // TODO - will be implemented
      }}
    >
      {formik => {
        const { customMetricsMap, selectedMetric: currentSelectedMetric } = formik.values
        const createdMetrics = Array.from(formik.values.customMetricsMap.keys()) || ['health source metric']
        const groupedCreatedMetrics = initGroupedCreatedMetrics(formik.values.customMetricsMap, getString)
        const hasEmptySet = customMetricsMap.has('')
        if (hasEmptySet) {
          customMetricsMap.delete('')
        }
        const isShowMetricThreshold = getCanShowMetricThresholds({
          isMetricThresholdConfigEnabled: Boolean(healthSourceConfig?.metricThresholds?.enabled),
          isMetricThresholdFFEnabled: isMetricThresholdEnabled,
          isMetricPacksEnabled: Boolean(healthSourceConfig?.metricPacks?.enabled),
          groupedCreatedMetrics
        })

        return (
          <>
            {/* Non custom fields section can be added here */}

            <CommonHealthSourceProvider updateParentFormik={formik.setFieldValue}>
              <FormikForm>
                <Formik<CommonCustomMetricFormikInterface>
                  enableReinitialize
                  formName={'customMetricForm'}
                  validateOnMount
                  initialValues={{
                    ...(customMetricsMap.get(currentSelectedMetric) as CommonCustomMetricFormikInterface)
                  }}
                  onSubmit={noop}
                >
                  {() => {
                    return (
                      <FormikForm className={css.formFullheight}>
                        <CustomMetricFormContainer
                          setConfigurationsFormikFieldValue={formik.setFieldValue}
                          mappedMetrics={customMetricsMap}
                          selectedMetric={currentSelectedMetric}
                          connectorIdentifier={connectorIdentifier}
                          isMetricThresholdEnabled={isMetricThresholdEnabled}
                          createdMetrics={createdMetrics}
                          isTemplate={isTemplate}
                          expressions={expressions}
                          healthSourceConfig={healthSourceConfig}
                          healthSourceData={healthSourceData}
                          groupedCreatedMetrics={groupedCreatedMetrics}
                        />
                      </FormikForm>
                    )
                  }}
                </Formik>
                {/* ⭐️ Metric threshold section  */}
                {isShowMetricThreshold && (
                  <MetricThresholdProvider
                    formikValues={formik.values}
                    groupedCreatedMetrics={groupedCreatedMetrics}
                    metricPacks={[]}
                    isOnlyCustomMetricHealthSource={!healthSourceConfig?.metricPacks?.enabled}
                  />
                )}
              </FormikForm>
              {/* Empty space at bottom */}
              <Container height={200} />
            </CommonHealthSourceProvider>
            {/* Metric threshold section can be added here */}
            <DrawerFooter
              isSubmit
              onPrevious={() => onPrevious(formik.values)}
              onNext={() => {
                // For showing validation error message purpose
                formik.submitForm()

                if (formik.isValid) {
                  // TODO - this will be implemented once we implement the submit form
                  // submitData(formik, mappedMetrics, selectedMetric, onSubmit, groupedCreatedMetrics)
                }
              }}
            />
          </>
        )
      }}
    </Formik>
  )
}
