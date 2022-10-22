/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Button, ButtonVariation, Layout } from '@wings-software/uicore'
import React, { FC } from 'react'
import { useStrings } from 'framework/strings'
import { useFreezeWindowListContext } from '@freeze-windows/context/FreezeWindowListContext'
import type { FreezeWindowListColumnActions } from '../FreezeWindowList/FreezeWindowListCells'

interface BulkActionsProps {
  onDelete: FreezeWindowListColumnActions['onDeleteRow']
  onToggleFreeze: FreezeWindowListColumnActions['onToggleFreezeRow']
}

export const BulkActions: FC<BulkActionsProps> = ({ onDelete, onToggleFreeze }) => {
  const { getString } = useStrings()
  const { selectedItems } = useFreezeWindowListContext()

  return selectedItems.length > 0 ? (
    <Layout.Horizontal spacing={'small'} flex={{ align: 'center-center' }}>
      <Button
        variation={ButtonVariation.SECONDARY}
        onClick={() => onToggleFreeze({ status: 'Enabled' })}
        text={getString('enable')}
      />
      <Button
        variation={ButtonVariation.SECONDARY}
        onClick={() => onToggleFreeze({ status: 'Disabled' })}
        text={getString('common.disable')}
      />
      <Button variation={ButtonVariation.SECONDARY} onClick={() => onDelete()} text={getString('delete')} />
    </Layout.Horizontal>
  ) : null
}
