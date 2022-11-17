/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Free Trial 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/05/PolyForm-Free-Trial-1.0.0.txt.
 */

import React, { useCallback, useState } from 'react'
import { Dialog } from '@harness/uicore'
import { useModalHook } from '@harness/use-modal'
import type { DialogProps } from '@harness/uicore/dist/components/Dialog/Dialog'
import EnableTwoFactorAuthView from '@user-profile/modals/EnableTwoFactorAuth/views/EnableTwoFactorView'
import { useStrings } from 'framework/strings'

export interface UseEnableTwoFactorAuthModalReturn {
  openEnableTwoFactorAuthModal: (isReset: boolean) => void
  closeEnableTwoFactorAuthModal: () => void
}

export const useEnableTwoFactorAuthModal = (): UseEnableTwoFactorAuthModalReturn => {
  const [isReset, setIsReset] = useState<boolean>(false)
  const { getString } = useStrings()
  const modalProps: DialogProps = {
    enforceFocus: false,
    isOpen: true,
    title: isReset ? getString('userProfile.twoFactor.resetTitle') : getString('userProfile.twoFactor.enableTitle'),
    style: {
      width: 750,
      overflow: 'hidden'
    }
  }
  const [showModal, hideModal] = useModalHook(
    () => (
      <Dialog onClose={hideModal} {...modalProps}>
        <EnableTwoFactorAuthView onEnable={hideModal} onCancel={hideModal} isReset={isReset} />
      </Dialog>
    ),
    [isReset]
  )

  const open = useCallback(
    (_isReset: boolean) => {
      setIsReset(_isReset)
      showModal()
    },
    [showModal]
  )
  return {
    openEnableTwoFactorAuthModal: (_isReset: boolean) => open(_isReset),
    closeEnableTwoFactorAuthModal: hideModal
  }
}
