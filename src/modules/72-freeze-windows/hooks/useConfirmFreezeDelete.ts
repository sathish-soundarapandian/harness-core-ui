/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Intent } from '@blueprintjs/core'
import { useConfirmationDialog } from '@harness/uicore'
import { useState } from 'react'
import { useStrings } from 'framework/strings'

export const useConfirmFreezeDelete = (action: (data?: string) => void) => {
  const { getString } = useStrings()
  const [deleteId, setDeleteId] = useState<string | undefined>()

  const { openDialog } = useConfirmationDialog({
    titleText: getString('freezeWindows.freezeWindowsPage.confirmDeleteTitle'),
    contentText: getString('freezeWindows.freezeWindowsPage.confirmDeleteText', { name: deleteId }),
    confirmButtonText: getString('confirm'),
    cancelButtonText: getString('cancel'),
    intent: Intent.DANGER,
    onCloseDialog: isConfirmed => {
      if (isConfirmed) {
        action(deleteId)
      }
      setDeleteId(undefined)
    }
  })

  const confirmFreezeDelete = (data?: string) => {
    setDeleteId(data)
    openDialog()
  }

  return confirmFreezeDelete
}
