/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { ValueType } from '@secrets/components/TextReference/TextReference'
import type { BaseCompFields } from '../CustomHealthHeadersAndParams.types'

export const StepParams: BaseCompFields['params'] = [
  {
    key: 'param1',
    value: {
      secretField: {
        referenceString: 'account.secret'
      },
      fieldType: ValueType.ENCRYPTED
    }
  },
  {
    key: 'param2',
    value: {
      secretField: {
        referenceString: 'account.secret2'
      },
      fieldType: ValueType.ENCRYPTED
    }
  }
]

export const StepHeaders: BaseCompFields['headers'] = [
  {
    key: 'header1',
    value: {
      textField: 'solo',
      fieldType: ValueType.TEXT
    }
  },
  {
    key: 'header2',
    value: {
      secretField: {
        referenceString: 'account.secret'
      },
      fieldType: ValueType.ENCRYPTED
    }
  }
]

export const SpecHeaders = [
  {
    key: 'header1',
    value: 'solo',
    valueEncrypted: false
  },
  {
    encryptedValueRef: 'account.secret',
    key: 'header2',
    valueEncrypted: true
  }
]

export const SpecParams = [
  {
    encryptedValueRef: 'account.secret',
    key: 'param1',
    valueEncrypted: true
  },
  {
    encryptedValueRef: 'account.secret2',
    key: 'param2',
    valueEncrypted: true
  }
]
