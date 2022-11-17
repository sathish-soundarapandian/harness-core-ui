/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useState } from 'react'
import { Dialog, Button, Layout, Text, ButtonVariation, Heading } from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import { useModalHook } from '@harness/use-modal'
import type { IDialogProps } from '@blueprintjs/core'
import { useStrings } from 'framework/strings'
import TokenDelegatesList from './TokenDelegatesList'

import css from '../DelegateTokens.module.scss'

export interface MoreTokenInfoModalProps {
  onSuccess?: () => void
  onUserAdded?: () => void
}

export interface MoreTokenInfoModalReturn {
  openMoreTokenInfoModal: (token: string) => void
  closeMoreTokenInfoModal: () => void
}

export const useMoreTokenInfoModalModal = ({ onSuccess }: MoreTokenInfoModalProps): MoreTokenInfoModalReturn => {
  const { getString } = useStrings()
  const [token, setToken] = useState('')

  const modalProps: IDialogProps = {
    isOpen: true,
    title: (
      <>
        <Heading level={3} font={{ variation: FontVariation.H3 }}>
          {getString('delegates.tokens.moreInfoTitle', { token })}
        </Heading>
        <Text margin={{ top: 'small' }}>{getString('delegates.tokens.moreInfoSubtitle')}</Text>
      </>
    ),
    enforceFocus: false,
    style: {
      width: 755,
      height: 575
    }
  }

  const [showModal, hideModal] = useModalHook(
    () => (
      <Dialog onClose={hideModal} {...modalProps}>
        <Layout.Vertical className={css.addTokenModalContainer}>
          <TokenDelegatesList tokenName={token} />
          <Layout.Horizontal className={css.moreInfoActionsContainer}>
            <Button variation={ButtonVariation.PRIMARY} onClick={hideModal} intent="primary">
              {getString('close')}
            </Button>
          </Layout.Horizontal>
        </Layout.Vertical>
      </Dialog>
    ),
    [onSuccess, token]
  )
  const open = useCallback(
    (tokenName: string) => {
      setToken(tokenName)
      showModal()
    },
    [showModal]
  )

  return {
    openMoreTokenInfoModal: open,
    closeMoreTokenInfoModal: hideModal
  }
}
