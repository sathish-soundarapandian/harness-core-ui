/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useCallback } from 'react'
import { SetupSourceLayout } from '@cv/components/CVSetupSourcesView/SetupSourceLayout/SetupSourceLayout'
import { CommonMultiItemsSideNav } from '@cv/components/CommonMultiItemsSideNav/CommonMultiItemsSideNav'
import { updateSelectedMetricsMap } from './CommonCustomMetric.utils'
import { CommonHealthSourceContextFields } from '../../connectors/CommonHealthSource/CommonHealthSource.constants'
import type { CommonCustomMetricInterface } from './CommonCustomMetric.types'

import { useCommonHealthSource } from '../../connectors/CommonHealthSource/components/CustomMetricForm/components/CommonHealthSourceContext/useCommonHealthSource'

export default function CommonCustomMetric(props: CommonCustomMetricInterface): JSX.Element {
  const {
    children,
    formikValues,
    defaultMetricName,
    tooptipMessage,
    addFieldLabel,
    createdMetrics,
    isValidInput,
    mappedMetrics,
    selectedMetric,
    groupedCreatedMetrics,
    initCustomForm,
    isPrimaryMetric,
    shouldBeAbleToDeleteLastMetric,
    isMetricThresholdEnabled,
    filterRemovedMetricNameThresholds,
    openEditMetricModal
  } = props

  const { updateParentFormik } = useCommonHealthSource()

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

    data = updateSelectedMetricsMap({
      updatedMetric: metricName,
      oldMetric: selectedMetric,
      mappedMetrics,
      formikValues,
      initCustomForm,
      isPrimaryMetric
    })
    updateParentFormik(CommonHealthSourceContextFields.CustomMetricsMap, data.mappedMetrics)
    updateParentFormik(CommonHealthSourceContextFields.SelectedMetric, data.selectedMetric)
  }, [formikValues?.groupName, formikValues?.metricName, formikValues?.continuousVerification])

  const removeMetric = useCallback(
    (removedMetric, updatedMetric) => {
      const commonUpdatedMap = new Map(mappedMetrics)

      if (commonUpdatedMap.has(removedMetric)) {
        commonUpdatedMap.delete(removedMetric)
      } else {
        // handle case where user updates the metric name for current selected metric
        commonUpdatedMap.delete(selectedMetric)
      }

      // update map with current values
      if (formikValues?.metricName !== removedMetric && formikValues?.metricName === updatedMetric) {
        commonUpdatedMap.set(updatedMetric, { ...formikValues } || { metricName: updatedMetric })
      }

      updateParentFormik(CommonHealthSourceContextFields.CustomMetricsMap, commonUpdatedMap)
      updateParentFormik(CommonHealthSourceContextFields.SelectedMetric, updatedMetric)

      if (isMetricThresholdEnabled && filterRemovedMetricNameThresholds && removedMetric) {
        filterRemovedMetricNameThresholds(removedMetric)
      }
    },
    [formikValues, mappedMetrics]
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
      updateParentFormik(CommonHealthSourceContextFields.SelectedMetric, data.selectedMetric)
      updateParentFormik(CommonHealthSourceContextFields.CustomMetricsMap, data.mappedMetrics)
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
          isValidInput={isValidInput}
          groupedCreatedMetrics={groupedCreatedMetrics}
          onRemoveMetric={(removedMetric, updatedMetric) => {
            removeMetric(removedMetric, updatedMetric)
          }}
          onSelectMetric={newMetric => selectMetric(newMetric)}
          shouldBeAbleToDeleteLastMetric={shouldBeAbleToDeleteLastMetric}
          isMetricThresholdEnabled={isMetricThresholdEnabled}
          openEditMetricModal={openEditMetricModal}
        />
      }
      content={children}
    />
  )
}
