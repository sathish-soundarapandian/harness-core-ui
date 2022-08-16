/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useModalHook } from '@harness/use-modal'
import type { SelectOption } from '@wings-software/uicore'
import { Dialog } from '@blueprintjs/core'
import { pick } from 'lodash-es'
import cx from 'classnames'
import { useStrings } from 'framework/strings'
import { getReference } from '@common/utils/utils'
import type { SecretReference } from '@secrets/components/CreateOrSelectSecret/CreateOrSelectSecret'
import CreateOrSelectSecret from '@secrets/components/CreateOrSelectSecret/CreateOrSelectSecret'
import { SecretTypeEnum } from '@secrets/components/SecretReference/SecretReference'
import type { ConnectorInfoDTO, ResponsePageSecretResponseWrapper, SecretResponseWrapper } from 'services/cd-ng'
import { ReferenceSelectDialogTitle } from '@common/components/ReferenceSelect/ReferenceSelect'

import { getScopeFromDTO } from '@common/components/EntityReference/EntityReference'
import type { SecretFormData } from '@secrets/components/CreateUpdateSecret/CreateUpdateSecret'
import useCreateUpdateSecretModal from '../CreateSecretModal/useCreateUpdateSecretModal'
import css from './useCreateOrSelectSecretModal.module.scss'

export interface UseCreateOrSelectSecretModalProps {
  type?: SecretResponseWrapper['secret']['type']
  onSuccess?: (secret: SecretReference) => void
  secretsListMockData?: ResponsePageSecretResponseWrapper
  connectorTypeContext?: ConnectorInfoDTO['type']
  handleInlineSSHSecretCreation?: () => void
  handleInlineWinRmSecretCreation?: () => void
}

export interface UseCreateOrSelectSecretModalReturn {
  openCreateOrSelectSecretModal: () => void
  closeCreateOrSelectSecretModal: () => void
}

const useCreateOrSelectSecretModal = (
  props: UseCreateOrSelectSecretModalProps,
  inputs?: any[]
): UseCreateOrSelectSecretModalReturn => {
  const { getString } = useStrings()

  const secretTypeOptions: SelectOption[] = [
    {
      label: getString('secrets.secret.labelText'),
      value: 'SecretText'
    },
    {
      label: getString('secrets.secret.labelFile'),
      value: 'SecretFile'
    }
  ]

  const defaultSecretType = secretTypeOptions.findIndex(val => val.value === props.type)
  // defaultSecretType is -1 i.e. the type in props does not match the secretTypeOptions
  const [secretType, setSecretType] = React.useState<SelectOption>(
    secretTypeOptions[defaultSecretType === -1 ? 0 : defaultSecretType]
  )

  const inputDependencies = inputs?.length ? inputs.concat([secretType]) : [secretType]

  const { openCreateSecretModal } = useCreateUpdateSecretModal({
    onSuccess: data => {
      const secret = {
        ...data,
        scope: getScopeFromDTO<SecretFormData>(data)
      }
      /* istanbul ignore next */
      props.onSuccess?.({
        ...pick(secret, ['name', 'identifier', 'orgIdentifier', 'projectIdentifier', 'type']),
        referenceString: getReference(secret.scope, secret.identifier) as string
      })
      hideModal()
    }
  })

  const getLabelByType = (type: SecretTypeEnum): string => {
    switch (true) {
      case type === SecretTypeEnum.SSH_KEY:
        return getString('secrets.secret.newSSHCredential')
      case type === SecretTypeEnum.WINRM:
        return getString('secrets.secret.newWinRmCredential')
      case type === SecretTypeEnum.SECRET_TEXT:
      case secretType.value === SecretTypeEnum.SECRET_TEXT:
        return getString('secrets.secret.newSecretText')
      default:
        return getString('secrets.secret.newSecretFile')
    }
  }

  const [showModal, hideModal] = useModalHook(() => {
    return (
      <Dialog
        isOpen={true}
        enforceFocus={false}
        onClose={() => {
          hideModal()
        }}
        title={ReferenceSelectDialogTitle({
          componentName: getString('secretType'),
          createNewLabel: getLabelByType(props.type as SecretTypeEnum),
          createNewHandler: () => {
            if (props.type === SecretTypeEnum.SSH_KEY) {
              props.handleInlineSSHSecretCreation?.()
              hideModal()
            } else if (props.type === SecretTypeEnum.WINRM) {
              props.handleInlineWinRmSecretCreation?.()
              hideModal()
            } else {
              openCreateSecretModal(
                props.type === SecretTypeEnum.SECRET_TEXT || secretType.value === SecretTypeEnum.SECRET_TEXT
                  ? SecretTypeEnum.SECRET_TEXT
                  : SecretTypeEnum.SECRET_FILE
              )
            }
          }
        })}
        className={cx(css.createSelectSecret, css.dialog)}
      >
        <CreateOrSelectSecret
          {...props}
          onCancel={hideModal}
          onSuccess={data => {
            const secret = {
              ...pick(data, ['name', 'identifier', 'orgIdentifier', 'projectIdentifier', 'type']),
              referenceString: getReference(getScopeFromDTO(data), data.identifier) as string
            }
            /* istanbul ignore next */
            props.onSuccess?.(secret)
            hideModal()
          }}
          connectorTypeContext={props.connectorTypeContext}
          handleInlineSSHSecretCreation={() => {
            props.handleInlineSSHSecretCreation?.()
            hideModal()
          }}
          handleInlineWinRmSecretCreation={() => {
            props.handleInlineWinRmSecretCreation?.()
            hideModal()
          }}
          secretType={secretType}
          setSecretType={setSecretType}
        />
      </Dialog>
    )
  }, inputDependencies)

  return {
    openCreateOrSelectSecretModal: () => {
      showModal()
    },
    closeCreateOrSelectSecretModal: hideModal
  }
}

export default useCreateOrSelectSecretModal
