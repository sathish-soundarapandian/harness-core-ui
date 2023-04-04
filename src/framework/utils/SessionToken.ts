/*
 * Copyright 2020 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { get } from 'lodash-es'
import SecureStorage from './SecureStorage'
import { parseJwtToken } from './SessionUtils'

export enum TokenTimings {
  Expiration = 'exp',
  Creation = 'iat'
}

export default {
  getToken: (): string => SecureStorage.get<string>('token') || '',
  username: (): string => SecureStorage.get<string>('username') || '',
  accountId: (): string => SecureStorage.get<string>('acctId') || '',
  getLastTokenSetTime: (): number | undefined => SecureStorage.get<number>('lastTokenSetTime'),
  getLastTokenTimings: (kindOfTimings: TokenTimings): number => {
    const token = parseJwtToken(SecureStorage.get<string>('token') || '')
    return get(token, kindOfTimings, 0) * 1000 // to make value in milliseconds since Date.now() gives time in milliseconds to be consisent for further calculations converting it to milliseconds
  }
}
