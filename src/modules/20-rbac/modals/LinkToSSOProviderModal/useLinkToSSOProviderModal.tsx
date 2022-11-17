/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Free Trial 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/05/PolyForm-Free-Trial-1.0.0.txt.
 */

import React, { useCallback, useState } from 'react'
import { Button } from '@harness/uicore'
import { useModalHook } from '@harness/use-modal'
import { Dialog, Classes } from '@blueprintjs/core'
import cx from 'classnames'

import type { UserGroupDTO } from 'services/cd-ng'
import LinkToSSOProviderForm from '@rbac/modals/LinkToSSOProviderModal/views/LinkToSSOProviderForm'
import UnlinkSSOProviderForm from '@rbac/modals/LinkToSSOProviderModal/views/UnlinkSSOProviderForm'
import css from './useLinkToSSOProviderModal.module.scss'

export interface UseLinkToSSOProviderModalProps {
  onSuccess: () => void
  onCloseModal?: () => void
}

export interface UseLinkToSSOProviderModalReturn {
  openLinkToSSOProviderModal: (userGroup: UserGroupDTO) => void
  closeLinkToSSOProviderModal: () => void
}

export const useLinkToSSOProviderModal = ({
  onSuccess
}: UseLinkToSSOProviderModalProps): UseLinkToSSOProviderModalReturn => {
  const [userGroupData, setUserGroupData] = useState<UserGroupDTO>({} as UserGroupDTO)
  const [showModal, hideModal] = useModalHook(
    () => (
      <Dialog
        isOpen={true}
        enforceFocus={false}
        onClose={() => {
          hideModal()
        }}
        className={cx(css.dialog, Classes.DIALOG)}
      >
        {userGroupData.ssoLinked ? (
          <UnlinkSSOProviderForm
            userGroupData={userGroupData}
            onSubmit={() => {
              onSuccess()
              hideModal()
            }}
          />
        ) : (
          <LinkToSSOProviderForm
            userGroupData={userGroupData}
            onSubmit={() => {
              onSuccess()
              hideModal()
            }}
          />
        )}

        <Button
          minimal
          icon="cross"
          iconProps={{ size: 18 }}
          onClick={() => {
            hideModal()
          }}
          className={css.crossIcon}
        />
      </Dialog>
    ),
    [userGroupData]
  )
  const open = useCallback(
    (_userGroup: UserGroupDTO) => {
      setUserGroupData(_userGroup)
      showModal()
    },
    [showModal]
  )

  return {
    openLinkToSSOProviderModal: (userGroup: UserGroupDTO) => open(userGroup),
    closeLinkToSSOProviderModal: hideModal
  }
}
