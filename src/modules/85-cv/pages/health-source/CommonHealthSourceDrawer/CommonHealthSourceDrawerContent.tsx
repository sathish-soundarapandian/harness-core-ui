/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo, useState } from 'react'
import { Formik, FormikForm } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import { SetupSourceTabs } from '@cv/components/CVSetupSourcesView/SetupSourceTabs/SetupSourceTabs'
import { DatadogProduct } from '../connectors/DatadogMetricsHealthSource/DatadogMetricsHealthSource.utils'
import { SelectDatadogMetricsDashboards } from '../connectors/DatadogMetricsHealthSource/components/SelectDatadogMetricsDashboards/SelectDatadogMetricsDashboards'
import CustomiseHealthSource from './component/customiseHealthSource/CustomiseHealthSource'
import { GCOProduct } from '../connectors/GCOLogsMonitoringSource/GoogleCloudOperationsMonitoringSourceUtils'
import { SelectGCODashboards } from '../connectors/GCOMetricsHealthSource/components/SelectGCODashboards/SelectGCODashboards'
import {
  formValidation,
  getInitialValues,
  getSelectedFeature,
  validate
} from './component/CommonDefineHealthSource/CommonDefineHealthSource.utils'
import { HealthSourceMaxTab } from './CommonHealthSourceDrawer.constant'
import { createHealthSourceDrawerFormData } from './CommonHealthSourceDrawer.utils'
import CommonDefineHealthSource from './component/CommonDefineHealthSource/CommonDefineHealthSource'
import type { CommonHealthSourceInterface, HealthSourceDrawerInterface } from './CommonHealthSourceDrawer.types'
import CreateHealthSourceForm from './component/CreateHealthSourceForm/CreateHealthSourceForm'

function CommonHealthSourceDrawerContent({
  serviceRef,
  environmentRef,
  monitoredServiceRef,
  onSuccess,
  isEdit,
  rowData,
  tableData,
  shouldRenderAtVerifyStep,
  changeSources,
  metricDetails,
  isTemplate,
  expressions
}: HealthSourceDrawerInterface): JSX.Element {
  const { getString } = useStrings()
  const isDataSourceTypeSelectorEnabled = true
  // const isDataSourceTypeSelectorEnabled = useFeatureFlag(FeatureFlag.SRM_ENABLE_HEALTHSOURCE_AWS_PROMETHEUS)

  const sourceData = useMemo(
    () =>
      createHealthSourceDrawerFormData({
        isEdit,
        monitoredServiceRef,
        serviceRef,
        environmentRef,
        tableData,
        rowData,
        changeSources,
        existingMetricDetails: metricDetails
      }),
    [rowData, tableData, monitoredServiceRef, serviceRef, environmentRef, isEdit, changeSources]
  )
  const [selectedProduct, setSelectedProduct] = useState<string | undefined>(getSelectedFeature(sourceData)?.value)

  const [tabTitles, ...tabs] = useMemo(() => {
    if (selectedProduct === GCOProduct.CLOUD_METRICS || selectedProduct === DatadogProduct.CLOUD_METRICS) {
      const dashboardsScreen =
        selectedProduct === DatadogProduct.CLOUD_METRICS ? (
          <SelectDatadogMetricsDashboards
            key="selectDatadogDashboards"
            isTemplate={isTemplate}
            expressions={expressions}
          />
        ) : (
          <SelectGCODashboards key="selectGCODashboards" isTemplate={isTemplate} expressions={expressions} />
        )
      return [
        [
          getString('cv.healthSource.defineHealthSource'),
          getString('cv.healthSource.connectors.gco.selectDashboardTab'),
          getString('cv.healthSource.customizeHealthSource')
        ],
        <CommonDefineHealthSource
          key="commonDefineHealthSource"
          isTemplate={isTemplate}
          expressions={expressions}
          // onSubmit={values => {
          //   setSelectedProduct(values?.product?.value)
          // }}
        />,
        dashboardsScreen,
        <CustomiseHealthSource
          key="customiseHealthSource"
          onSuccess={onSuccess}
          isTemplate={isTemplate}
          expressions={expressions}
          shouldRenderAtVerifyStep={shouldRenderAtVerifyStep}
        />
      ]
    }
    return [
      [getString('cv.healthSource.defineHealthSource'), getString('cv.healthSource.customizeHealthSource')],
      <CommonDefineHealthSource
        key="commonDefineHealthSource"
        isTemplate={isTemplate}
        expressions={expressions}
        // onSubmit={values => {
        //   setSelectedProduct(values.product?.value)
        // }}
      />,
      <CustomiseHealthSource
        key="customiseHealthSource"
        onSuccess={onSuccess}
        isTemplate={isTemplate}
        expressions={expressions}
        shouldRenderAtVerifyStep={shouldRenderAtVerifyStep}
      />
    ]
  }, [selectedProduct])

  const initialValues = useMemo(() => {
    return getInitialValues(sourceData, getString, isDataSourceTypeSelectorEnabled)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceData?.healthSourceIdentifier])

  return (
    <>
      <Formik<CommonHealthSourceInterface>
        enableReinitialize
        initialValues={initialValues}
        formName={'HealthSource'}
        validate={values => {
          // TODO entire form validation will come here.
          /**
           * as per the current tab validate the fields of certain Tab.
           * // return formValidation({
          //   values,
          //   isDataSourceTypeSelectorEnabled,
          //   isEdit,
          //   getString
          // })
           */
        }}
        validationSchema={validate(getString)}
        onSubmit={values => {
          // onSubmit?.(values)
          // const formValues = { ...values }
          // // TODO - check this logic later
          // // if (sourceData.selectedDashboards && values?.connectorRef !== sourceData?.connectorRef) {
          // //   formValues = { ...values, selectedDashboards: new Map() }
          // // }
          //
          /**
           * If current tab is Define HealthSource screen -> onNext(formValues, { tabStatus: 'SUCCESS' })
           * If other tab is Configurations screen -> submit healthsource call.
           */
        }}
      >
        {formik => (
          // return (
          //   <FormikForm>
          //     <SetupSourceTabs
          //       data={sourceData}
          //       determineMaxTab={isEdit ? () => HealthSourceMaxTab : undefined}
          //       tabTitles={tabTitles}
          //       disableCache={true}
          //     >
          //       {tabs}
          //     </SetupSourceTabs>
          //   </FormikForm>
          // )
          <CreateHealthSourceForm data={sourceData} />
        )}
      </Formik>
    </>
  )
}

export default CommonHealthSourceDrawerContent
