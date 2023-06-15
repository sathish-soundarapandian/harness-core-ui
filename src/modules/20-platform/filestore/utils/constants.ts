/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */
import { SORT_TYPE } from '@filestore/interfaces/FileStore'

export const FILE_STORE_ROOT = 'Root'
export const SEARCH_FILES = 'SEARCH'

export enum ExtensionType {
  YAML = 'yaml',
  JSON = 'json',
  TEXT = 'txt',
  BASH = 'sh',
  POWER_SHELL = 'ps',
  YML = 'yml',
  TPL = 'tpl',
  PY = 'py'
}

export enum LanguageType {
  YAML = 'yaml',
  JSON = 'json',
  TEXT = 'plaintext',
  BASH = 'shell',
  POWER_SHELL = 'powershell',
  YML = 'yaml',
  TPL = 'tpl'
}

export enum FSErrosType {
  UNSUPPORTED_FORMAT = 'UNSUPPORTED_FORMAT',
  FILE_USAGE = 'FILE_USAGE',
  DELETED_NODE = 'DELETED_NODE'
}

export enum FileStoreActionTypes {
  CREATE_NODE = 'CREATE_NODE',
  DELETE_NODE = 'DELETE_NODE',
  UPDATE_NODE = 'UPDATE_NODE',
  UPLOAD_NODE = 'UPLOAD_NODE',
  SORT_NODE = 'SORT_NODE'
}

export enum SELECT_FILES_TYPE {
  FILE_STORE = 'fileStore',
  ENCRYPTED = 'encrypted'
}

export const defaultSortItems = [
  SORT_TYPE.ALPHABETICAL,
  SORT_TYPE.ALPHABETICAL_DESC,
  SORT_TYPE.LAST_UPDATED,
  SORT_TYPE.LAST_UPDATED_DESC,
  SORT_TYPE.ALPHABETICAL_FILE_TYPE,
  SORT_TYPE.ALPHABETICAL_FOLDER_TYPE
]
