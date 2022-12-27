/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { FileStoreNodeDTO, FileStoreContextState } from '@filestore/components/FileStoreContext/FileStoreContext'
import type { NGTag } from 'services/cd-ng'

export enum FileStoreNodeTypes {
  FILE = 'FILE',
  FOLDER = 'FOLDER'
}

export enum FileUsage {
  MANIFEST_FILE = 'MANIFEST_FILE',
  CONFIG = 'CONFIG',
  SCRIPT = 'SCRIPT'
}

export enum FILE_VIEW_TAB {
  DETAILS = 'details',
  REFERENCED_BY = 'referencedBy',
  ACTIVITY_LOG = 'activityLog'
}

export interface NewFolderDTO {
  name: string
  identifier: string
  type: FileStoreNodeTypes | string
}

export interface NewFileDTO extends NewFolderDTO {
  fileUsage: FileUsage | string | null
  description?: string
  tags?: NGTag[]
  content?: string
}

export type NewFileFormDTO = Omit<NewFileDTO, 'type'>

export enum FileStoreRoot {
  Root
}

export type StoreNodeType = 'FILE' | 'FOLDER'

export interface NewNodeConfig {
  parentIdentifier: string
}

export interface NewNodeModal extends NewNodeConfig {
  type: FileStoreNodeTypes
  tempNode?: FileStoreNodeDTO | undefined
  editMode?: boolean
  currentNode?: FileStoreNodeDTO
  fileStoreContext?: FileStoreContextState
  notCurrentNode?: boolean
}

export interface NodeParamsDTO {
  identifier: string
  name: string
  type: FileStoreNodeTypes
  parentIdentifier: string
  children: FileStoreNodeDTO[] | any[] | undefined
}

export enum SORT_TYPE {
  ALPHABETICAL = 'ALPHABETICAL',
  ALPHABETICAL_DESC = 'ALPHABETICAL_DESC',
  LAST_UPDATED = 'LAST_UPDATED',
  LAST_UPDATED_DESC = 'LAST_UPDATED_DESC',
  ALPHABETICAL_FILE_TYPE = 'ALPHABETICAL_FILE_TYPE',
  ALPHABETICAL_FOLDER_TYPE = 'ALPHABETICAL_FOLDER_TYPE'
}

export type SortType = SORT_TYPE | undefined | ''

export interface NodeSortDTO {
  identifier: string
  sortType: SortType
}
