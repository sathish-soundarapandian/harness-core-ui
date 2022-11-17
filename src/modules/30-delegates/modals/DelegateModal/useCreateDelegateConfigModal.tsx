/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Button } from '@harness/uicore'
import { useModalHook } from '@harness/use-modal'
import { Dialog, IDialogProps } from '@blueprintjs/core'
import { CreateDelegateConfigWizard } from '@delegates/components/CreateDelegateConfigWizard/CreateDelegateConfigWizard'
import css from './useCreateDelegateModal.module.scss'

export interface UseCreateDelegateModalProps {
  onSuccess: () => void
}

export interface UseCreateDelegateModalReturn {
  openDelegateConfigModal: (modalProps?: IDialogProps) => void
  closeDelegateConfigModal: () => void
}

const modalProps: IDialogProps = {
  isOpen: true,
  enforceFocus: false,
  style: {
    width: 1200,
    height: 640,
    minHeight: 'auto',
    borderLeft: 0,
    paddingBottom: 0,
    position: 'relative',
    overflow: 'hidden'
  }
}
const useCreateDelegateConfigModal = ({ onSuccess }: UseCreateDelegateModalProps): UseCreateDelegateModalReturn => {
  const [showModal, hideModal] = useModalHook(
    () => (
      <Dialog {...modalProps} onClose={() => hideModal()}>
        <CreateDelegateConfigWizard onClose={() => hideModal()} onSuccess={onSuccess} />
        <Button minimal icon="cross" iconProps={{ size: 18 }} onClick={hideModal} className={css.crossIcon} />
      </Dialog>
    ),
    []
  )
  return {
    openDelegateConfigModal: () => {
      showModal()
    },
    closeDelegateConfigModal: hideModal
  }
}

export default useCreateDelegateConfigModal
