/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useMemo, useState } from 'react'
import { defaultTo, noop } from 'lodash-es'
import { Formik, FormikForm } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import DrawerFooter from '@cv/pages/health-source/common/DrawerFooter/DrawerFooter'
import { useFeatureFlag } from '@common/hooks/useFeatureFlag'
import { FeatureFlag } from '@common/featureFlags'
import useGroupedSideNaveHook from '@cv/hooks/GroupedSideNaveHook/useGroupedSideNaveHook'
import type { AppDynamicsData, AppDynamicsFomikFormInterface } from './../AppDynamics/AppDHealthSource.types'
import css from './../AppDynamics/AppDHealthSource.module.scss'
import AppTierAndMetricPacksContainer from './components/AppTierAndMetricPacksContainer/AppTierAndMetricPacksContainer'
import {
  createAppDFormData,
  initAppDCustomFormValue,
  initializeNonCustomFields,
  persistCustomMetric,
  resetShowCustomMetric,
  submitData,
  validateMapping
} from '../AppDynamics/AppDHealthSource.utils'
import healthSourceConfig from './HealthSourceConfigs/AppDHealthSourceConfig.json'

export default function CommonHealthSource({
  data: healthSourceData,
  onSubmit,
  onPrevious,
  isTemplate,
  expressions
}: {
  data: AppDynamicsData
  onSubmit: (healthSourcePayload: any) => void
  onPrevious: () => void
  isTemplate?: boolean
  expressions?: string[]
}): JSX.Element {
  const { getString } = useStrings()

  const isMetricThresholdEnabled = useFeatureFlag(FeatureFlag.CVNG_METRIC_THRESHOLD) && !isTemplate

  const [showCustomMetric, setShowCustomMetric] = useState(
    !!Array.from(defaultTo(healthSourceData?.mappedServicesAndEnvs, []))?.length
  )

  const {
    // Commented fields will be used later
    // createdMetrics,
    mappedMetrics,
    selectedMetric,
    groupedCreatedMetrics,
    groupedCreatedMetricsList,
    setMappedMetrics
    // setCreatedMetrics,
    // setGroupedCreatedMetrics
  } = useGroupedSideNaveHook({
    defaultCustomMetricName: getString('cv.monitoringSources.appD.defaultAppDMetricName'),
    initCustomMetricData: initAppDCustomFormValue(),
    mappedServicesAndEnvs: showCustomMetric ? healthSourceData?.mappedServicesAndEnvs : new Map()
  })

  const [nonCustomFeilds, setNonCustomFeilds] = useState(() =>
    initializeNonCustomFields(healthSourceData, isMetricThresholdEnabled)
  )

  const initPayload = useMemo(
    () =>
      createAppDFormData(
        healthSourceData,
        mappedMetrics,
        selectedMetric,
        nonCustomFeilds,
        showCustomMetric,
        isTemplate
      ),
    [healthSourceData, mappedMetrics, selectedMetric, nonCustomFeilds, showCustomMetric, isTemplate]
  )

  useEffect(() => {
    resetShowCustomMetric(selectedMetric, mappedMetrics, setShowCustomMetric)
  }, [mappedMetrics, selectedMetric])

  return (
    <Formik<AppDynamicsFomikFormInterface>
      enableReinitialize
      formName={'appDHealthSourceform'}
      validateOnMount
      isInitialValid={(args: any) =>
        Object.keys(
          validateMapping({
            values: args.initialValues,
            createdMetrics: groupedCreatedMetricsList,
            selectedMetricIndex: groupedCreatedMetricsList.indexOf(selectedMetric),
            getString,
            mappedMetrics,
            isMetricThresholdEnabled
          })
        ).length === 0
      }
      validate={values => {
        return validateMapping({
          values,
          createdMetrics: groupedCreatedMetricsList,
          selectedMetricIndex: groupedCreatedMetricsList.indexOf(selectedMetric),
          getString,
          mappedMetrics,
          isMetricThresholdEnabled
        })
      }}
      initialValues={initPayload}
      onSubmit={noop}
    >
      {formik => {
        // This is a temporary fix to persist data
        persistCustomMetric({
          mappedMetrics,
          selectedMetric,
          nonCustomFeilds,
          formikValues: formik.values,
          setMappedMetrics,
          isTemplate
        })
        return (
          <FormikForm className={css.formFullheight}>
            {healthSourceConfig?.appTierAndMetricPack ? (
              <AppTierAndMetricPacksContainer
                healthSourceData={healthSourceData}
                expressions={expressions}
                isTemplate={isTemplate}
                appDTier={initPayload?.appDTier}
                appdApplication={initPayload?.appdApplication}
                nonCustomFeilds={nonCustomFeilds}
                setNonCustomFeilds={setNonCustomFeilds}
                isMetricThresholdEnabled={isMetricThresholdEnabled}
                appTierAndMetricPackConfig={healthSourceConfig?.appTierAndMetricPack}
                // Later add only required fields from formik or take formik context
                formik={formik}
              />
            ) : null}

            <DrawerFooter
              isSubmit
              onPrevious={onPrevious}
              onNext={() => {
                // For showing validation error message purpose
                formik.submitForm()

                if (formik.isValid) {
                  submitData(formik, mappedMetrics, selectedMetric, onSubmit, groupedCreatedMetrics)
                }
              }}
            />
          </FormikForm>
        )
      }}
    </Formik>
  )
}
