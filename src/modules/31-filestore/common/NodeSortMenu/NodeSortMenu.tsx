/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { DropDown, SelectOption, Container } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import { FileStoreContext } from '@filestore/components/FileStoreContext/FileStoreContext'
import { defaultSortItems } from '@filestore/utils/constants'
import type { SortType } from '@filestore/interfaces/FileStore'
import { getSortLabelByActionType } from '@filestore/utils/FileStoreUtils'

export const NodeSortMenu = (): React.ReactElement => {
  const { getString } = useStrings()
  const { updateGlobalSort, globalSort } = React.useContext(FileStoreContext)

  const options: SelectOption[] = React.useMemo(() => {
    return defaultSortItems.map((item: SortType) => ({
      value: item as string,
      label: getString(getSortLabelByActionType(item))
    }))
  }, [])

  return (
    <Container margin={{ right: 'medium' }}>
      <DropDown
        items={options}
        value={globalSort}
        onChange={selected => {
          updateGlobalSort(selected.value as SortType)
        }}
        icon="swap-vertical"
        width={170}
      />
    </Container>
  )
}
