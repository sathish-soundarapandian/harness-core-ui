/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo, useState, useEffect, useCallback } from 'react'
import {
  Button,
  Container,
  Formik,
  FormikForm,
  getMultiTypeFromValue,
  MultiTypeInputType
} from '@wings-software/uicore'
import { PopoverInteractionKind } from '@blueprintjs/core'
import { noop } from 'lodash-es'
import { useParams } from 'react-router-dom'
import { TimeSeriesMetricPackDTO, useGetMetricPacks } from 'services/cv'
import type {
  DynatraceFormDataInterface,
  DynatraceHealthSourceProps
} from '@cv/pages/health-source/connectors/Dynatrace/DynatraceHealthSource.types'
import DrawerFooter from '@cv/pages/health-source/common/DrawerFooter/DrawerFooter'
import useGroupedSideNaveHook from '@cv/hooks/GroupedSideNaveHook/useGroupedSideNaveHook'
import { useFeatureFlag } from '@common/hooks/useFeatureFlag'
import { FeatureFlag } from '@common/featureFlags'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import {
  defaultDynatraceCustomMetric,
  mapDynatraceDataToDynatraceForm,
  onSubmitDynatraceData,
  validateMapping,
  setApplicationIfConnectorIsInput,
  persistCustomMetric
} from '@cv/pages/health-source/connectors/Dynatrace/DynatraceHealthSource.utils'
import DynatraceCustomMetrics from '@cv/pages/health-source/connectors/Dynatrace/components/DynatraceCustomMetrics/DynatraceCustomMetrics'
import CardWithOuterTitle from '@common/components/CardWithOuterTitle/CardWithOuterTitle'
import DynatraceMetricPacksToService from './components/DynatraceMetricPacksToService/DynatraceMetricPacksToService'

import CustomMetric from '../../common/CustomMetric/CustomMetric'
import { resetShowCustomMetric } from '../AppDynamics/AppDHealthSource.utils'
import { getIsMetricThresholdCanBeShown } from '../../common/MetricThresholds/MetricThresholds.utils'
import MetricThresholdProvider from './components/MetricThresholds/MetricThresholdProvider'
import { getMetricNameFilteredNonCustomFields } from '../MonitoredServiceConnector.utils'
import css from '@cv/pages/health-source/connectors/Dynatrace/DynatraceHealthSource.module.scss'

export default function DynatraceHealthSource(props: DynatraceHealthSourceProps): JSX.Element {
  const {
    dynatraceFormData: initialPayload,
    connectorIdentifier,
    onPrevious,
    onSubmit,
    isTemplate,
    expressions
  } = props
  const { getString } = useStrings()
  const [dynatraceMetricData, setDynatraceMetricData] = useState<DynatraceFormDataInterface>(initialPayload)
  const [showCustomMetric, setShowCustomMetric] = useState<boolean>(!!dynatraceMetricData.customMetrics.size)
  const isConnectorRuntimeOrExpression = getMultiTypeFromValue(connectorIdentifier) !== MultiTypeInputType.FIXED

  const isMetricThresholdEnabled = useFeatureFlag(FeatureFlag.CVNG_METRIC_THRESHOLD) && !isTemplate

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
    defaultCustomMetricName: getString('cv.healthSource.connectors.Dynatrace.defaultMetricName'),
    initCustomMetricData: defaultDynatraceCustomMetric(getString),
    mappedServicesAndEnvs: showCustomMetric ? dynatraceMetricData.customMetrics : new Map()
  })

  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const metricPackResponse = useGetMetricPacks({
    queryParams: { projectIdentifier, orgIdentifier, accountId, dataSourceType: 'DYNATRACE' }
  })

  const dynatraceMetricFormData = useMemo(
    () => mapDynatraceDataToDynatraceForm(dynatraceMetricData, mappedMetrics, selectedMetric, showCustomMetric),
    [dynatraceMetricData, mappedMetrics, selectedMetric, showCustomMetric]
  )

  const filterRemovedMetricNameThresholds = useCallback(
    (deletedMetricName: string) => {
      if (isMetricThresholdEnabled && deletedMetricName) {
        const updatedNonCustomFields = getMetricNameFilteredNonCustomFields<DynatraceFormDataInterface>(
          isMetricThresholdEnabled,
          dynatraceMetricData,
          deletedMetricName
        )

        setDynatraceMetricData(updatedNonCustomFields)
      }
    },
    [dynatraceMetricData, isMetricThresholdEnabled]
  )

  useEffect(() => {
    setApplicationIfConnectorIsInput(
      isConnectorRuntimeOrExpression,
      dynatraceMetricFormData,
      setDynatraceMetricData,
      setMappedMetrics
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    resetShowCustomMetric(selectedMetric, mappedMetrics, setShowCustomMetric)
  }, [mappedMetrics, selectedMetric])

  return (
    <Formik<DynatraceFormDataInterface>
      onSubmit={noop}
      enableReinitialize
      formName={'dynatraceHealthSourceForm'}
      isInitialValid={(args: any) =>
        Object.keys(
          validateMapping(
            args.initialValues,
            groupedCreatedMetricsList,
            groupedCreatedMetricsList.indexOf(selectedMetric),
            getString,
            mappedMetrics,
            isMetricThresholdEnabled
          )
        ).length === 0
      }
      validate={values => {
        return validateMapping(
          values,
          groupedCreatedMetricsList,
          groupedCreatedMetricsList.indexOf(selectedMetric),
          getString,
          mappedMetrics,
          isMetricThresholdEnabled
        )
      }}
      initialValues={dynatraceMetricFormData}
    >
      {formik => {
        // This is a temporary fix to persist data
        // https://harness.atlassian.net/browse/SRM-11942
        persistCustomMetric({
          mappedMetrics,
          selectedMetric,
          dynatraceMetricData,
          formikValues: formik.values,
          setMappedMetrics
        })

        const selectedServiceValue =
          typeof formik.values.selectedService !== 'string'
            ? formik.values.selectedService?.value
            : formik.values.selectedService

        if (isTemplate) {
          formik.values['isManualQuery'] = isTemplate
        }

        return (
          <FormikForm className={css.formFullheight}>
            <DynatraceMetricPacksToService
              connectorIdentifier={connectorIdentifier}
              dynatraceMetricData={dynatraceMetricData}
              setDynatraceMetricData={setDynatraceMetricData}
              metricValues={formik.values}
              metricErrors={formik.errors}
              isTemplate={isTemplate}
              expressions={expressions}
              isMetricThresholdEnabled={isMetricThresholdEnabled}
            />
            {showCustomMetric ? (
              <CustomMetric
                isValidInput={formik.isValid}
                setMappedMetrics={setMappedMetrics}
                selectedMetric={selectedMetric}
                formikValues={formik.values}
                mappedMetrics={mappedMetrics}
                createdMetrics={createdMetrics}
                groupedCreatedMetrics={groupedCreatedMetrics}
                setCreatedMetrics={setCreatedMetrics}
                setGroupedCreatedMetrics={setGroupedCreatedMetrics}
                defaultMetricName={getString('cv.healthSource.connectors.Dynatrace.defaultMetricName')}
                tooptipMessage={getString('cv.monitoringSources.gcoLogs.addQueryTooltip')}
                addFieldLabel={getString('cv.monitoringSources.addMetric')}
                initCustomForm={defaultDynatraceCustomMetric(getString)}
                shouldBeAbleToDeleteLastMetric
                isMetricThresholdEnabled={isMetricThresholdEnabled}
                filterRemovedMetricNameThresholds={filterRemovedMetricNameThresholds}
              >
                <DynatraceCustomMetrics
                  metricValues={formik.values}
                  formikSetField={formik.setFieldValue}
                  mappedMetrics={mappedMetrics}
                  selectedMetric={selectedMetric}
                  connectorIdentifier={connectorIdentifier}
                  selectedServiceId={(selectedServiceValue as string) || ''}
                  isTemplate={isTemplate}
                  expressions={expressions}
                  metricPackResponse={metricPackResponse}
                />
              </CustomMetric>
            ) : (
              selectedServiceValue && (
                <CardWithOuterTitle
                  title={getString('cv.healthSource.connectors.customMetrics')}
                  dataTooltipId={'customMetricsTitle'}
                >
                  <Button
                    icon="plus"
                    minimal
                    margin={{ left: 'medium' }}
                    intent="primary"
                    tooltip={getString('cv.healthSource.connectors.customMetricsTooltip')}
                    tooltipProps={{ interactionKind: PopoverInteractionKind.HOVER_TARGET_ONLY }}
                    onClick={() => setShowCustomMetric(true)}
                  >
                    {getString('cv.monitoringSources.addMetric')}
                  </Button>
                </CardWithOuterTitle>
              )
            )}
            {isMetricThresholdEnabled &&
              getIsMetricThresholdCanBeShown(formik.values.metricData, groupedCreatedMetrics) && (
                <MetricThresholdProvider
                  groupedCreatedMetrics={groupedCreatedMetrics}
                  formikValues={formik.values}
                  metricPacks={(metricPackResponse.data?.resource || []) as TimeSeriesMetricPackDTO[]}
                  setThresholdState={setDynatraceMetricData}
                />
              )}
            <Container style={{ marginBottom: '120px' }} />
            <DrawerFooter
              isSubmit
              onPrevious={onPrevious}
              onNext={() => {
                formik.submitForm()
                if (formik.isValid) {
                  onSubmitDynatraceData(formik, mappedMetrics, selectedMetric, onSubmit)
                }
              }}
            />
          </FormikForm>
        )
      }}
    </Formik>
  )
}
