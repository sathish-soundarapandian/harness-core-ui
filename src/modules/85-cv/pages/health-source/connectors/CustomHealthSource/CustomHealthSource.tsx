/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useContext, useMemo, useState } from 'react'
import { Container, Formik, FormikForm } from '@wings-software/uicore'
import { noop } from 'lodash-es'
import { SetupSourceTabsContext } from '@cv/components/CVSetupSourcesView/SetupSourceTabs/SetupSourceTabs'
import DrawerFooter from '@cv/pages/health-source/common/DrawerFooter/DrawerFooter'
import useGroupedSideNaveHook from '@cv/hooks/GroupedSideNaveHook/useGroupedSideNaveHook'
import { useFeatureFlag } from '@common/hooks/useFeatureFlag'
import { FeatureFlag } from '@common/featureFlags'
import { useStrings } from 'framework/strings'
import {
  transformCustomHealthSourceToSetupSource,
  validateMappings,
  onSubmitCustomHealthSource,
  getInitCustomMetricData,
  persistCustomMetric
} from './CustomHealthSource.utils'
import type { CustomHealthSourceSetupSource, MapCustomHealthToService } from './CustomHealthSource.types'

import type { UpdatedHealthSource } from '../../HealthSourceDrawer/HealthSourceDrawerContent.types'
import CustomMetric from '../../common/CustomMetric/CustomMetric'

import type { CustomMappedMetric } from '../../common/CustomMetric/CustomMetric.types'
import CustomHealthSourceForm from './CustomHealthSourceForm'
import { defaultMetricName } from './CustomHealthSource.constants'
import { getCustomMetricGroupNames } from '../../common/MetricThresholds/MetricThresholds.utils'
import type { MetricThresholdsState } from '../../common/MetricThresholds/MetricThresholds.types'
import MetricThresholdProvider from './components/MetricThresholds/MetricThresholdProvider'
import { getMetricNameFilteredNonCustomFields } from '../MonitoredServiceConnector.utils'
import css from './CustomHealthSource.module.scss'

export interface CustomHealthSourceProps {
  data: any
  onSubmit: (formdata: CustomHealthSourceSetupSource, UpdatedHealthSource: UpdatedHealthSource) => Promise<void>
}

export function CustomHealthSource(props: CustomHealthSourceProps): JSX.Element {
  const { getString } = useStrings()
  const { onPrevious } = useContext(SetupSourceTabsContext)

  const { data: sourceData, onSubmit } = props

  const isMetricThresholdEnabled = useFeatureFlag(FeatureFlag.CVNG_METRIC_THRESHOLD)

  const transformedSourceData = useMemo(
    () => transformCustomHealthSourceToSetupSource(sourceData, isMetricThresholdEnabled),
    [isMetricThresholdEnabled, sourceData]
  )

  const [metricThresholds, setMetricThresholds] = useState<MetricThresholdsState>({
    ignoreThresholds: transformedSourceData.ignoreThresholds,
    failFastThresholds: transformedSourceData.failFastThresholds
  })

  const {
    createdMetrics,
    mappedMetrics,
    selectedMetric,
    groupedCreatedMetrics,
    groupedCreatedMetricsList,
    setMappedMetrics,
    setCreatedMetrics,
    setGroupedCreatedMetrics
  } = useGroupedSideNaveHook({
    defaultCustomMetricName: defaultMetricName,
    initCustomMetricData: getInitCustomMetricData(''),
    mappedServicesAndEnvs: transformedSourceData.mappedServicesAndEnvs as Map<string, CustomMappedMetric>
  })

  const filterRemovedMetricNameThresholds = useCallback(
    (deletedMetricName: string) => {
      if (isMetricThresholdEnabled && deletedMetricName) {
        const updatedMetricThresholds = getMetricNameFilteredNonCustomFields<MetricThresholdsState>(
          isMetricThresholdEnabled,
          metricThresholds,
          deletedMetricName
        )

        setMetricThresholds(updatedMetricThresholds)
      }
    },
    [isMetricThresholdEnabled, metricThresholds]
  )

  const initialFormValues = {
    ...mappedMetrics?.get(selectedMetric || ''),
    ...metricThresholds
  } as MapCustomHealthToService

  return (
    <Formik<MapCustomHealthToService>
      formName="mapCustomhealth"
      initialValues={initialFormValues}
      isInitialValid={(args: any) =>
        Object.keys(
          validateMappings(
            getString,
            groupedCreatedMetricsList,
            groupedCreatedMetricsList.indexOf(selectedMetric),
            args.initialValues,
            isMetricThresholdEnabled
          )
        ).length === 0
      }
      onSubmit={noop}
      enableReinitialize={true}
      validate={values => {
        return validateMappings(
          getString,
          groupedCreatedMetricsList,
          groupedCreatedMetricsList.indexOf(selectedMetric),
          values,
          isMetricThresholdEnabled
        )
      }}
    >
      {formikProps => {
        persistCustomMetric({
          mappedMetrics,
          selectedMetric,
          metricThresholds,
          formikValues: formikProps.values,
          setMappedMetrics
        })
        return (
          <FormikForm className={css.formFullheight}>
            <CustomMetric
              isValidInput={formikProps.isValid}
              setMappedMetrics={setMappedMetrics}
              selectedMetric={selectedMetric}
              formikValues={formikProps.values as any}
              mappedMetrics={mappedMetrics}
              createdMetrics={createdMetrics}
              setCreatedMetrics={setCreatedMetrics}
              defaultMetricName={defaultMetricName}
              tooptipMessage={getString('cv.monitoringSources.gcoLogs.addQueryTooltip')}
              addFieldLabel={getString('cv.monitoringSources.addMetric')}
              initCustomForm={getInitCustomMetricData(formikProps.values.baseURL) as any}
              groupedCreatedMetrics={groupedCreatedMetrics}
              setGroupedCreatedMetrics={setGroupedCreatedMetrics}
              isMetricThresholdEnabled={isMetricThresholdEnabled}
              filterRemovedMetricNameThresholds={filterRemovedMetricNameThresholds}
            >
              <CustomHealthSourceForm
                formValue={formikProps.values}
                onFieldChange={formikProps.setFieldValue}
                onValueChange={formikProps.setValues}
                mappedMetrics={mappedMetrics}
                selectedMetric={selectedMetric}
                connectorIdentifier={sourceData?.connectorRef || ''}
              />
            </CustomMetric>
            <DrawerFooter
              isSubmit
              onPrevious={onPrevious}
              onNext={() => {
                formikProps.submitForm()

                if (formikProps.isValid) {
                  onSubmitCustomHealthSource({
                    formikProps,
                    mappedMetrics,
                    selectedMetric,
                    onSubmit,
                    sourceData,
                    transformedSourceData,
                    isMetricThresholdEnabled,
                    metricThresholds
                  })
                }
              }}
            />
            {isMetricThresholdEnabled && Boolean(getCustomMetricGroupNames(groupedCreatedMetrics).length) && (
              <MetricThresholdProvider
                formikValues={formikProps.values}
                setThresholdState={setMetricThresholds}
                groupedCreatedMetrics={groupedCreatedMetrics}
              />
            )}
            <Container className={css.spaceProvider} />
          </FormikForm>
        )
      }}
    </Formik>
  )
}
