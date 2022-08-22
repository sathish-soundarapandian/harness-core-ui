/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo, useState, useEffect } from 'react'
import { Button, Formik, FormikForm, getMultiTypeFromValue, MultiTypeInputType } from '@wings-software/uicore'
import { PopoverInteractionKind } from '@blueprintjs/core'
import { noop } from 'lodash-es'
import type {
  DynatraceFormDataInterface,
  DynatraceHealthSourceProps
} from '@cv/pages/health-source/connectors/Dynatrace/DynatraceHealthSource.types'
import CardWithOuterTitle from '@cv/pages/health-source/common/CardWithOuterTitle/CardWithOuterTitle'
import DrawerFooter from '@cv/pages/health-source/common/DrawerFooter/DrawerFooter'
import useGroupedSideNaveHook from '@cv/hooks/GroupedSideNaveHook/useGroupedSideNaveHook'
import { useStrings } from 'framework/strings'
import {
  defaultDynatraceCustomMetric,
  mapDynatraceDataToDynatraceForm,
  onSubmitDynatraceData,
  validateMapping,
  setApplicationIfConnectorIsInput
} from '@cv/pages/health-source/connectors/Dynatrace/DynatraceHealthSource.utils'
import DynatraceCustomMetrics from '@cv/pages/health-source/connectors/Dynatrace/components/DynatraceCustomMetrics/DynatraceCustomMetrics'
import DynatraceMetricPacksToService from './components/DynatraceMetricPacksToService/DynatraceMetricPacksToService'

import CustomMetric from '../../common/CustomMetric/CustomMetric'
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
    mappedServicesAndEnvs: dynatraceMetricData.customMetrics
  })

  const dynatraceMetricFormData = useMemo(
    () => mapDynatraceDataToDynatraceForm(dynatraceMetricData, mappedMetrics, selectedMetric, showCustomMetric),
    [dynatraceMetricData, mappedMetrics, selectedMetric, showCustomMetric]
  )

  useEffect(() => {
    if (!dynatraceMetricFormData.isEdit) {
      setApplicationIfConnectorIsInput(isConnectorRuntimeOrExpression, dynatraceMetricFormData, setDynatraceMetricData)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
            mappedMetrics
          )
        ).length === 0
      }
      validate={values => {
        return validateMapping(
          values,
          groupedCreatedMetricsList,
          groupedCreatedMetricsList.indexOf(selectedMetric),
          getString,
          mappedMetrics
        )
      }}
      initialValues={dynatraceMetricFormData}
    >
      {formik => {
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
              isTemplate={isTemplate}
              expressions={expressions}
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
            <DrawerFooter
              isSubmit
              onPrevious={onPrevious}
              onNext={() =>
                onSubmitDynatraceData(
                  formik,
                  mappedMetrics,
                  selectedMetric,
                  groupedCreatedMetricsList.indexOf(selectedMetric),
                  createdMetrics,
                  getString,
                  onSubmit
                )
              }
            />
          </FormikForm>
        )
      }}
    </Formik>
  )
}
