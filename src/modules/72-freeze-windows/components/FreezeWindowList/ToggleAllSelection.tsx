/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FC } from 'react'
import { Checkbox } from '@harness/uicore'
import { killEvent } from '@common/utils/eventUtils'
import { useFreezeWindowListContext } from '@freeze-windows/context/FreezeWindowListContext'
import type { FreezeSummaryResponse } from 'services/cd-ng'
import css from './FreezeWindowList.module.scss'

export const ToggleAllSelection: FC<{ data: FreezeSummaryResponse[]; canEdit: boolean }> = ({ data, canEdit }) => {
  const { toggleAllSelect, selectedItems } = useFreezeWindowListContext()

  return (
    <div className={css.checkbox} onClick={killEvent}>
      <Checkbox
        readOnly={!canEdit}
        aria-label="Select all rows"
        indeterminate={selectedItems.length > 0 && selectedItems.length !== data.length}
        large
        checked={selectedItems.length === data.length}
        onChange={event => {
          toggleAllSelect(
            selectedItems.length > 0 ? false : event.currentTarget.checked,
            data.map(item => item.identifier!)
          )
        }}
      />
    </div>
  )
}
