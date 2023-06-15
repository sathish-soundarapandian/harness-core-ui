/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export enum CredentialTypes {
  KEY_REFERENCE = 'KeyReference',
  KEY_PATH = 'KeyPath',
  PASSWORD = 'Password'
}

export enum AuthScheme {
  SSH = 'SSH',
  KERBEROS = 'Kerberos'
}

export enum SecretType {
  SECRET_FILE = 'SecretFile',
  SECRET_TEXT = 'SecretText'
}

export enum TgtGenerationMethod {
  KEY_TAB_FILE_PATH = 'KeyTabFilePath',
  PASSWORD = 'Password',
  NONE = 'None'
}
