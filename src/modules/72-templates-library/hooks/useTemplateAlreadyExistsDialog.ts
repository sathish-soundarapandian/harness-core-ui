/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { useConfirmationDialog } from '@harness/uicore'
import { Intent as DialogIntent } from '@harness/design-system'
import { useStrings } from 'framework/strings'

export interface TemplateAlreadyExistsDialogParams {
  onConfirmationCallback: () => Promise<void>
  onCloseCallback?: () => void
  dialogClassName?: string
}

export interface TemplateAlreadyExistsDialogReturnType {
  openTemplateAlreadyExistsDialog: () => void
}

export function useTemplateAlreadyExistsDialog({
  onConfirmationCallback,
  onCloseCallback,
  dialogClassName
}: TemplateAlreadyExistsDialogParams): TemplateAlreadyExistsDialogReturnType {
  const { getString } = useStrings()
  const { openDialog: openTemplateAlreadyExistsDialog } = useConfirmationDialog({
    cancelButtonText: getString('cancel'),
    contentText: getString('pipeline.templateAlreadyExists.content'),
    titleText: getString('pipeline.templateAlreadyExists.title'),
    confirmButtonText: getString('pipeline.templateAlreadyExists.confirmation'),
    intent: DialogIntent.WARNING,
    className: dialogClassName,
    onCloseDialog: /* istanbul ignore next */ isConfirmed => {
      if (isConfirmed) {
        onConfirmationCallback()
      } else {
        onCloseCallback?.()
      }
    }
  })

  return { openTemplateAlreadyExistsDialog }
}
