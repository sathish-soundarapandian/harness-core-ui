/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { ScopeAndIdentifier } from '@common/components/MultiSelectEntityReference/MultiSelectEntityReference'
import { Scope } from '@common/interfaces/SecretsInterface'
import { getSecretV2Promise, GetSecretV2QueryParams } from 'services/cd-ng'

export interface SecretReferenceInterface {
  identifier: string
  name: string
  referenceString: string
  accountIdentifier: string
  orgIdentifier?: string
  projectIdentifier?: string
}

export const setSecretField = async (
  secretString: string,
  scopeQueryParams: GetSecretV2QueryParams
): Promise<SecretReferenceInterface | void> => {
  if (!secretString) {
    return undefined
  } else {
    const secretScope = secretString?.indexOf('.') < 0 ? Scope.PROJECT : secretString?.split('.')[0]

    switch (secretScope) {
      case Scope.ACCOUNT:
        delete scopeQueryParams.orgIdentifier
        delete scopeQueryParams.projectIdentifier
        break
      case Scope.ORG:
        delete scopeQueryParams.projectIdentifier
    }

    const identifier = secretString.indexOf('.') < 0 ? secretString : secretString.split('.')[1]
    const response = await getSecretV2Promise({
      identifier,
      queryParams: scopeQueryParams
    })

    return {
      identifier,
      name: response.data?.secret.name || secretString.split('.')[1],
      referenceString: secretString,
      ...scopeQueryParams
    }
  }
}

export interface SecretMultiSelectProps {
  selectedSecrets?: ScopeAndIdentifier[]
  isMultiSelect?: boolean
  onMultiSelect?: (selected: ScopeAndIdentifier[]) => void
}
