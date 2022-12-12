/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
import { noop } from 'lodash-es'
import { Formik, FormikForm } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import DrawerFooter from '@cv/pages/health-source/common/DrawerFooter/DrawerFooter'
import { useFeatureFlag } from '@common/hooks/useFeatureFlag'
import { FeatureFlag } from '@common/featureFlags'
import useCommonGroupedSideNaveHook from '@cv/hooks/CommonGroupedSideNaveHook/useCommonGroupedSideNaveHook'
import type {
  CommonHealthSourceConfigurations,
  CommonCustomMetricFormikInterface,
  HealthSourceConfig,
  HealthSourceInitialData
} from './CommonHealthSource.types'
import CustomMetricFormContainer from './components/CustomMetricForm/CustomMetricFormContainer'
import {
  initHealthSourceCustomForm,
  // submitData,
  transformCommonHealthSourceToSetupSource
} from './CommonHealthSource.utils'
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

  const {
    createdMetrics,
    mappedMetrics,
    selectedMetric,
    groupedCreatedMetrics,
    setMappedMetrics,
    setCreatedMetrics,
    setGroupedCreatedMetrics
  } = useCommonGroupedSideNaveHook({
    defaultCustomMetricName: 'health source metric',
    initCustomMetricData: initHealthSourceCustomForm(),
    mappedServicesAndEnvs: transformedSourceData?.mappedServicesAndEnvs || new Map(),
    selectedMetricData: transformedSourceData?.selectedMetric
  })

  const initialCustomMetricFormValues = mappedMetrics?.get(selectedMetric || '')
  const { ignoreThresholds = [], failFastThresholds = [] } = transformedSourceData

  const healthSourceConfigurationsInitialValues = {
    // Custom metric fields
    mappedServicesAndEnvs: mappedMetrics,
    selectedMetric,

    // metric threshold section
    ignoreThresholds,
    failFastThresholds
  }

  return (
    <>
      <Formik<CommonHealthSourceConfigurations>
        enableReinitialize
        initialValues={healthSourceConfigurationsInitialValues}
        formName="healthSourceConfigurationsForm"
        onSubmit={() => {
          // TODO - will be implemented
        }}
      >
        {formik => {
          return (
            <>
              {/* Non custom fields section can be added here */}
              <FormikForm>
                <Formik<CommonCustomMetricFormikInterface>
                  enableReinitialize
                  formName={'customMetricForm'}
                  validateOnMount
                  initialValues={{
                    ...(initialCustomMetricFormValues as CommonCustomMetricFormikInterface)
                  }}
                  onSubmit={noop}
                >
                  {() => {
                    return (
                      <FormikForm className={css.formFullheight}>
                        <CustomMetricFormContainer
                          mappedMetrics={mappedMetrics}
                          selectedMetric={selectedMetric}
                          setMappedMetrics={setMappedMetrics}
                          connectorIdentifier={connectorIdentifier}
                          isMetricThresholdEnabled={isMetricThresholdEnabled}
                          createdMetrics={createdMetrics}
                          setCreatedMetrics={setCreatedMetrics}
                          setGroupedCreatedMetrics={setGroupedCreatedMetrics}
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
              </FormikForm>
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
    </>
  )
}
