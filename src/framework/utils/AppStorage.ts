/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
/* eslint-disable @typescript-eslint/explicit-function-return-type */
// ignoring ts and eslint issues because this is a legacy file

////////////////////////////////////////////////////////////////////////
// THIS FILE IS A LEGACY - DO NOT USE IT DIRECTLY OR EXTEND ITS USAGE //
////////////////////////////////////////////////////////////////////////

import * as SecureStorage from 'secure-web-storage'
import { PREFERENCES_TOP_LEVEL_KEY } from 'framework/PreferenceStore/PreferenceStoreContext'

const SecureStorageConstructor = SecureStorage.default
const keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='

const buildLoginUrlFrom401Response = () => {
  const { href } = window.location
  const prefix = window.HARNESS_ENABLE_NG_AUTH_UI ? '/auth/#/signin?returnUrl=' : '#/login?returnUrl='
  return href.includes(prefix) ? href : prefix + encodeURIComponent(href)
}

function encode64(input) {
  input = escape(input)
  let output = ''
  let chr1,
    chr2,
    chr3 = ''
  let enc1,
    enc2,
    enc3,
    enc4 = ''
  let i = 0

  do {
    chr1 = input.charCodeAt(i++)
    chr2 = input.charCodeAt(i++)
    chr3 = input.charCodeAt(i++)

    enc1 = chr1 >> 2
    enc2 = ((chr1 & 3) << 4) | (chr2 >> 4)
    enc3 = ((chr2 & 15) << 2) | (chr3 >> 6)
    enc4 = chr3 & 63

    if (isNaN(chr2)) {
      enc3 = enc4 = 64
    } else if (isNaN(chr3)) {
      enc4 = 64
    }

    output = output + keyStr.charAt(enc1) + keyStr.charAt(enc2) + keyStr.charAt(enc3) + keyStr.charAt(enc4)
    chr1 = chr2 = chr3 = ''
    enc1 = enc2 = enc3 = enc4 = ''
  } while (i < input.length)

  return output
}

function decode64(input) {
  let output = ''
  let chr1,
    chr2,
    chr3 = ''
  let enc1,
    enc2,
    enc3,
    enc4 = ''
  let i = 0

  // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
  const base64test = /[^A-Za-z0-9+/=]/g
  input = input.replace(base64test, '')

  do {
    enc1 = keyStr.indexOf(input.charAt(i++))
    enc2 = keyStr.indexOf(input.charAt(i++))
    enc3 = keyStr.indexOf(input.charAt(i++))
    enc4 = keyStr.indexOf(input.charAt(i++))

    chr1 = (enc1 << 2) | (enc2 >> 4)
    chr2 = ((enc2 & 15) << 4) | (enc3 >> 2)
    chr3 = ((enc3 & 3) << 6) | enc4

    output = output + String.fromCharCode(chr1)

    if (enc3 !== 64) {
      output = output + String.fromCharCode(chr2)
    }
    if (enc4 !== 64) {
      output = output + String.fromCharCode(chr3)
    }

    chr1 = chr2 = chr3 = ''
    enc1 = enc2 = enc3 = enc4 = ''
  } while (i < input.length)

  return unescape(output)
}

const secureStorage = new SecureStorageConstructor(localStorage, {
  hash: function hash(key) {
    return key
  },
  encrypt: function encrypt(data) {
    return encode64(data)
  },
  decrypt: function decrypt(data) {
    return decode64(data)
  }
})

export default class AppStorage {
  static set(name, value) {
    if (value && name !== 'DataStore_apps') {
      secureStorage.setItem(name, value)
    }
    if (value && name === 'DataStore_apps') {
      localStorage.setItem(name, value)
    }
  }

  static get(name) {
    try {
      return secureStorage.getItem(name)
    } catch (event) {
      window.location = buildLoginUrlFrom401Response()
    }
  }

  static getAll() {
    const _obj = {}

    for (let i = 0, len = secureStorage.length; i < len; ++i) {
      const key = secureStorage.key(i)
      _obj.key = AppStorage.get(key)
    }

    return _obj
  }

  static has(name) {
    return AppStorage.get(name) ? true : false
  }

  static remove(name) {
    if (name !== 'DataStore_apps') {
      secureStorage.removeItem(name)
    } else {
      localStorage.removeItem(name)
    }
  }

  static cleanupOnAccountSwitch() {
    // clear AppStorage, only keep important fields:
    const storage = {
      token: AppStorage.get('token'),
      username: AppStorage.get('username') || '',
      email: AppStorage.get('email') || ''
    }

    AppStorage.clear()

    Object.keys(storage).forEach(key => {
      AppStorage.set(key, storage[key])
    })
  }

  static clear() {
    // clear localStorage, except fields to persist across user-sessions:
    const storage = {
      [PREFERENCES_TOP_LEVEL_KEY]: localStorage.getItem(PREFERENCES_TOP_LEVEL_KEY) || ''
    }

    secureStorage.clear()
    localStorage.clear()

    Object.keys(storage).forEach(key => {
      localStorage.setItem(key, storage[key])
    })
  }

  static decode64 = decode64
}
