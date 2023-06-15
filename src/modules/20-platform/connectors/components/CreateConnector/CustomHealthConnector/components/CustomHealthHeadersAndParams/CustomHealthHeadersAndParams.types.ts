/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { ValueType } from '@secrets/components/TextReference/TextReference'
import type { ConnectionConfigProps } from '../../../CommonCVConnector/constants'

export interface CustomHealthHeadersAndParamsProps extends ConnectionConfigProps {
  addRowButtonLabel: string
  nameOfObjectToUpdate: 'headers' | 'params'
}

export interface KeyValueEntity {
  key: string
}

export interface PlainEntity extends KeyValueEntity {
  value: {
    textField: string
    fieldType: ValueType.TEXT
  }
}

export interface EncryptedEntity extends KeyValueEntity {
  value: {
    fieldType: ValueType.ENCRYPTED
    secretField: {
      referenceString: string
    }
  }
}

export type BaseCompFields = {
  baseURL: string
  headers?: Array<PlainEntity | EncryptedEntity>
  params?: Array<PlainEntity | EncryptedEntity>
}
