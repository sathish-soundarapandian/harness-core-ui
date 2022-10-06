/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { ReactElement, useMemo } from 'react'
import { DateRangePickerButton, DropDown, ExpandingSearchInput, FlexExpander, Layout, Page } from '@harness/uicore'
import { useUpdateQueryParams } from '@common/hooks'
import { useQueryParams } from '@common/hooks/useQueryParams'
import { DEFAULT_PAGE_INDEX } from '@pipeline/utils/constants'
import { useStrings } from 'framework/strings'
import type { FreezeFilterPropertiesDTO } from 'services/cd-ng'
import { NewFreezeWindowButton } from '@freeze-windows/components/NewFreezeWindowButton/NewFreezeWindowButton'
import type { FreezeListUrlQueryParams } from '@freeze-windows/types'
import { getDefaultCalenderFilter, getQueryParamOptions, STATUS_OPTIONS } from '@freeze-windows/utils/queryUtils'
import css from './FreezeWindowListSubHeader.module.scss'

export function FreezeWindowListSubHeader(): ReactElement {
  const { getString } = useStrings()
  const { updateQueryParams } = useUpdateQueryParams<Partial<FreezeListUrlQueryParams>>()
  const queryParams = useQueryParams<FreezeListUrlQueryParams>(getQueryParamOptions())
  const { searchTerm, freezeStatus } = queryParams
  const defaultDateRangeValue = useMemo(() => getDefaultCalenderFilter(), [])

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
          initialButtonText={getString('common.last7days')}
          dateRangePickerProps={{ defaultValue: defaultDateRangeValue }}
          onChange={([selectedStartTime, selectedEndTime]) => {
            updateQueryParams({
              startTime: selectedStartTime.getTime(),
              endTime: selectedEndTime.getTime(),
              page: DEFAULT_PAGE_INDEX
            })
          }}
          renderButtonText={([selectedstartTime, selectedendTime]) =>
            `${selectedstartTime.toLocaleDateString()} - ${selectedendTime.toLocaleDateString()}`
          }
        />
        <FlexExpander />
        <ExpandingSearchInput
          alwaysExpanded
          width={200}
          placeholder={getString('search')}
          onChange={text => {
            updateQueryParams({ searchTerm: text, page: DEFAULT_PAGE_INDEX })
          }}
          defaultValue={searchTerm}
        />
      </Layout.Horizontal>
    </Page.SubHeader>
  )
}
