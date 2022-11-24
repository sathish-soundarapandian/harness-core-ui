/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useContext, useEffect, useState } from 'react'
import { useModalHook } from '@harness/use-modal'
import { Button, Dialog, SelectOption } from '@harness/uicore'
import { Formik, useFormikContext } from 'formik'
import { defaultTo } from 'lodash-es'
import { SetupSourceTabsContext } from '@cv/components/CVSetupSourcesView/SetupSourceTabs/SetupSourceTabs'
import { initializeGroupNames } from '@cv/components/GroupName/GroupName.utils'
import type { CustomHealthMetricDefinition } from 'services/cv'
import { useStrings } from 'framework/strings'
import CardWithOuterTitle from '@common/components/CardWithOuterTitle/CardWithOuterTitle'
import CommonCustomMetric from '@cv/pages/health-source/common/CommonCustomMetric/CommonCustomMetric'
import CustomMetricForm from './CustomMetricForm'
import type { NonCustomFeildsInterface } from '../../../AppDynamics/AppDHealthSource.types'
import { getMetricNameFilteredNonCustomFields } from '../../../MonitoredServiceConnector.utils'
import type { CommonHealthSourceFormikInterface } from '../../CommonHealthSource.types'
import type { AddMetricForm, CustomMetricFormContainerProps } from './CustomMetricForm.types'
import { resetShowCustomMetric } from '../../CommonHealthSource.utils'
import {
  getAddMetricInitialValues,
  initHealthSourceCustomFormValue,
  validateAddMetricForm
} from './CustomMetricFormContainer.utils'
import AddMetric from './components/AddMetric'

export default function CustomMetricFormContainer(props: CustomMetricFormContainerProps): JSX.Element {
  const { getString } = useStrings()
  const {
    mappedMetrics,
    selectedMetric,
    setMappedMetrics,
    isMetricThresholdEnabled,
    nonCustomFeilds,
    setNonCustomFeilds,
    createdMetrics,
    setCreatedMetrics,
    setGroupedCreatedMetrics,
    healthSourceConfig,
    healthSourceData,
    groupedCreatedMetrics
  } = props

  const { values: formValues, setValues, isValid } = useFormikContext<CommonHealthSourceFormikInterface>()
  const enabledDefaultGroupName = !!healthSourceConfig?.addQuery?.enableDefaultGroupName
  const {
    sourceData: { existingMetricDetails }
  } = useContext(SetupSourceTabsContext)
  const [groupNames, setGroupName] = useState<SelectOption[]>(initializeGroupNames(mappedMetrics, getString))
  const [showCustomMetric, setShowCustomMetric] = useState(
    !!Array.from(defaultTo(healthSourceData?.mappedServicesAndEnvs, []))?.length &&
      healthSourceConfig?.customMetrics?.enabled
  )

  const metricDefinitions = existingMetricDetails?.spec?.metricDefinitions
  const currentSelectedMetricDetail = metricDefinitions?.find(
    (metricDefinition: CustomHealthMetricDefinition) =>
      metricDefinition.metricName === mappedMetrics.get(selectedMetric || '')?.metricName
  )

  const filterRemovedMetricNameThresholds = useCallback(
    (deletedMetricName: string) => {
      if (isMetricThresholdEnabled && deletedMetricName) {
        const updatedNonCustomFields = getMetricNameFilteredNonCustomFields<NonCustomFeildsInterface>(
          isMetricThresholdEnabled,
          nonCustomFeilds,
          deletedMetricName
        )

        setNonCustomFeilds(updatedNonCustomFields)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isMetricThresholdEnabled, nonCustomFeilds]
  )

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
    <CardWithOuterTitle
      title={getString('cv.healthSource.connectors.customMetricsWithoutOptional')}
      dataTooltipId={'customMetricsTitle'}
    >
      {showCustomMetric ? (
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
          defaultMetricName={'appdMetric'}
          tooptipMessage={getString('cv.monitoringSources.gcoLogs.addQueryTooltip')}
          addFieldLabel={getString('cv.monitoringSources.addMetric')}
          initCustomForm={initHealthSourceCustomFormValue()}
          shouldBeAbleToDeleteLastMetric={healthSourceConfig?.sideNav?.shouldBeAbleToDeleteLastMetric}
          isMetricThresholdEnabled={isMetricThresholdEnabled}
          filterRemovedMetricNameThresholds={filterRemovedMetricNameThresholds}
          openEditMetricModal={openModal}
        >
          <CustomMetricForm />
        </CommonCustomMetric>
      ) : (
        <Button icon="plus" minimal intent="primary" onClick={openModal}>
          {getString('cv.monitoringSources.addMetric')}
        </Button>
      )}
    </CardWithOuterTitle>
  )
}
