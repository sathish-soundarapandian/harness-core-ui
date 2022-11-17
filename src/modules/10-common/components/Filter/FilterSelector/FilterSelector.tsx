/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { PopoverInteractionKind, Position } from '@blueprintjs/core'
import { truncate } from 'lodash-es'
import { SelectOption, Layout, Popover, Button, DropDown } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import { getFilterSummary, MAX_FILTER_NAME_LENGTH, getFilterSize } from '@common/components/Filter/utils/FilterUtils'
import type { FilterInterface } from '../Constants'

import css from './FilterSelector.module.scss'

interface FilterSelectorProps<T> {
  appliedFilter?: T | null
  filters?: T[]
  onFilterBtnClick: () => void
  onFilterSelect: (option: SelectOption, event?: React.SyntheticEvent<HTMLElement, Event> | undefined) => void
  fieldToLabelMapping: Map<string, string>
  filterWithValidFields: {
    [key: string]: string
  }
}

export default function FilterSelector<T extends FilterInterface>(props: FilterSelectorProps<T>): React.ReactElement {
  const { filters, onFilterBtnClick, onFilterSelect, appliedFilter, fieldToLabelMapping, filterWithValidFields } = props
  const { getString } = useStrings()

  const renderFilterBtn = React.useCallback(
    (): JSX.Element => (
      <Button
        id="ngfilterbtn"
        icon="ng-filter"
        onClick={onFilterBtnClick}
        className={css.ngFilter}
        intent="primary"
        minimal
        iconProps={{ size: 22 }}
        withoutBoxShadow
      />
    ),
    [onFilterBtnClick]
  )

  const fieldCountInAppliedFilter = getFilterSize(filterWithValidFields)

  const getItems = React.useMemo(
    () =>
      filters?.map(item => ({
        label: truncate(item?.name, { length: MAX_FILTER_NAME_LENGTH }),
        value: item?.identifier
      })) as SelectOption[],
    [filters]
  )

  return (
    <>
      <DropDown
        buttonTestId={'filter-select'}
        onChange={onFilterSelect}
        value={appliedFilter ? appliedFilter.identifier : null}
        items={getItems}
        placeholder={filters?.length ? getString('filters.selectFilter') : getString('common.filters.noFilterSaved')}
        minWidth={220}
        usePortal={true}
        addClearBtn={true}
      />
      <div className={css.filterButtonContainer}>
        {fieldCountInAppliedFilter ? (
          <Popover
            interactionKind={PopoverInteractionKind.HOVER}
            position={Position.BOTTOM}
            content={getFilterSummary(fieldToLabelMapping, filterWithValidFields)}
            popoverClassName={css.summaryPopover}
          >
            {renderFilterBtn()}
          </Popover>
        ) : (
          renderFilterBtn()
        )}
      </div>
      <Layout.Horizontal>
        {fieldCountInAppliedFilter > 0 ? <span className={css.fieldCount}>{fieldCountInAppliedFilter}</span> : null}
      </Layout.Horizontal>
    </>
  )
}
