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

import type { EntityReferenceResponse } from '../EntityReference/EntityReference'
import type { ScopeAndIdentifier } from '../MultiSelectEntityReference/MultiSelectEntityReference'

import css from './CollapsableList.module.scss'

export interface CollapsableTableProps<T> {
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
  selectedScope: Scope
  disableCollapse?: boolean
  isMultiSelect?: boolean
}

export function CollapsableList<T>(props: CollapsableTableProps<T>): JSX.Element {
  const {
    disableCollapse = false,
    isMultiSelect = false,
    selectedScope,
    selectedRecord,
    setSelectedRecord,
    selectedRecords,
    setSelectedRecords
  } = props

  const isSelected = (item: EntityReferenceResponse<T>): boolean => {
    if (isMultiSelect)
      return selectedRecords.some(sR => sR.scope === selectedScope && sR.identifier === item.identifier)
    return selectedRecord === item.record
  }

  const onItemClick: (item: EntityReferenceResponse<T>) => MouseEventHandler<HTMLDivElement> = item => e => {
    e.preventDefault()
    e.stopPropagation()

    if (isMultiSelect) {
      setSelectedRecords(prev => {
        const existingRecord = prev.find(el => el.identifier === item.identifier && el.scope === selectedScope)
        return existingRecord
          ? prev.filter(el => el !== existingRecord)
          : [...prev, { scope: selectedScope, identifier: item.identifier }]
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
                  selectedScope,
                  selected: isSelected(item)
                })}
              </div>
            }
          >
            {props.collapsedRecordRender?.({
              item,
              selectedScope,
              selected: isSelected(item)
            })}
          </Collapse>
        ))}
      </div>
      <Pagination {...props.pagination} />
    </>
  )
}
