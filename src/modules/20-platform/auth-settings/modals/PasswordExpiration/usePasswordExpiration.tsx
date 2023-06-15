/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { useModalHook } from '@harness/use-modal'
import { Dialog, Classes } from '@blueprintjs/core'
import type { LoginSettings } from 'services/cd-ng'
import PasswordExpirationForm from './views/PasswordExpirationForm'
import css from './usePasswordExpiration.module.scss'

interface Props {
  onSuccess: () => void
  loginSettings: LoginSettings
}
interface ModalReturn {
  openPasswordExpirationModal: (_editing: boolean) => void
  closePasswordExpirationModal: () => void
}

export const usePasswordExpirationModal = ({ onSuccess, loginSettings }: Props): ModalReturn => {
  const [editing, setEditing] = React.useState(false)
  const [showModal, hideModal] = useModalHook(
    () => (
      <Dialog isOpen enforceFocus={false} title="" onClose={hideModal} className={cx(css.dialog, Classes.DIALOG)}>
        <PasswordExpirationForm
          onSubmit={() => {
            onSuccess()
            hideModal()
          }}
          onCancel={() => {
            hideModal()
          }}
          loginSettings={loginSettings}
          editing={editing}
        />
      </Dialog>
    ),
    [loginSettings, editing]
  )

  const open = React.useCallback(
    (_editing: boolean) => {
      setEditing(_editing)
      showModal()
    },
    [showModal]
  )

  return {
    openPasswordExpirationModal: open,
    closePasswordExpirationModal: hideModal
  }
}
