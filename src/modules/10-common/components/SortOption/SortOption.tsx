/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { DropDown, SelectOption } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import { Sort, SortFields } from '@common/utils/listUtils'

export const selectedOpt = (sortOption: string[]): 1 | 2 | 0 => {
  if (sortOption[0] === SortFields.Name && sortOption[1] === Sort.ASC) {
    return 1
  } else if (sortOption[0] === SortFields.Name) {
    return 2
  }
  return 0
}

export interface SortOptionProps {
  setSort: React.Dispatch<React.SetStateAction<string[]>>
  sort: string[]
  setSavedSortOption?: (value: string[] | undefined) => void
}

export const SortOption = (props: SortOptionProps): JSX.Element => {
  const { setSavedSortOption, setSort, sort } = props
  const { getString } = useStrings()

  const sortOptions = React.useMemo(() => {
    return [
      {
        label: getString('common.lastModified'),
        value: SortFields.LastModifiedAt
      },
      {
        label: getString('AZ09'),
        value: SortFields.AZ09
      },

      {
        label: getString('ZA90'),
        value: SortFields.ZA90
      }
    ]
  }, [])

  const [selectedSort, setSelectedSort] = useState<SelectOption>(sortOptions[selectedOpt(sort)])

  const onDropDownChange = React.useCallback(
    item => {
      if (item.value === SortFields.AZ09) {
        setSort([SortFields.Name, Sort.ASC])
        setSavedSortOption?.([SortFields.Name, Sort.ASC])
      } else if (item.value === SortFields.ZA90) {
        setSort([SortFields.Name, Sort.DESC])
        setSavedSortOption?.([SortFields.Name, Sort.DESC])
      } else {
        setSort([SortFields.LastModifiedAt, Sort.DESC])
        setSavedSortOption?.([SortFields.LastModifiedAt, Sort.DESC])
      }
      setSelectedSort(item)
    },
    [setSort, setSavedSortOption]
  )

  return (
    <DropDown
      items={sortOptions}
      value={selectedSort.value.toString()}
      filterable={false}
      width={180}
      icon={'main-sort'}
      iconProps={{ size: 16, color: Color.GREY_400 }}
      onChange={onDropDownChange}
      usePortal
    />
  )
}
