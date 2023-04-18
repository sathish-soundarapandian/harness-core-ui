/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { ReactElement, useMemo } from 'react'
import type { DateRange } from '@blueprintjs/datetime'
import { isUndefined } from 'lodash-es'
import {
  Button,
  ButtonVariation,
  DateRangePickerButton,
  DropDown,
  ExpandingSearchInput,
  ExpandingSearchInputHandle,
  FlexExpander,
  Layout,
  Page
} from '@harness/uicore'
import { useUpdateQueryParams } from '@common/hooks'
import { useQueryParams } from '@common/hooks/useQueryParams'
import { DEFAULT_PAGE_INDEX } from '@pipeline/utils/constants'
import { useStrings } from 'framework/strings'
import type { FreezeFilterPropertiesDTO } from 'services/cd-ng'
import { NewFreezeWindowButton } from '@freeze-windows/components/NewFreezeWindowButton/NewFreezeWindowButton'
import type { FreezeListUrlQueryParams } from '@freeze-windows/types'
import { getDefaultCalenderFilter, getQueryParamOptions, STATUS_OPTIONS } from '@freeze-windows/utils/queryUtils'
import css from './FreezeWindowListSubHeader.module.scss'

function _FreezeWindowListSubHeader(
  { resetFilter }: { resetFilter: () => void },
  ref: React.ForwardedRef<ExpandingSearchInputHandle>
): ReactElement {
  const { getString } = useStrings()
  const { updateQueryParams } = useUpdateQueryParams<Partial<FreezeListUrlQueryParams>>()
  const queryParams = useQueryParams<FreezeListUrlQueryParams>(getQueryParamOptions())
  const { searchTerm, freezeStatus, startTime, endTime } = queryParams
  const [start, end] = useMemo(() => getDefaultCalenderFilter(), [])

  const dateRange: DateRange = [startTime ? new Date(startTime) : undefined, endTime ? new Date(endTime) : undefined]
  const isLast7Days = dateRange[0]?.getTime() === start.getTime() && dateRange[1]?.getTime() === end.getTime()
  const isNoRangeSelected = isUndefined(dateRange[0]) || isUndefined(dateRange[1])
  return (
    <Page.SubHeader className={css.subHeader}>
      <Layout.Horizontal spacing={'medium'} className={css.subHeaderActions}>
        <NewFreezeWindowButton />
        <DropDown
          value={freezeStatus}
          onChange={({ value }) => {
            updateQueryParams({
              freezeStatus: value as FreezeFilterPropertiesDTO['freezeStatus'],
              page: DEFAULT_PAGE_INDEX
            })
          }}
          items={STATUS_OPTIONS}
          filterable={false}
          addClearBtn={true}
          placeholder="Freeze Toggle"
        />
        <DateRangePickerButton
          className={css.dateRange}
          initialButtonText={
            isNoRangeSelected
              ? getString('freezeWindows.freezeWindowsPage.selectDateRange')
              : isLast7Days
              ? getString('freezeWindows.freezeWindowsPage.dateRangeLabel')
              : `${dateRange[0]?.toLocaleDateString()} - ${dateRange[1]?.toLocaleDateString()}`
          }
          dateRangePickerProps={{ defaultValue: dateRange, allowSingleDayRange: false }}
          onChange={([selectedStartTime, selectedEndTime]) => {
            updateQueryParams({
              startTime: selectedStartTime.getTime(),
              endTime: selectedEndTime.getTime(),
              page: DEFAULT_PAGE_INDEX
            })
          }}
          renderButtonText={selectedDates =>
            `${selectedDates[0].toLocaleDateString()} - ${selectedDates[1].toLocaleDateString()}`
          }
        />
        <Button
          text={getString('common.filters.clearFilters')}
          onClick={resetFilter}
          variation={ButtonVariation.SECONDARY}
        />
        <FlexExpander />
        <ExpandingSearchInput
          alwaysExpanded
          width={200}
          placeholder={getString('search')}
          onChange={text => {
            updateQueryParams(text ? { searchTerm: text, page: DEFAULT_PAGE_INDEX } : { searchTerm: undefined })
          }}
          defaultValue={searchTerm}
          ref={ref}
        />
      </Layout.Horizontal>
    </Page.SubHeader>
  )
}

export const FreezeWindowListSubHeader = React.forwardRef(_FreezeWindowListSubHeader)
