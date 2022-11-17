/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Free Trial 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/05/PolyForm-Free-Trial-1.0.0.txt.
 */

import React, { useCallback, useState } from 'react'
import { Dialog } from '@harness/uicore'
import { useModalHook } from '@harness/use-modal'
import { String } from 'framework/strings'
import type { Role } from 'services/rbac'
import RoleForm from './views/RoleForm'

export interface UseRoleModalProps {
  onSuccess: (role: Role) => void
  onCloseModal?: () => void
}

export interface UseRoleModalReturn {
  openRoleModal: (role?: Role) => void
  closeRoleModal: () => void
}

export const useRoleModal = ({ onSuccess }: UseRoleModalProps): UseRoleModalReturn => {
  const [roleData, setRoleData] = useState<Role>()
  const [showModal, hideModal] = useModalHook(
    () => (
      <Dialog
        isOpen={true}
        title={roleData ? <String stringID="editRole" /> : <String stringID="newRole" />}
        enforceFocus={false}
        onClose={hideModal}
      >
        <RoleForm
          data={roleData}
          isEdit={!!roleData}
          onSubmit={role => {
            onSuccess(role)
            hideModal()
          }}
          onCancel={hideModal}
        />
      </Dialog>
    ),
    [roleData, onSuccess]
  )
  const open = useCallback(
    (_role?: Role) => {
      setRoleData(_role)
      showModal()
    },
    [showModal]
  )

  return {
    openRoleModal: (role?: Role) => open(role),
    closeRoleModal: hideModal
  }
}
