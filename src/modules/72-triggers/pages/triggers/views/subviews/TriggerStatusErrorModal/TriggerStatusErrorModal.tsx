/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { ModalDialog } from '@harness/uicore'
import type { ModalDialogProps } from '@harness/uicore/dist/components/ModalDialog/ModalDialog'
import { useStrings } from 'framework/strings'
import type { TriggerStatus } from 'services/pipeline-ng'
import css from './TriggerStatusErrorModal.module.scss'

const modalProps: Omit<ModalDialogProps, 'isOpen'> = {
  usePortal: true,
  autoFocus: true,
  canEscapeKeyClose: false,
  canOutsideClickClose: false,
  enforceFocus: false,
  style: {
    width: 750
  }
}

export interface TriggerStatusErrorModalProps {
  triggerStatus: TriggerStatus
  isOpen: boolean
  closeDialog: () => void
}

export default function TriggerStatusErrorModal({
  triggerStatus,
  isOpen,
  closeDialog
}: TriggerStatusErrorModalProps): React.ReactElement {
  const { getString } = useStrings()

  return (
    <ModalDialog
      {...modalProps}
      isOpen={isOpen}
      title={getString('errorDetails')}
      className={css.modal}
      onClose={closeDialog}
    >
      <div className={css.errorMsg}>
        <pre data-testid="trigger-status-errors">{JSON.stringify(triggerStatus.detailMessages, null, ' ')}</pre>
      </div>
    </ModalDialog>
  )
}
