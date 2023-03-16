/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */
import React, { useMemo, useState } from 'react'
import { defaultTo } from 'lodash-es'
import { Button, ButtonVariation, Container } from '@harness/uicore'
import { PopoverInteractionKind } from '@blueprintjs/core'
import { useFormikContext } from 'formik'
import { useStrings } from 'framework/strings'
import { CommonConfigurationsFormFieldNames } from '@cv/pages/health-source/connectors/CommonHealthSource/CommonHealthSource.constants'
import type { CommonCustomMetricFormikInterface } from '@cv/pages/health-source/connectors/CommonHealthSource/CommonHealthSource.types'
import { useCommonHealthSource } from '@cv/pages/health-source/connectors/CommonHealthSource/components/CustomMetricForm/components/CommonHealthSourceContext/useCommonHealthSource'
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
  renamedMetric?: string
  createdMetrics?: string[]
  defaultSelectedMetric?: string
  defaultMetricName: string
  tooptipMessage: string
  addFieldLabel: string
  groupedCreatedMetrics?: GroupedCreatedMetrics
  shouldBeAbleToDeleteLastMetric?: boolean
  openEditMetricModal: () => void
}

export function CommonMultiItemsSideNav(props: CommonMultiItemsSideNavProps): JSX.Element {
  const { isValid } = useFormikContext<CommonCustomMetricFormikInterface>()

  const {
    onSelectMetric,
    createdMetrics: propsCreatedMetrics,
    onRemoveMetric,
    defaultSelectedMetric,
    defaultMetricName,
    tooptipMessage,
    addFieldLabel,
    groupedCreatedMetrics,
    shouldBeAbleToDeleteLastMetric,
    openEditMetricModal
  } = props
  const { getString } = useStrings()
  const [filter, setFilter] = useState<string | undefined>()
  const createdMetrics = useMemo(
    () => (propsCreatedMetrics?.length ? propsCreatedMetrics : [defaultMetricName]),
    [propsCreatedMetrics]
  )
  const selectedMetric = defaultSelectedMetric || createdMetrics[0]
  const { updateParentFormik } = useCommonHealthSource()
  const filteredGroupMetric = useMemo(() => {
    return getFilteredGroupedCreatedMetric(groupedCreatedMetrics, filter)
  }, [filter, groupedCreatedMetrics])

  const createdMetricsLength = useMemo(
    () => getCreatedMetricLength(createdMetrics, groupedCreatedMetrics),
    [groupedCreatedMetrics, createdMetrics]
  )
  const hasOnRemove = shouldBeAbleToDeleteLastMetric || createdMetricsLength > 1
  const hideDeleteIcon = Boolean(!shouldBeAbleToDeleteLastMetric && createdMetricsLength === 1)

  const onRemoveItem = (removedItem: string): void => {
    if (!hasOnRemove) return
    const { updatedMetric, filteredOldMetrics, updateIndex } = getUpdatedMetric(createdMetrics, removedItem)
    updateParentFormik(CommonConfigurationsFormFieldNames.SELECTED_METRIC, updatedMetric)
    onRemoveMetric(removedItem, updatedMetric, [...filteredOldMetrics], defaultTo(updateIndex, 0))
  }

  return (
    <Container className={css.main}>
      <Button
        icon="plus"
        variation={ButtonVariation.SECONDARY}
        disabled={!isValid}
        tooltip={!isValid ? tooptipMessage : undefined}
        tooltipProps={{ interactionKind: PopoverInteractionKind.HOVER_TARGET_ONLY }}
        margin={{ bottom: 'small', left: 'medium', top: 'medium' }}
        onClick={() => {
          updateParentFormik(CommonConfigurationsFormFieldNames.SELECTED_METRIC, '')
          openEditMetricModal()
        }}
      >
        {addFieldLabel}
      </Button>
      <CommonSelectedAppsSideNav
        onSelect={(newlySelectedMetric, index) => {
          // Allow change of panel only if current panel is valid
          if (isValid) {
            onSelectMetric(newlySelectedMetric, createdMetrics, index)
            updateParentFormik(CommonConfigurationsFormFieldNames.SELECTED_METRIC, newlySelectedMetric)
          }
        }}
        selectedItem={selectedMetric}
        groupedSelectedApps={filteredGroupMetric}
        openEditMetricModal={openEditMetricModal}
        onRemoveItem={onRemoveItem}
        hideDeleteIcon={hideDeleteIcon}
        filterProps={{
          onFilter: setFilter,
          className: css.metricsFilter,
          placeholder: getString('cv.monitoringSources.commonHealthSource.searchMetric')
        }}
      />
    </Container>
  )
}
