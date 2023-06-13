/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Button } from '@harness/uicore'
import { useModalHook } from '@harness/use-modal'
import { Drawer, IDialogProps, Position } from '@blueprintjs/core'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { DelegateActions, Category } from '@common/constants/TrackingConstants'
import DelegateCommandLineCreation from '../DelegateCommandLineCreation'

import css from '@delegates/pages/delegates/DelegatesPage.module.scss'
export interface useCreateDelegateViaCommandsModalProps {
  oldDelegateCreation?: () => void
  onClose?: (delegateName?: string) => void
  hideDocker?: boolean
  onDelegateNameChange?: (name: string) => void
}

export interface useCreateDelegateViaCommandsModalReturn {
  openDelegateModalWithCommands: (modalProps?: IDialogProps) => void
  closeDelegateModalWithCommands: () => void
}

const useCreateDelegateViaCommandsModal = (
  useCreateDelegateViaCommandsModalProps?: useCreateDelegateViaCommandsModalProps
): useCreateDelegateViaCommandsModalReturn => {
  const { trackEvent } = useTelemetry()

  const onClose = (): void => {
    trackEvent(DelegateActions.DelegateCommandLineCreationClosed, {
      category: Category.DELEGATE
    })
    if (useCreateDelegateViaCommandsModalProps?.onClose) {
      useCreateDelegateViaCommandsModalProps.onClose()
    }
    if (closeDelegateModalWithCommands) {
      closeDelegateModalWithCommands()
    }
  }

  const [openDelegateModalWithCommands, closeDelegateModalWithCommands] = useModalHook(() => {
    return (
      <Drawer position={Position.RIGHT} isOpen={true} isCloseButtonShown={false} size={'86%'} onClose={onClose}>
        <Button minimal className={css.almostFullScreenCloseBtn} icon="cross" withoutBoxShadow onClick={onClose} />

        <DelegateCommandLineCreation
          onDone={onClose}
          hideDocker={useCreateDelegateViaCommandsModalProps?.hideDocker}
          oldDelegateCreation={useCreateDelegateViaCommandsModalProps?.oldDelegateCreation}
        />
      </Drawer>
    )
  })
  return {
    openDelegateModalWithCommands,
    closeDelegateModalWithCommands
  }
}

export default useCreateDelegateViaCommandsModal
