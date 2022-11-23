/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { Button, Text } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { useModalHook } from '@harness/use-modal'
import { Dialog } from '@blueprintjs/core'

import type { SecretDTOV2, ConnectorInfoDTO } from 'services/cd-ng'

import CreateUpdateSecret, {
  SecretIdentifiers,
  SecretFormData
} from '@secrets/components/CreateUpdateSecret/CreateUpdateSecret'

import { useStrings } from 'framework/strings'
import css from './useCreateSecretModal.module.scss'

type SecretType = SecretDTOV2['type']

export interface UseCreateSecretModalProps {
  onSuccess?: ((data: SecretFormData) => void) | (() => void)
  connectorTypeContext?: ConnectorInfoDTO['type']
  privateSecret?: boolean
}

export interface UseCreateSecretModalReturn {
  openCreateSecretModal: (type: SecretType, secret?: SecretIdentifiers) => void
  closeCreateSecretModal: () => void
}

const useCreateUpdateSecretModal = (props: UseCreateSecretModalProps): UseCreateSecretModalReturn => {
  const [type, setType] = useState<SecretType>()
  const [secret, setSecret] = useState<SecretIdentifiers>()
  const handleSuccess = (data: SecretFormData) => {
    hideModal()
    props.onSuccess?.(data)
  }
  const { getString } = useStrings()
  const [showModal, hideModal] = useModalHook(
    () => (
      <Dialog
        isOpen={true}
        enforceFocus={false}
        onClose={() => {
          hideModal()
        }}
        className={css.dialog}
      >
        <Text font={{ size: 'medium' }} color={Color.BLACK} margin={{ bottom: 'large' }}>
          {secret?.identifier
            ? !type || type === 'SecretText'
              ? getString('secrets.secret.titleEditText')
              : getString('secrets.secret.titleEditFile')
            : type === 'SecretText'
            ? getString('secrets.secret.titleCreateText')
            : getString('secrets.secret.titleCreateFile')}
        </Text>
        <CreateUpdateSecret
          secret={secret}
          type={type}
          onSuccess={handleSuccess}
          connectorTypeContext={props.connectorTypeContext}
          privateSecret={props.privateSecret}
        />
        <Button minimal icon="cross" iconProps={{ size: 18 }} onClick={hideModal} className={css.crossIcon} />
      </Dialog>
    ),
    [type, secret]
  )

  return {
    openCreateSecretModal: (_type: SecretType | undefined, _secret: SecretIdentifiers | undefined) => {
      setType(_type)
      setSecret(_secret)
      showModal()
    },
    closeCreateSecretModal: hideModal
  }
}

export default useCreateUpdateSecretModal
