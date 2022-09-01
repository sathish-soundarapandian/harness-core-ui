/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useCallback } from 'react'
import { SetupSourceLayout } from '@cv/components/CVSetupSourcesView/SetupSourceLayout/SetupSourceLayout'
import { MultiItemsSideNav } from '@cv/components/MultiItemsSideNav/MultiItemsSideNav'
import { useStrings } from 'framework/strings'
import {
  onRemoveMetric,
  onSelectMetric,
  getGroupedCreatedMetrics,
  updateSelectedMetricsMap
} from './CustomMetric.utils'
import type { CustomMetricInterface } from './CustomMetric.types'

export default function CustomMetric(props: CustomMetricInterface): JSX.Element {
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
    setMappedMetrics,
    setCreatedMetrics,
    setGroupedCreatedMetrics,
    initCustomForm,
    isPrimaryMetric,
    shouldBeAbleToDeleteLastMetric
  } = props
  const { getString } = useStrings()

  useEffect(() => {
    setMappedMetrics(oldState => {
      const emptyName = formikValues.metricName?.length
      if (!emptyName) {
        return { selectedMetric: oldState.selectedMetric, mappedMetrics: mappedMetrics }
      }
      const metricName = formikValues.metricName || ''
      const duplicateName =
        Array.from(mappedMetrics.keys()).indexOf(metricName) > -1 &&
        oldState.selectedMetric !== formikValues?.metricName
      if (duplicateName) {
        return { selectedMetric: oldState.selectedMetric, mappedMetrics: mappedMetrics }
      }

      return updateSelectedMetricsMap({
        updatedMetric: metricName,
        oldMetric: oldState.selectedMetric,
        mappedMetrics: oldState.mappedMetrics,
        formikValues,
        initCustomForm,
        isPrimaryMetric
      })
    })
  }, [formikValues?.groupName, formikValues?.metricName, formikValues?.continuousVerification])

  useEffect(() => {
    const updatedGroupedCreatedMetrics = getGroupedCreatedMetrics(mappedMetrics, getString)
    setGroupedCreatedMetrics(updatedGroupedCreatedMetrics)
  }, [formikValues?.groupName, mappedMetrics, selectedMetric, formikValues?.continuousVerification])

  const removeMetric = useCallback(
    (removedMetric, updatedMetric, updatedList, smIndex) =>
      onRemoveMetric({
        removedMetric,
        updatedMetric,
        updatedList,
        smIndex,
        formikValues,
        setCreatedMetrics,
        setMappedMetrics
      }),
    [formikValues]
  )

  const selectMetric = useCallback(
    (newMetric, updatedList, smIndex) =>
      onSelectMetric({
        newMetric,
        updatedList,
        smIndex,
        setCreatedMetrics,
        setMappedMetrics,
        formikValues,
        initCustomForm,
        isPrimaryMetric
      }),
    [formikValues]
  )

  return (
    <SetupSourceLayout
      leftPanelContent={
        <MultiItemsSideNav
          defaultMetricName={defaultMetricName}
          tooptipMessage={tooptipMessage}
          addFieldLabel={addFieldLabel}
          createdMetrics={createdMetrics}
          defaultSelectedMetric={selectedMetric}
          renamedMetric={formikValues?.metricName}
          isValidInput={isValidInput}
          groupedCreatedMetrics={groupedCreatedMetrics}
          onRemoveMetric={(removedMetric, updatedMetric, updatedList, smIndex) =>
            removeMetric(removedMetric, updatedMetric, updatedList, smIndex)
          }
          onSelectMetric={(newMetric, updatedList, smIndex) => selectMetric(newMetric, updatedList, smIndex)}
          shouldBeAbleToDeleteLastMetric={shouldBeAbleToDeleteLastMetric}
        />
      }
      content={children}
    />
  )
}
