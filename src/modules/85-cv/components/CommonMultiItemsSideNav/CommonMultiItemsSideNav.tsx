/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */
import React, { useEffect, useMemo, useState } from 'react'
import { defaultTo } from 'lodash-es'
import { Button, ButtonVariation, Container } from '@harness/uicore'
import { PopoverInteractionKind } from '@blueprintjs/core'
import { useStrings } from 'framework/strings'

import { useCommonHealthSource } from '@cv/pages/health-source/connectors/CommonHealthSource/components/CustomMetricForm/components/CommonHealthSourceContext/useCommonHealthSource'
import { CommonHealthSourceContextFields } from '@cv/pages/health-source/connectors/CommonHealthSource/CommonHealthSource.constants'
import { CommonSelectedAppsSideNav } from './components/CommonSelectedAppsSideNav/CommonSelectedAppsSideNav'
import {
  getCreatedMetricLength,
  getFilteredGroupedCreatedMetric,
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
  const { getString } = useStrings()
  const [filter, setFilter] = useState<string | undefined>()
  const [createdMetrics, setCreatedMetrics] = useState<string[]>(
    propsCreatedMetrics?.length ? propsCreatedMetrics : [defaultMetricName]
  )
  const [selectedMetric, setSelectedMetric] = useState<string | undefined>(defaultSelectedMetric || createdMetrics[0])

  const { updateParentFormik } = useCommonHealthSource()

  const filteredGroupMetric = useMemo(() => {
    return getFilteredGroupedCreatedMetric(groupedCreatedMetrics, filter)
  }, [filter, groupedCreatedMetrics])

  const createdMetricsLength = useMemo(
    () => getCreatedMetricLength(createdMetrics, groupedCreatedMetrics),
    [groupedCreatedMetrics, createdMetrics]
  )

  const hasOnRemove = shouldBeAbleToDeleteLastMetric || createdMetricsLength > 1

  useEffect(() => {
    setSelectedMetric(defaultSelectedMetric)
  }, [defaultSelectedMetric])

  useEffect(() => {
    if (propsCreatedMetrics?.length) {
      setCreatedMetrics(propsCreatedMetrics)
    }
  }, [propsCreatedMetrics])

  return (
    <Container className={css.main}>
      <Button
        icon="plus"
        variation={ButtonVariation.SECONDARY}
        disabled={!isValidInput}
        tooltip={!isValidInput ? tooptipMessage : undefined}
        tooltipProps={{ interactionKind: PopoverInteractionKind.HOVER_TARGET_ONLY }}
        margin={{ bottom: 'small', left: 'medium', top: 'medium' }}
        onClick={() => {
          // TODO - This will be implemented once the entire form is implemented
          // if (isValidInput) {
          // }
          updateParentFormik(CommonHealthSourceContextFields.SelectedMetric, '')
          openEditMetricModal()
        }}
      >
        {addFieldLabel}
      </Button>
      <CommonSelectedAppsSideNav
        key={createdMetrics?.map(i => i)?.join('')}
        isValidInput={isValidInput}
        onSelect={(newlySelectedMetric, index) => {
          onSelectMetric(newlySelectedMetric, createdMetrics, index)
          setSelectedMetric(newlySelectedMetric)
        }}
        selectedItem={selectedMetric}
        groupedSelectedApps={filteredGroupMetric}
        isMetricThresholdEnabled={isMetricThresholdEnabled}
        openEditMetricModal={openEditMetricModal}
        onRemoveItem={
          hasOnRemove
            ? removedItem => {
                setCreatedMetrics(oldMetrics => {
                  const { updatedMetric, filteredOldMetrics, updateIndex } = getUpdatedMetric(oldMetrics, removedItem)
                  setSelectedMetric(updatedMetric)
                  onRemoveMetric(removedItem, updatedMetric, [...filteredOldMetrics], defaultTo(updateIndex, 0))
                  return [...filteredOldMetrics]
                })
              }
            : undefined
        }
        filterProps={{
          onFilter: setFilter,
          className: css.metricsFilter,
          placeholder: getString('cv.monitoringSources.commonHealthSource.searchMetric')
        }}
      />
    </Container>
  )
}
