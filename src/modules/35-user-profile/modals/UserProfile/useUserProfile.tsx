/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useState } from 'react'
import { Button, ButtonVariation } from '@harness/uicore'
import { useModalHook } from '@harness/use-modal'
import { Dialog, Classes } from '@blueprintjs/core'
import cx from 'classnames'
import type { UserInfo } from 'services/cd-ng'
import EditUserProfile from './views/EditUserProfile'
import css from './useUserProfile.module.scss'

export interface UseUserProfileProps {
  onSuccess?: () => void
  onCloseModal?: () => void
}

export interface UseUserProfileReturn {
  openUserProfile: (user: UserInfo) => void
  closeUserProfile: () => void
}

export const useUserProfile = ({ onSuccess }: UseUserProfileProps): UseUserProfileReturn => {
  const [user, setUser] = useState<UserInfo>()
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
        {user && (
          <EditUserProfile
            user={user}
            onSubmit={() => {
              onSuccess?.()
              hideModal()
            }}
            onClose={hideModal}
          />
        )}

        <Button
          variation={ButtonVariation.ICON}
          icon="cross"
          iconProps={{ size: 18 }}
          onClick={() => {
            hideModal()
          }}
          className={css.crossIcon}
        />
      </Dialog>
    ),
    [user]
  )

  const open = useCallback(
    (_user: UserInfo) => {
      setUser(_user)
      showModal()
    },
    [showModal]
  )

  return {
    openUserProfile: (_user: UserInfo) => open(_user),
    closeUserProfile: hideModal
  }
}
