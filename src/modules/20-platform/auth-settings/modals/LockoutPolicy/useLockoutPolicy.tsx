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
import LockoutPolicyForm from './views/LockoutPolicyForm'
import css from './useLockoutPolicy.module.scss'

interface Props {
  onSuccess: () => void
  loginSettings: LoginSettings
}
interface ModalReturn {
  openLockoutPolicyModal: (_editing: boolean) => void
  closeLockoutPolicyModal: () => void
}

export const useLockoutPolicyModal = ({ onSuccess, loginSettings }: Props): ModalReturn => {
  const [editing, setEditing] = React.useState(false)
  const [showModal, hideModal] = useModalHook(
    () => (
      <Dialog isOpen enforceFocus={false} title="" onClose={hideModal} className={cx(css.dialog, Classes.DIALOG)}>
        <LockoutPolicyForm
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
    openLockoutPolicyModal: open,
    closeLockoutPolicyModal: hideModal
  }
}
