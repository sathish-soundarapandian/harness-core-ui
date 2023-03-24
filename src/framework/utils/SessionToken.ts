/*
 * Copyright 2020 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { defaultTo } from 'lodash'
import SecureStorage from './SecureStorage'
import { parseJwtToken } from './SessionUtils'

export default {
  getToken: (): string => SecureStorage.get<string>('token') || '',
  username: (): string => SecureStorage.get<string>('username') || '',
  accountId: (): string => SecureStorage.get<string>('acctId') || '',
  getLastTokenSetTime: (): number | undefined => SecureStorage.get<number>('lastTokenSetTime'),
  getLastTokenExpiryTime: (): number | undefined => {
    const val = defaultTo(parseJwtToken(SecureStorage.get<string>('token') || '').exp, undefined)
    return val ? val * 1000 : val
  },
  getLastTokenIssuedTime: (): number | undefined => {
    const val = defaultTo(parseJwtToken(SecureStorage.get<string>('token') || '').iat, undefined)
    return val ? val * 1000 : val
  }
}
