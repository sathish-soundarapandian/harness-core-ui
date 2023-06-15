/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import { pick } from 'lodash-es'
import type { SelectOption } from '@harness/uicore'
import SecretReference, { SecretRef } from '@secrets/components/SecretReference/SecretReference'
import type { SecretMultiSelectProps } from '@secrets/utils/SecretField'
import { getReference } from '@common/utils/utils'
import type {
  SecretResponseWrapper,
  ResponsePageSecretResponseWrapper,
  ConnectorInfoDTO,
  SecretDTOV2
} from 'services/cd-ng'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import type { ScopedObjectDTO } from '@common/components/EntityReference/EntityReference'
import type { ScopeAndIdentifier } from '@common/components/MultiSelectEntityReference/MultiSelectEntityReference'
import css from './CreateOrSelectSecret.module.scss'

export interface SecretReference {
  name: string
  identifier: string
  type?: SecretDTOV2['type']
  orgIdentifier?: string
  projectIdentifier?: string
  referenceString: string
}

export interface CreateOrSelectSecretProps extends SecretMultiSelectProps {
  type?: SecretResponseWrapper['secret']['type']
  onSuccess: (secret: SecretReference) => void
  secretsListMockData?: ResponsePageSecretResponseWrapper
  connectorTypeContext?: ConnectorInfoDTO['type']
  onCancel?: () => void
  handleInlineSSHSecretCreation: (record?: SecretRef) => void
  handleInlineWinRmSecretCreation: (record?: SecretRef) => void
  secretType?: SelectOption
  setSecretType?: (val: SelectOption) => void
  scope?: ScopedObjectDTO
  selectedSecret?: string
  identifiersFilter?: ScopeAndIdentifier[]
}

const CreateOrSelectSecret: React.FC<CreateOrSelectSecretProps> = ({
  type,
  onSuccess,
  secretsListMockData,
  connectorTypeContext,
  onCancel,
  handleInlineSSHSecretCreation,
  handleInlineWinRmSecretCreation,
  secretType,
  setSecretType,
  scope,
  selectedSecret,
  selectedSecrets = [],
  isMultiSelect = false,
  onMultiSelect,
  identifiersFilter
}) => {
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  return (
    <section className={css.main}>
      <SecretReference
        type={type}
        onCancel={onCancel}
        onSelect={data => {
          onSuccess({
            ...pick(data, ['name', 'identifier', 'orgIdentifier', 'projectIdentifier', 'type']),
            referenceString: getReference(data.scope, data.identifier) as string
          })
        }}
        onMultiSelect={onMultiSelect}
        selectedSecrets={selectedSecrets}
        isMultiSelect={isMultiSelect}
        accountIdentifier={accountId}
        orgIdentifier={scope ? scope.orgIdentifier : orgIdentifier}
        projectIdentifier={scope ? scope.projectIdentifier : projectIdentifier}
        mock={secretsListMockData}
        connectorTypeContext={connectorTypeContext}
        handleInlineSSHSecretCreation={handleInlineSSHSecretCreation}
        handleInlineWinRmSecretCreation={handleInlineWinRmSecretCreation}
        secretType={secretType}
        setSecretType={setSecretType}
        selectedSecret={selectedSecret}
        identifiersFilter={identifiersFilter}
      />
    </section>
  )
}

export default CreateOrSelectSecret
