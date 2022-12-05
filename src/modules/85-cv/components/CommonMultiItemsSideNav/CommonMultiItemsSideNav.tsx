/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */
import React, { useEffect, useMemo, useState } from 'react'
import { Button, Container } from '@harness/uicore'
import { PopoverInteractionKind } from '@blueprintjs/core'
import { CommonSelectedAppsSideNav } from './components/CommonSelectedAppsSideNav/CommonSelectedAppsSideNav'
import {
  getCreatedMetricLength,
  getFilteredGroupedCreatedMetric,
  getSelectedMetricIndex,
  getUpdatedMetric
} from './CommonMultiItemsSideNav.utils'
import type { GroupedCreatedMetrics } from './components/CommonSelectedAppsSideNav/components/GroupedSideNav/GroupedSideNav.types'
import css from './CommonMultiItemsSideNav.module.scss'

export interface CommonMultiItemsSideNavProps {
  onSelectMetric: (selectedMetric: string, updatedList: string[], selectedMetricIndex: number) => void
  onRemoveMetric: (
    removedMetric: string,
    newSelectedMetric: string,
    updatedList: string[],
    selectedMetricIndex: number
  ) => void
  isValidInput: boolean
  renamedMetric?: string
  createdMetrics?: string[]
  defaultSelectedMetric?: string
  defaultMetricName: string
  tooptipMessage: string
  addFieldLabel: string
  groupedCreatedMetrics?: GroupedCreatedMetrics
  shouldBeAbleToDeleteLastMetric?: boolean
  isMetricThresholdEnabled?: boolean
  openEditMetricModal: () => void
}

export function CommonMultiItemsSideNav(props: CommonMultiItemsSideNavProps): JSX.Element {
  const {
    onSelectMetric,
    createdMetrics: propsCreatedMetrics,
    renamedMetric,
    onRemoveMetric,
    isValidInput,
    defaultSelectedMetric,
    defaultMetricName,
    tooptipMessage,
    addFieldLabel,
    groupedCreatedMetrics,
    shouldBeAbleToDeleteLastMetric,
    isMetricThresholdEnabled,
    openEditMetricModal
  } = props
  const [filter, setFilter] = useState<string | undefined>()
  const [createdMetrics, setCreatedMetrics] = useState<string[]>(
    propsCreatedMetrics?.length ? propsCreatedMetrics : [defaultMetricName]
  )
  const [selectedMetric, setSelectedMetric] = useState<string | undefined>(defaultSelectedMetric || createdMetrics[0])

  useEffect(() => {
    const selectedMetricIndex = getSelectedMetricIndex(createdMetrics, selectedMetric, renamedMetric)
    if (selectedMetricIndex > -1) {
      setCreatedMetrics(oldMetrics => {
        if (selectedMetricIndex !== -1) oldMetrics[selectedMetricIndex] = renamedMetric as string
        return Array.from(oldMetrics)
      })
      setSelectedMetric(renamedMetric)
    }
  }, [renamedMetric])

  const metricsToRender = useMemo(() => {
    return filter
      ? createdMetrics.filter(metric => metric.toLocaleLowerCase().includes(filter?.toLocaleLowerCase()))
      : createdMetrics
  }, [filter, createdMetrics])

  const filteredGroupMetric = useMemo(() => {
    return getFilteredGroupedCreatedMetric(groupedCreatedMetrics, filter)
  }, [filter, groupedCreatedMetrics])

  const createdMetricsLength = useMemo(
    () => getCreatedMetricLength(createdMetrics, groupedCreatedMetrics),
    [groupedCreatedMetrics, createdMetrics]
  )

  const hasOnRemove = shouldBeAbleToDeleteLastMetric || createdMetricsLength > 1

  return (
    <Container className={css.main}>
      <Button
        icon="plus"
        minimal
        intent="primary"
        disabled={!isValidInput}
        tooltip={!isValidInput ? tooptipMessage : undefined}
        tooltipProps={{ interactionKind: PopoverInteractionKind.HOVER_TARGET_ONLY }}
        onClick={() => {
          // TODO - This will be implemented once the entire form is implemented
          // if (isValidInput) {
          setCreatedMetrics(oldMetrics => {
            const newMetricName = ''
            onSelectMetric(newMetricName, [newMetricName, ...oldMetrics], 0)
            setSelectedMetric(newMetricName)
            return [newMetricName, ...oldMetrics]
          })
          // }
          openEditMetricModal()
        }}
      >
        {addFieldLabel}
      </Button>
      <CommonSelectedAppsSideNav
        isValidInput={isValidInput}
        onSelect={(newlySelectedMetric, index) => {
          onSelectMetric(newlySelectedMetric, createdMetrics, index)
          setSelectedMetric(newlySelectedMetric)
        }}
        selectedItem={selectedMetric}
        selectedMetrics={metricsToRender}
        groupedSelectedApps={filteredGroupMetric}
        isMetricThresholdEnabled={isMetricThresholdEnabled}
        openEditMetricModal={openEditMetricModal}
        onRemoveItem={
          hasOnRemove
            ? (removedItem, index) => {
                setCreatedMetrics(oldMetrics => {
                  const { updatedMetric, filteredOldMetrics, updateIndex } = getUpdatedMetric(
                    oldMetrics,
                    removedItem,
                    index
                  )
                  setSelectedMetric(updatedMetric)
                  onRemoveMetric(removedItem, updatedMetric, [...filteredOldMetrics], updateIndex)
                  return [...filteredOldMetrics]
                })
              }
            : undefined
        }
        filterProps={{
          onFilter: setFilter,
          className: css.metricsFilter
        }}
      />
    </Container>
  )
}
