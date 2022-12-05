/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo, useState } from 'react'
import { noop } from 'lodash-es'
import { Formik, FormikForm } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import DrawerFooter from '@cv/pages/health-source/common/DrawerFooter/DrawerFooter'
import { useFeatureFlag } from '@common/hooks/useFeatureFlag'
import { FeatureFlag } from '@common/featureFlags'
import useCommonGroupedSideNaveHook from '@cv/hooks/CommonGroupedSideNaveHook/useCommonGroupedSideNaveHook'
import type {
  CommonHealthSourceFormikInterface,
  HealthSourceConfig,
  HealthSourceInitialData
} from './CommonHealthSource.types'
import CustomMetricFormContainer from './components/CustomMetricForm/CustomMetricFormContainer'
import {
  initHealthSourceCustomForm,
  initializeNonCustomFields,
  // submitData,
  transformCommonHealthSourceToSetupSource
} from './CommonHealthSource.utils'
import css from './CommonHealthSource.module.scss'

export interface CommonHealthSourceProps {
  data: HealthSourceInitialData
  onSubmit: (healthSourcePayload: any) => void
  onPrevious: () => void
  isTemplate?: boolean
  expressions?: string[]
  healthSourceConfig: HealthSourceConfig
}

export default function CommonHealthSource({
  data: healthSourceData,
  // onSubmit,
  onPrevious,
  isTemplate,
  expressions,
  healthSourceConfig
}: CommonHealthSourceProps): JSX.Element {
  const { getString } = useStrings()
  const isMetricThresholdEnabled = useFeatureFlag(FeatureFlag.CVNG_METRIC_THRESHOLD) && !isTemplate
  const connectorIdentifier = (healthSourceData?.connectorRef?.value || healthSourceData?.connectorRef) as string

  const transformedSourceData = useMemo(
    () =>
      transformCommonHealthSourceToSetupSource(
        healthSourceData,
        getString,
        isTemplate
        // isMetricThresholdEnabled
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [healthSourceData]
  )

  const {
    createdMetrics,
    mappedMetrics,
    selectedMetric,
    groupedCreatedMetrics,
    // groupedCreatedMetricsList,
    setMappedMetrics,
    setCreatedMetrics,
    setGroupedCreatedMetrics
  } = useCommonGroupedSideNaveHook({
    defaultCustomMetricName: 'health source metric',
    initCustomMetricData: initHealthSourceCustomForm(),
    mappedServicesAndEnvs: transformedSourceData?.mappedServicesAndEnvs || new Map()
  })

  // TODO - this will be implemented for metric threshold
  // const [metricThresholds, setMetricThresholds] = useState<MetricThresholdsState>({
  //   ignoreThresholds: transformedSourceData.ignoreThresholds,
  //   failFastThresholds: transformedSourceData.failFastThresholds
  // })

  const [nonCustomFeilds, setNonCustomFeilds] = useState(() =>
    initializeNonCustomFields(healthSourceData, isMetricThresholdEnabled)
  )

  const initialFormValues = mappedMetrics.get(selectedMetric || '')

  return (
    <Formik<CommonHealthSourceFormikInterface>
      enableReinitialize
      formName={'healthSourceForm'}
      validateOnMount
      // TODO - This will be implemented once we add the validations
      // isInitialValid={(args: any) =>
      //   Object.keys(
      //     validateMapping({
      //       values: args.initialValues,
      //       createdMetrics: groupedCreatedMetricsList,
      //       selectedMetricIndex: groupedCreatedMetricsList.indexOf(selectedMetric),
      //       getString,
      //       mappedMetrics,
      //       isMetricThresholdEnabled
      //     })
      //   ).length === 0
      // }
      // validate={values => {
      //   return validateMapping({
      //     values,
      //     createdMetrics: groupedCreatedMetricsList,
      //     selectedMetricIndex: groupedCreatedMetricsList.indexOf(selectedMetric),
      //     getString,
      //     mappedMetrics,
      //     isMetricThresholdEnabled
      //   })
      // }}
      initialValues={{
        ...(initialFormValues as CommonHealthSourceFormikInterface)
        // ...metricThresholds
      }}
      onSubmit={noop}
    >
      {formik => {
        // This is a temporary fix to persist data
        // TODO - check later on
        // persistCustomMetric({
        //   mappedMetrics,
        //   selectedMetric,
        //   nonCustomFeilds,
        //   formikValues: formik.values,
        //   setMappedMetrics,
        //   isTemplate
        // })
        return (
          <FormikForm className={css.formFullheight}>
            <CustomMetricFormContainer
              mappedMetrics={mappedMetrics}
              selectedMetric={selectedMetric}
              setMappedMetrics={setMappedMetrics}
              connectorIdentifier={connectorIdentifier}
              isMetricThresholdEnabled={isMetricThresholdEnabled}
              nonCustomFeilds={nonCustomFeilds}
              setNonCustomFeilds={setNonCustomFeilds}
              createdMetrics={createdMetrics}
              setCreatedMetrics={setCreatedMetrics}
              setGroupedCreatedMetrics={setGroupedCreatedMetrics}
              isTemplate={isTemplate}
              expressions={expressions}
              healthSourceConfig={healthSourceConfig}
              healthSourceData={healthSourceData}
              groupedCreatedMetrics={groupedCreatedMetrics}
            />

            <DrawerFooter
              isSubmit
              onPrevious={onPrevious}
              onNext={() => {
                // For showing validation error message purpose
                formik.submitForm()

                if (formik.isValid) {
                  // TODO - this will be implemented once we implement the submit form
                  // submitData(formik, mappedMetrics, selectedMetric, onSubmit, groupedCreatedMetrics)
                }
              }}
            />
          </FormikForm>
        )
      }}
    </Formik>
  )
}
