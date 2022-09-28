/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */
import React, { useEffect, useMemo, useState } from 'react'
import { Button, Container, Utils } from '@wings-software/uicore'
import { PopoverInteractionKind } from '@blueprintjs/core'
import { SelectedAppsSideNav } from './components/SelectedAppsSideNav/SelectedAppsSideNav'
import {
  getCreatedMetricLength,
  getFilteredGroupedCreatedMetric,
  getSelectedMetricIndex
} from './MultiItemsSideNav.utils'
import type { GroupedCreatedMetrics } from './components/SelectedAppsSideNav/components/GroupedSideNav/GroupedSideNav.types'
import css from './MultiItemsSideNav.module.scss'

export interface MultiItemsSideNavProps {
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
}

export function MultiItemsSideNav(props: MultiItemsSideNavProps): JSX.Element {
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
    isMetricThresholdEnabled
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

  const hasOnRemove = shouldBeAbleToDeleteLastMetric ? shouldBeAbleToDeleteLastMetric : createdMetricsLength > 1

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
          if (isValidInput) {
            setCreatedMetrics(oldMetrics => {
              const newMetricName = `${defaultMetricName} ${Utils.randomId()}`
              onSelectMetric(newMetricName, [newMetricName, ...oldMetrics], 0)
              setSelectedMetric(newMetricName)
              return [newMetricName, ...oldMetrics]
            })
          }
        }}
      >
        {addFieldLabel}
      </Button>
      <SelectedAppsSideNav
        onSelect={(newlySelectedMetric, index) => {
          onSelectMetric(newlySelectedMetric, createdMetrics, index)
          setSelectedMetric(newlySelectedMetric)
        }}
        selectedItem={selectedMetric}
        selectedApps={metricsToRender}
        groupedSelectedApps={filteredGroupMetric}
        isMetricThresholdEnabled={isMetricThresholdEnabled}
        onRemoveItem={
          hasOnRemove
            ? (removedItem, index) => {
                setCreatedMetrics(oldMetrics => {
                  const filteredOldMetrics = oldMetrics.filter(item => item !== removedItem)
                  const updateIndex = index === 0 ? 0 : index - 1
                  const updatedMetric = filteredOldMetrics[updateIndex]
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
