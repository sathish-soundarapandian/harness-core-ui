/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback } from 'react'
import { Classes, Dialog } from '@blueprintjs/core'
import cx from 'classnames'

import { useModalHook } from '@harness/use-modal'
import CheckIPForm from './views/CheckIPForm'
import css from './useCheckIPModal.module.scss'

export interface useCheckIPModalProps {
  onCloseModal?: () => void
}

export interface useCheckIPModalReturn {
  openCheckIPModal: () => void
  closeCheckIPModal: () => void
}

const useCheckIPModal = (): useCheckIPModalReturn => {
  const [showModal, hideModal] = useModalHook(
    () => (
      <Dialog
        isOpen={true}
        enforceFocus={false}
        onClose={hideModal}
        title=""
        className={cx(css.dialog, Classes.DIALOG)}
      >
        <CheckIPForm onClose={hideModal} />
      </Dialog>
    ),
    []
  )
  const open = useCallback(() => {
    showModal()
  }, [showModal])

  return {
    openCheckIPModal: open,
    closeCheckIPModal: hideModal
  }
}

export default useCheckIPModal
