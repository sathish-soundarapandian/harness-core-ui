/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { ReactElement, useRef, useState } from 'react'
import {
  DateRangePickerButton,
  DropDown,
  ExpandingSearchInput,
  ExpandingSearchInputHandle,
  FlexExpander,
  Layout
} from '@harness/uicore'
import { useUpdateQueryParams } from '@common/hooks'
import { queryParamDecodeAll, useQueryParams } from '@common/hooks/useQueryParams'
import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE, DEFAULT_PIPELINE_LIST_TABLE_SORT } from '@pipeline/utils/constants'
import { useStrings } from 'framework/strings'
import type { GetFreezeListQueryParams } from 'services/cd-ng'
import { NewFreezeWindowButton } from '@freeze-windows/components/NewFreezeWindowButton/NewFreezeWindowButton'
import type { PartiallyRequired } from '@pipeline/utils/types'
import css from './FreezeWindowSubHeader.module.scss'

export type ProcessedFreezeListPageQueryParams = PartiallyRequired<GetFreezeListQueryParams, 'page' | 'size' | 'sort'>
export const queryParamOptions = {
  parseArrays: true,
  decoder: queryParamDecodeAll(),
  processQueryParams(params: GetFreezeListQueryParams): ProcessedFreezeListPageQueryParams {
    return {
      ...params,
      page: params.page ?? DEFAULT_PAGE_INDEX,
      size: params.size ?? DEFAULT_PAGE_SIZE,
      sort: params.sort ?? DEFAULT_PIPELINE_LIST_TABLE_SORT
    }
  }
}

export function FreezeWindowSubHeader(): ReactElement {
  const { getString } = useStrings()
  const searchRef = useRef({} as ExpandingSearchInputHandle)
  const { updateQueryParams } = useUpdateQueryParams<Partial<GetFreezeListQueryParams>>()
  const queryParams = useQueryParams<ProcessedFreezeListPageQueryParams>(queryParamOptions)
  const { searchTerm, status } = queryParams

  const [startDate, setStartDate] = useState<Date>(() => {
    const start = new Date()
    start.setDate(start.getDate() - 7)
    start.setHours(0, 0, 0, 0)
    return start
  })

  const [endDate, setEndDate] = useState<Date>(() => {
    const end = new Date()
    end.setHours(23, 59, 59, 999)
    return end
  })

  return (
    <Layout.Horizontal spacing={'medium'} className={css.subHeaderActions}>
      <NewFreezeWindowButton />
      <DropDown
        value={status}
        onChange={() => {
          // todo
        }}
        items={[
          { label: 'Enabled', value: 'enabled' },
          { label: 'Disabled', value: 'disabled' }
        ]}
        filterable={false}
        addClearBtn={true}
        placeholder="Freeze Toggle"
      />
      <DateRangePickerButton
        className={css.dateRange}
        initialButtonText={getString('common.last7days')}
        dateRangePickerProps={{ defaultValue: [startDate, endDate] }}
        onChange={([selectedStartDate, selectedEndDate]) => {
          setStartDate(selectedStartDate)
          setEndDate(selectedEndDate)
        }}
        renderButtonText={([selectedStartDate, selectedEndDate]) =>
          `${selectedStartDate.toLocaleDateString()} - ${selectedEndDate.toLocaleDateString()}`
        }
      />
      <FlexExpander />
      <ExpandingSearchInput
        alwaysExpanded
        width={200}
        placeholder={getString('search')}
        onChange={text => {
          updateQueryParams({ searchTerm: text ?? undefined, page: DEFAULT_PAGE_INDEX })
        }}
        defaultValue={searchTerm}
        ref={searchRef}
      />
    </Layout.Horizontal>
  )
}
