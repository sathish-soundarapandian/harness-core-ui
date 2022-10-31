/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { Dispatch, MouseEventHandler, SetStateAction } from 'react'

import cx from 'classnames'

import type { IconProps } from '@harness/icons'
import { Collapse, Pagination, PaginationProps } from '@wings-software/uicore'
import type { Scope } from '@common/interfaces/SecretsInterface'

import {
  EntityReferenceResponse,
  getScopeFromDTO,
  ScopedObjectDTO,
  TAB_ID
} from '../EntityReference/EntityReference.types'
import type { ScopeAndIdentifier } from '../MultiSelectEntityReference/MultiSelectEntityReference'

import css from './CollapsableList.module.scss'

export interface CollapsableTableProps<T extends ScopedObjectDTO> {
  selectedRecord: T | undefined
  setSelectedRecord: (val: T | undefined) => void
  selectedRecords: ScopeAndIdentifier[]
  setSelectedRecords: Dispatch<SetStateAction<ScopeAndIdentifier[]>>
  data: EntityReferenceResponse<T>[]
  recordRender: (args: { item: EntityReferenceResponse<T>; selectedScope: Scope; selected?: boolean }) => JSX.Element
  collapsedRecordRender?: (args: {
    item: EntityReferenceResponse<T>
    selectedScope: Scope
    selected?: boolean
  }) => JSX.Element
  pagination: PaginationProps
  disableCollapse?: boolean
  isMultiSelect?: boolean
  selectedTab?: TAB_ID
}

export function CollapsableList<T extends ScopedObjectDTO>(props: CollapsableTableProps<T>): JSX.Element {
  const {
    disableCollapse = false,
    isMultiSelect = false,
    selectedRecord,
    setSelectedRecord,
    selectedRecords,
    setSelectedRecords
  } = props

  const isSelected = (item: EntityReferenceResponse<T>): boolean => {
    if (isMultiSelect)
      return selectedRecords.some(sR => sR.identifier === item.identifier && getScopeFromDTO(item.record) === sR.scope)
    return selectedRecord === item.record
  }

  const onItemClick: (item: EntityReferenceResponse<T>) => MouseEventHandler<HTMLDivElement> = item => e => {
    e.preventDefault()
    e.stopPropagation()

    if (isMultiSelect) {
      setSelectedRecords(prev => {
        const existingRecord = prev.find(
          el => el.identifier === item.identifier && getScopeFromDTO(item.record) === el.scope
        )
        return existingRecord
          ? prev.filter(el => el !== existingRecord)
          : [...prev, { scope: getScopeFromDTO(item.record), identifier: item.identifier }]
      })
    } else {
      setSelectedRecord(props.selectedRecord === item.record ? undefined : item.record)
    }
  }

  return (
    <>
      <div className={css.referenceList}>
        {props.data.map((item: EntityReferenceResponse<T>) => (
          <Collapse
            key={item.identifier}
            collapsedIcon="main-chevron-right"
            expandedIcon="main-chevron-down"
            iconProps={{ size: 12 } as IconProps}
            isRemovable={false}
            collapseClassName={cx(css.collapseWrapper, {
              [css.selectedItem]: isSelected(item)
            })}
            collapseHeaderClassName={cx(css.collapseHeader, { [css.hideCollapseIcon]: disableCollapse })}
            heading={
              <div onClick={onItemClick(item)} className={css.collapeHeaderContent}>
                {props.recordRender({
                  item,
                  selectedScope: getScopeFromDTO(item.record),
                  selected: isSelected(item)
                })}
              </div>
            }
          >
            {props.collapsedRecordRender?.({
              item,
              selectedScope: getScopeFromDTO(item.record),
              selected: isSelected(item)
            })}
          </Collapse>
        ))}
      </div>
      <Pagination {...props.pagination} />
    </>
  )
}
