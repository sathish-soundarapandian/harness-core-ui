/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { useModalHook } from '@harness/use-modal'
import {
  Button,
  ButtonVariation,
  Container,
  Dialog,
  getMultiTypeFromValue,
  MultiTypeInputType,
  SelectOption
} from '@harness/uicore'
import { Formik, useFormikContext } from 'formik'
import { defaultTo } from 'lodash-es'
import { SetupSourceTabsContext } from '@cv/components/CVSetupSourcesView/SetupSourceTabs/SetupSourceTabs'
import { initializeGroupNames } from '@cv/components/GroupName/GroupName.utils'
import type { CustomHealthMetricDefinition } from 'services/cv'
import { useStrings } from 'framework/strings'
import CardWithOuterTitle from '@common/components/CardWithOuterTitle/CardWithOuterTitle'
import CommonCustomMetric from '@cv/pages/health-source/common/CommonCustomMetric/CommonCustomMetric'
import type { CommonCustomMetricFormikInterface } from '../../CommonHealthSource.types'
import type { AddMetricForm, CustomMetricFormContainerProps } from './CustomMetricForm.types'
import {
  getAddMetricInitialValues,
  initHealthSourceCustomFormValue,
  validateAddMetricForm
} from './CustomMetricFormContainer.utils'
import { resetShowCustomMetric } from '../../CommonHealthSource.utils'
import AddMetric from './components/AddMetric/AddMetric'
import CustomMetricForm from './CustomMetricForm'
import css from './CustomMetricForm.module.scss'

export default function CustomMetricFormContainer(props: CustomMetricFormContainerProps): JSX.Element {
  const { getString } = useStrings()
  const {
    mappedMetrics,
    selectedMetric,
    setMappedMetrics,
    isMetricThresholdEnabled,
    createdMetrics,
    setCreatedMetrics,
    setGroupedCreatedMetrics,
    healthSourceConfig,
    healthSourceData,
    groupedCreatedMetrics,
    isTemplate,
    expressions,
    connectorIdentifier: connectorRef,
    setConfigurationsFormikFieldValue
  } = props

  const { values: formValues, setValues, isValid } = useFormikContext<CommonCustomMetricFormikInterface>()
  const wrapperRef = useRef(null)
  useUpdateConfigFormikOnOutsideClick(wrapperRef, mappedMetrics, selectedMetric, formValues)

  const enabledDefaultGroupName = !!healthSourceConfig?.addQuery?.enableDefaultGroupName
  const customMetricsConfig = healthSourceConfig?.customMetrics
  const enabledRecordsAndQuery = !!healthSourceConfig?.customMetrics?.queryAndRecords?.enabled
  const {
    sourceData: { existingMetricDetails }
  } = useContext(SetupSourceTabsContext)
  const [groupNames, setGroupName] = useState<SelectOption[]>(initializeGroupNames(mappedMetrics, getString))
  const [showCustomMetric, setShowCustomMetric] = useState(
    !!Array.from(defaultTo(healthSourceData?.customMetricsMap, []))?.length &&
      healthSourceConfig?.customMetrics?.enabled
  )

  const metricDefinitions = existingMetricDetails?.spec?.metricDefinitions
  const currentSelectedMetricDetail = metricDefinitions?.find(
    (metricDefinition: CustomHealthMetricDefinition) =>
      metricDefinition.metricName === mappedMetrics.get(selectedMetric || '')?.metricName
  )
  const isConnectorRuntimeOrExpression = getMultiTypeFromValue(connectorRef) !== MultiTypeInputType.FIXED

  const filterRemovedMetricNameThresholds = useCallback(
    (deletedMetricName: string) => {
      if (isMetricThresholdEnabled && deletedMetricName) {
        // TODO implement this later
      }
    },
    [isMetricThresholdEnabled]
  )

  function useUpdateConfigFormikOnOutsideClick(
    ref: React.MutableRefObject<any>,
    mappedMetricsData: Map<string, CommonCustomMetricFormikInterface>,
    selectedMetricData: string,
    formValuesData: CommonCustomMetricFormikInterface
  ): void {
    useEffect(() => {
      /**
       * update Parent formik when clicked outside.
       */
      function handleClickOutside(event: { target: unknown }): void {
        if (ref.current && !ref.current.contains(event.target)) {
          // TODO - apply this logic only if mappedMetricsData has been changed
          mappedMetricsData.set(selectedMetricData, formValuesData)
          setConfigurationsFormikFieldValue('customMetricsMap', mappedMetricsData)
        }
      }
      // Bind the event listener
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        // Unbind the event listener on clean up
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }, [mappedMetricsData, ref, selectedMetricData, formValuesData])
  }

  useEffect(() => {
    resetShowCustomMetric(selectedMetric, mappedMetrics, setShowCustomMetric)
  }, [mappedMetrics, selectedMetric])

  const [openModal, hideModal] = useModalHook(
    () => (
      <Dialog
        isOpen
        usePortal
        autoFocus
        canEscapeKeyClose
        canOutsideClickClose
        enforceFocus={false}
        onClose={hideModal}
      >
        <Formik<AddMetricForm>
          initialValues={getAddMetricInitialValues(formValues, enabledDefaultGroupName)}
          onSubmit={values => {
            const updatedValues = { ...formValues, ...values }
            setValues(updatedValues)
            hideModal()
            setShowCustomMetric(true)
          }}
          onReset={hideModal}
          validate={data => {
            return validateAddMetricForm(data, getString)
          }}
          validateOnChange
          validateOnBlur
        >
          {() => {
            return (
              <AddMetric
                enableDefaultGroupName={enabledDefaultGroupName}
                currentSelectedMetricDetail={currentSelectedMetricDetail}
                groupNames={groupNames}
                setGroupName={setGroupName}
              />
            )
          }}
        </Formik>
      </Dialog>
    ),
    [formValues, groupNames, currentSelectedMetricDetail]
  )

  return (
    <>
      {showCustomMetric ? (
        <CardWithOuterTitle
          title={getString('cv.healthSource.connectors.customMetricsWithoutOptional')}
          dataTooltipId={'customMetricsTitle'}
          cardSectionClassName={css.customMetricContainer}
        >
          <CommonCustomMetric
            isValidInput={isValid}
            setMappedMetrics={setMappedMetrics}
            selectedMetric={selectedMetric}
            formikValues={formValues}
            mappedMetrics={mappedMetrics}
            createdMetrics={createdMetrics}
            groupedCreatedMetrics={groupedCreatedMetrics}
            setCreatedMetrics={setCreatedMetrics}
            setGroupedCreatedMetrics={setGroupedCreatedMetrics}
            defaultMetricName={'healthSourceMetric'}
            tooptipMessage={getString('cv.monitoringSources.gcoLogs.addQueryTooltip')}
            addFieldLabel={getString('cv.monitoringSources.addMetric')}
            initCustomForm={initHealthSourceCustomFormValue()}
            shouldBeAbleToDeleteLastMetric={healthSourceConfig?.sideNav?.shouldBeAbleToDeleteLastMetric}
            isMetricThresholdEnabled={isMetricThresholdEnabled}
            filterRemovedMetricNameThresholds={filterRemovedMetricNameThresholds}
            openEditMetricModal={openModal}
          >
            <Container ref={wrapperRef}>
              <CustomMetricForm
                connectorIdentifier={connectorRef}
                isTemplate={isTemplate}
                expressions={expressions}
                isConnectorRuntimeOrExpression={isConnectorRuntimeOrExpression}
                enabledRecordsAndQuery={enabledRecordsAndQuery}
                customMetricsConfig={customMetricsConfig}
              />
            </Container>
          </CommonCustomMetric>
        </CardWithOuterTitle>
      ) : (
        <Button
          icon="plus"
          variation={ButtonVariation.SECONDARY}
          onClick={openModal}
          margin={{ left: 'medium', bottom: 'small', top: 'medium' }}
        >
          {getString('cv.monitoringSources.addMetric')}
        </Button>
      )}
    </>
  )
}
