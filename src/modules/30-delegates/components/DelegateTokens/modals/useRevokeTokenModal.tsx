/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Dialog, Button, Layout, Text, ButtonVariation, Heading } from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import { useModalHook } from '@harness/use-modal'
import type { IDialogProps } from '@blueprintjs/core'
import { useStrings } from 'framework/strings'
import { revokeDelegateTokenPromise } from 'services/cd-ng'
import TokenDelegatesList from './TokenDelegatesList'

import css from '../DelegateTokens.module.scss'

export interface RevokeTokenModalProps {
  onSuccess?: () => void
}

export interface RevokeTokenModalReturn {
  openRevokeTokenModal: (token: string) => void
  closeRevokeTokenModal: () => void
}

export const useRevokeTokenModal = ({ onSuccess }: RevokeTokenModalProps): RevokeTokenModalReturn => {
  const { getString } = useStrings()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<Record<string, string>>()
  const [tokenName, setTokenName] = useState('')

  const modalProps: IDialogProps = {
    isOpen: true,
    title: (
      <>
        <Heading level={3} font={{ variation: FontVariation.H3 }}>
          {getString('delegates.tokens.revokeToken')}
        </Heading>
        <Text margin={{ top: 'small' }}>{getString('delegates.tokens.revokeTokenSubtitle')}</Text>
      </>
    ),
    enforceFocus: false,
    style: {
      width: 755,
      height: 575
    }
  }

  const onRevoke = useCallback(
    async hideModalFn => {
      await revokeDelegateTokenPromise({
        queryParams: {
          accountIdentifier: accountId,
          projectIdentifier,
          orgIdentifier,
          tokenName
        }
      } as any)
      onSuccess?.()
      hideModalFn()
    },
    [tokenName]
  )

  const [showModal, hideModal] = useModalHook(
    () => (
      <Dialog onClose={hideModal} {...modalProps}>
        <Layout.Vertical className={css.addTokenModalContainer}>
          <TokenDelegatesList tokenName={tokenName} />
          <Layout.Horizontal spacing="small">
            <Button intent="danger" variation={ButtonVariation.PRIMARY} onClick={() => onRevoke(hideModal)}>
              {getString('delegates.tokens.revoke')}
            </Button>
            <Button variation={ButtonVariation.TERTIARY} onClick={hideModal}>
              {getString('cancel')}
            </Button>
          </Layout.Horizontal>
        </Layout.Vertical>
      </Dialog>
    ),
    [onSuccess, tokenName]
  )
  const open = useCallback(
    (token: string) => {
      setTokenName(token)
      showModal()
    },
    [showModal, setTokenName]
  )

  return {
    openRevokeTokenModal: open,
    closeRevokeTokenModal: hideModal
  }
}
