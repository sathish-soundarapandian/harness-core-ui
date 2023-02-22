/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useCallback, useContext } from 'react'
import { getMultiTypeFromValue, MultiTypeInputType, RUNTIME_INPUT_VALUE } from '@harness/uicore'
import { SetupSourceLayout } from '@cv/components/CVSetupSourcesView/SetupSourceLayout/SetupSourceLayout'
import { SetupSourceTabsContext } from '@cv/components/CVSetupSourcesView/SetupSourceTabs/SetupSourceTabs'
import { CommonMultiItemsSideNav } from '@cv/components/CommonMultiItemsSideNav/CommonMultiItemsSideNav'
import { updateSelectedMetricsMap } from './CommonCustomMetric.utils'
import type { CommonCustomMetricInterface } from './CommonCustomMetric.types'
import { updateParentFormikWithLatestData } from '../../connectors/CommonHealthSource/components/CustomMetricForm/CustomMetricFormContainer.utils'
import { useCommonHealthSource } from '../../connectors/CommonHealthSource/components/CustomMetricForm/components/CommonHealthSourceContext/useCommonHealthSource'

export default function CommonCustomMetric(props: CommonCustomMetricInterface): JSX.Element {
  const {
    children,
    formikValues,
    defaultMetricName,
    tooptipMessage,
    addFieldLabel,
    createdMetrics,
    mappedMetrics,
    selectedMetric,
    groupedCreatedMetrics,
    initCustomForm,
    isPrimaryMetric,
    shouldBeAbleToDeleteLastMetric,
    filterRemovedMetricNameThresholds,
    openEditMetricModal,
    defaultServiceInstance
  } = props

  const { isQueryRuntimeOrExpression, updateParentFormik } = useCommonHealthSource()
  const { isTemplate } = useContext(SetupSourceTabsContext)

  useEffect(() => {
    let data = { selectedMetric, mappedMetrics }
    const emptyName = formikValues?.metricName?.length
    // add default metric data when we delete last metric and add again
    if (!emptyName && !selectedMetric && mappedMetrics?.size === 0) {
      const initMap = new Map()
      initMap.set(defaultMetricName, initCustomForm)
      data = { selectedMetric: defaultMetricName, mappedMetrics: initMap }
    }
    if (!emptyName) {
      data = { selectedMetric: selectedMetric, mappedMetrics: mappedMetrics }
    }
    const metricName = formikValues.metricName || ''
    const duplicateName =
      Array.from(mappedMetrics?.keys()).indexOf(metricName) > -1 && selectedMetric !== formikValues?.metricName
    if (duplicateName) {
      data = { selectedMetric: selectedMetric, mappedMetrics: mappedMetrics }
    }

    if (formikValues?.continuousVerification && !formikValues.serviceInstanceField) {
      formikValues.serviceInstanceField = defaultServiceInstance
    }

    data = updateSelectedMetricsMap({
      updatedMetric: formikValues.metricName,
      oldMetric: selectedMetric,
      mappedMetrics,
      formikValues,
      initCustomForm,
      isPrimaryMetric
    })

    updateParentFormikWithLatestData(updateParentFormik, data?.mappedMetrics, data?.selectedMetric)
  }, [formikValues?.groupName, formikValues?.metricName, formikValues?.continuousVerification])

  useEffect(() => {
    let isUpdated = false
    const isServiceInstanceFixed = getMultiTypeFromValue(formikValues.serviceInstanceField) === MultiTypeInputType.FIXED

    if (isQueryRuntimeOrExpression) {
      const canMakeRuntime = !formikValues.serviceInstanceField || isServiceInstanceFixed
      if (canMakeRuntime) {
        formikValues.serviceInstanceField = RUNTIME_INPUT_VALUE
        isUpdated = true
      }
    }

    if (isUpdated) {
      const data = updateSelectedMetricsMap({
        updatedMetric: formikValues.metricName,
        oldMetric: selectedMetric,
        mappedMetrics,
        formikValues,
        initCustomForm,
        isPrimaryMetric
      })

      updateParentFormikWithLatestData(updateParentFormik, data?.mappedMetrics, data?.selectedMetric)
    }
  }, [isTemplate, formikValues.query, isQueryRuntimeOrExpression])

  const removeMetric = useCallback(
    (removedMetric, updatedMetric) => {
      const commonUpdatedMap = new Map(mappedMetrics)

      if (commonUpdatedMap.has(removedMetric)) {
        commonUpdatedMap.delete(removedMetric)
      }

      updateParentFormikWithLatestData(updateParentFormik, commonUpdatedMap, updatedMetric)

      if (filterRemovedMetricNameThresholds && removedMetric) {
        filterRemovedMetricNameThresholds(removedMetric)
      }
    },
    [formikValues, mappedMetrics, selectedMetric, filterRemovedMetricNameThresholds]
  )

  const selectMetric = useCallback(
    newMetric => {
      const data = updateSelectedMetricsMap({
        updatedMetric: newMetric,
        oldMetric: selectedMetric,
        mappedMetrics,
        formikValues,
        initCustomForm,
        isPrimaryMetric
      })

      updateParentFormikWithLatestData(updateParentFormik, data?.mappedMetrics, data?.selectedMetric)
    },
    [formikValues]
  )

  return (
    <SetupSourceLayout
      leftPanelContent={
        <CommonMultiItemsSideNav
          defaultMetricName={defaultMetricName}
          tooptipMessage={tooptipMessage}
          addFieldLabel={addFieldLabel}
          createdMetrics={createdMetrics}
          defaultSelectedMetric={selectedMetric}
          renamedMetric={formikValues?.metricName}
          groupedCreatedMetrics={groupedCreatedMetrics}
          onRemoveMetric={(removedMetric, updatedMetric) => {
            removeMetric(removedMetric, updatedMetric)
          }}
          onSelectMetric={newMetric => selectMetric(newMetric)}
          shouldBeAbleToDeleteLastMetric={shouldBeAbleToDeleteLastMetric}
          openEditMetricModal={openEditMetricModal}
        />
      }
      content={children}
    />
  )
}
