/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { useModalHook } from '@harness/use-modal'
import { Dialog } from '@blueprintjs/core'
import type { UserGroupDTO } from 'services/cd-ng'
import type { Scope } from '@common/interfaces/SecretsInterface'
import UserGroupsReference from '@common/components/UserGroupsReference/UserGroupsReference'
import type { ScopeAndIdentifier } from '@common/components/MultiSelectEntityReference/MultiSelectEntityReference'
import { ReferenceSelectDialogTitle } from '@common/components/ReferenceSelect/ReferenceSelect'
import { useUserGroupModal } from '@rbac/modals/UserGroupModal/useUserGroupModal'
import { useStrings } from 'framework/strings'
import css from './useSelectUserGroupsModal.module.scss'

export interface UseSelectUserGroupsModalProps {
  onSuccess?: (data: ScopeAndIdentifier[]) => void
  secretsListMockData?: UserGroupDTO[]
  onlyCurrentScope?: boolean
  disablePreSelectedItems?: boolean
  identifierFilter?: string[]
  scopeCountMap?: Map<Scope, string[]>
}

export interface UseSelectUserGroupsModalReturn {
  openSelectUserGroupsModal: (selectedUserGroups?: ScopeAndIdentifier[], scope?: Scope) => void
  closeSelectUserGroupsModal: () => void
}

const useSelectUserGroupsModal = (props: UseSelectUserGroupsModalProps): UseSelectUserGroupsModalReturn => {
  const [selectedUserGroups, setSelectedUserGroups] = useState<ScopeAndIdentifier[]>()
  const [scope, setScope] = useState<Scope>()
  const { getString } = useStrings()

  const { openUserGroupModal } = useUserGroupModal({
    onSuccess: data => {
      if (data) {
        props.onSuccess?.([data])
        hideModal()
      }
    }
  })

  const [showModal, hideModal] = useModalHook(
    () => (
      <Dialog
        isOpen={true}
        enforceFocus={false}
        onClose={() => {
          hideModal()
        }}
        title={
          <ReferenceSelectDialogTitle
            createNewLabel={getString('common.userGroup')}
            title={getString('common.selectUserGroups')}
            createNewHandler={() => {
              openUserGroupModal()
            }}
          />
        }
        className={css.dialog}
      >
        <UserGroupsReference
          {...props}
          scope={scope}
          onlyCurrentScope={props.onlyCurrentScope}
          userGroupsScopeAndUuid={selectedUserGroups}
          mock={props.secretsListMockData}
          onSelect={data => {
            props.onSuccess?.(data)
            hideModal()
          }}
        />
      </Dialog>
    ),
    [selectedUserGroups, scope]
  )

  return {
    openSelectUserGroupsModal: (_selectedUserGroups: ScopeAndIdentifier[] | undefined, _scope: Scope | undefined) => {
      setSelectedUserGroups(_selectedUserGroups)
      setScope(_scope)
      showModal()
    },
    closeSelectUserGroupsModal: hideModal
  }
}

export default useSelectUserGroupsModal
