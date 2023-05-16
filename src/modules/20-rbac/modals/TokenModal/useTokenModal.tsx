/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useState } from 'react'
import { useModalHook } from '@harness/use-modal'
import { Dialog } from '@harness/uicore'
import type { TokenDTO } from 'services/cd-ng'
import type { StringKeys} from 'framework/strings';
import { String } from 'framework/strings'
import RotateTokenForm from '@rbac/modals/TokenModal/views/RotateTokenForm'
import EditTokenForm from '@rbac/modals/TokenModal/views/EditToken'
import CreateTokenForm from '@rbac/modals/TokenModal/views/CreateToken'
import css from './useTokenModal.module.scss'
export interface useTokenModalProps {
  onSuccess: () => void
  onCloseModal?: () => void
  apiKeyType?: TokenDTO['apiKeyType']
  parentIdentifier?: string
}

export interface useTokenModalReturn {
  openTokenModal: (apiKeyIdentifier: string, token?: TokenDTO, _isRotate?: boolean) => void
  closeTokenModal: () => void
}

export const useTokenModal = ({ onSuccess, apiKeyType, parentIdentifier }: useTokenModalProps): useTokenModalReturn => {
  const [apiKeyIdentifier, setApiKeyIdentifier] = useState<string>('')
  const [isRotate, setIsRotate] = useState<boolean>()
  const [tokenData, setTokenData] = useState<TokenDTO>()

  const getLabelKey = (): StringKeys => {
    if (isRotate) {
      return 'rbac.token.rotateLabel'
    } else if (tokenData) {
      return 'rbac.token.editLabel'
    } else {
      return 'rbac.token.createLabel'
    }
  }
  const [showModal, hideModal] = useModalHook(
    () => (
      <Dialog
        isOpen={true}
        enforceFocus={false}
        onClose={hideModal}
        className={css.modal}
        title={<String stringID={getLabelKey()} />}
      >
        {isRotate ? (
          <RotateTokenForm
            data={tokenData}
            apiKeyIdentifier={apiKeyIdentifier}
            onSubmit={onSuccess}
            onClose={hideModal}
          />
        ) : tokenData ? (
          <EditTokenForm
            data={tokenData}
            apiKeyIdentifier={apiKeyIdentifier}
            isEdit={true}
            apiKeyType={apiKeyType}
            parentIdentifier={parentIdentifier}
            onSubmit={onSuccess}
            onClose={hideModal}
          />
        ) : (
          <CreateTokenForm
            data={tokenData}
            apiKeyIdentifier={apiKeyIdentifier}
            isEdit={false}
            apiKeyType={apiKeyType}
            parentIdentifier={parentIdentifier}
            onSubmit={onSuccess}
            onClose={hideModal}
          />
        )}
      </Dialog>
    ),
    [tokenData, apiKeyIdentifier, isRotate, parentIdentifier]
  )
  const open = useCallback(
    (_apiKeyIdentifier: string, _token?: TokenDTO, _isRotate?: boolean) => {
      setApiKeyIdentifier(_apiKeyIdentifier)
      setTokenData(_token)
      setIsRotate(_isRotate)
      showModal()
    },
    [showModal]
  )

  return {
    openTokenModal: open,
    closeTokenModal: hideModal
  }
}
