/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Color } from '@harness/design-system'
import type { IconName, MaybeElement } from '@blueprintjs/core'
import { Icon } from '@harness/uicore'
import React from 'react'
import { defaultTo, sortBy, reverse } from 'lodash-es'
import { Scope } from '@common/interfaces/SecretsInterface'
import type { StringsMap } from 'framework/strings/StringsContext'
import type { FileStoreNodeDTO } from 'services/cd-ng'
import type { Item as NodeMenuOptionItem } from '@filestore/common/NodeMenu/NodeMenuButton'
import type { FileStorePopoverItem } from '@filestore/common/FileStorePopover/FileStorePopover'
import type { ScopedObjectDTO } from '@filestore/common/useFileStoreScope/useFileStoreScope'
import { FileStoreNodeTypes, FileUsage, SORT_TYPE } from '@filestore/interfaces/FileStore'
import type { SortType } from '@filestore/interfaces/FileStore'

import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ResourceType } from '@rbac/interfaces/ResourceType'

import {
  ExtensionType,
  LanguageType,
  FSErrosType,
  FileStoreActionTypes,
  FILE_STORE_ROOT,
  SEARCH_FILES
} from './constants'

export const firstLetterToUpperCase = (value: string): string => `${value.charAt(0).toUpperCase()}${value.slice(1)}`

export const getFileUsageNameByType = (type: FileUsage): string => {
  switch (type) {
    case FileUsage.MANIFEST_FILE:
      return 'Manifest'
    case FileUsage.CONFIG:
      return 'Config'
    case FileUsage.SCRIPT:
      return 'Script'
    default:
      return ''
  }
}

export const getMimeTypeByName = (name: string): string => {
  const splitedFileName = name.split('.')
  if (splitedFileName.length <= 1) {
    return ExtensionType.TEXT
  }
  return splitedFileName[splitedFileName.length - 1].trim()
}

export const getLanguageType = (lang: string | undefined): string => {
  switch (lang) {
    case ExtensionType.YAML:
    case ExtensionType.YML:
      return LanguageType.YAML
    case LanguageType.JSON:
      return ExtensionType.JSON
    case ExtensionType.BASH:
      return LanguageType.BASH
    case ExtensionType.POWER_SHELL:
      return LanguageType.POWER_SHELL
    case ExtensionType.TEXT:
    case ExtensionType.TPL:
    case ExtensionType.PY:
      return LanguageType.TEXT
    default:
      return LanguageType.TEXT
  }
}

export const checkSupportedMime = (mime: ExtensionType): boolean => {
  return Object.values(ExtensionType).includes(mime)
}

export const getFSErrorByType = (type: FSErrosType): string => {
  switch (type) {
    case FSErrosType.UNSUPPORTED_FORMAT:
      return 'filestore.errors.cannotRender'
    case FSErrosType.FILE_USAGE:
      return 'filestore.errors.fileUsage'
    default:
      return ''
  }
}

export const existCachedNode = (
  tempNodes: FileStoreNodeDTO[],
  nodeIdentifier: string
): FileStoreNodeDTO | undefined => {
  return tempNodes.find((tempNode: FileStoreNodeDTO): boolean => tempNode.identifier === nodeIdentifier)
}

export type FileStorePopoverOptionItem = FileStorePopoverItem | '-'

export const getIconByActionType = (actionType: FileStoreActionTypes): IconName | MaybeElement => {
  const iconDefaults = {
    size: 16,
    padding: { right: 'small' },
    color: Color.GREY_700
  }

  switch (actionType) {
    case FileStoreActionTypes.UPDATE_NODE:
      return <Icon name="edit" {...iconDefaults} />
    case FileStoreActionTypes.UPLOAD_NODE:
      return 'upload'
    case FileStoreActionTypes.CREATE_NODE:
      return 'folder-new'
    case FileStoreActionTypes.DELETE_NODE:
      return <Icon name="main-trash" {...iconDefaults} />
    case FileStoreActionTypes.SORT_NODE:
      return <Icon name="sort" {...iconDefaults} />
    default:
      return null
  }
}

export const getPermissionsByActionType = (actionType: FileStoreActionTypes, identifier?: string) => {
  if (actionType === FileStoreActionTypes.DELETE_NODE) {
    return {
      permission: PermissionIdentifier.DELETE_FILE,
      resource: {
        resourceType: ResourceType.FILE,
        resourceIdentifier: defaultTo(identifier, '')
      }
    }
  } else {
    return {
      permission: PermissionIdentifier.EDIT_FILE,
      resource: {
        resourceType: ResourceType.FILE,
        resourceIdentifier: defaultTo(identifier, '')
      }
    }
  }
}

export const getMenuOptionItems = (
  optionItems: FileStorePopoverOptionItem[],
  type?: FileStoreNodeTypes
): NodeMenuOptionItem[] => {
  const { DELETE_NODE, CREATE_NODE, UPDATE_NODE, UPLOAD_NODE, SORT_NODE } = FileStoreActionTypes
  const ACTIONS =
    type === FileStoreNodeTypes.FOLDER
      ? [DELETE_NODE, CREATE_NODE, UPDATE_NODE, UPLOAD_NODE, '-', SORT_NODE]
      : [DELETE_NODE, UPDATE_NODE]
  const FILTERED_ACTIONS = optionItems.filter((optionItem: FileStorePopoverOptionItem): boolean => {
    if (optionItem === '-') {
      return true
    }
    return ACTIONS.includes(optionItem.actionType)
  })

  return FILTERED_ACTIONS.map((optionItem: FileStorePopoverOptionItem) => {
    if (optionItem === '-') {
      return optionItem
    }
    return {
      actionType: optionItem.actionType,
      text: optionItem.label,
      onClick: optionItem.onClick,
      identifier: optionItem.identifier
    }
  })
}

interface ScopedObjectDTOParam {
  accountId: string
  orgIdentifier?: string
  projectIdentifier?: string
}

export const getParamsByScope = (scope: string, params: ScopedObjectDTOParam): ScopedObjectDTO => {
  const { accountId, orgIdentifier, projectIdentifier } = params

  switch (scope) {
    case Scope.ACCOUNT:
      return {
        accountIdentifier: accountId
      }
    case Scope.ORG:
      return {
        accountIdentifier: accountId,
        orgIdentifier
      }
    default:
      return {
        accountIdentifier: accountId,
        orgIdentifier,
        projectIdentifier
      }
  }
}

export const prepareFileValues = (values: any, currentNode: any, notCurrentNode: any) => {
  const data = new FormData()

  Object.keys(values).forEach(prop => {
    if (prop === 'fileUsage' && !values.fileUsage) return
    if (prop === 'tags') {
      data.append(
        prop,
        JSON.stringify(
          Object.keys(values[prop]).map(key => ({
            key,
            value: values[prop][key]
          }))
        )
      )
      return
    }
    if (notCurrentNode && prop === 'content') return
    if (!notCurrentNode && prop === 'content') {
      const blobContent = new Blob([values[prop]], { type: 'plain/text' })
      data.append('content', blobContent)
    }
    data.append(prop, values[prop])
  })
  data.append('type', FileStoreNodeTypes.FILE)

  if (currentNode?.parentIdentifier && currentNode.type !== FileStoreNodeTypes.FOLDER) {
    data.append('parentIdentifier', currentNode.parentIdentifier)
  } else {
    if (currentNode.identifier === SEARCH_FILES) {
      data.append('parentIdentifier', FILE_STORE_ROOT)
    } else {
      data.append('parentIdentifier', currentNode.identifier)
    }
  }

  data.append('mimeType', getMimeTypeByName(values.name))
  return data
}

export const getSortIconByActionType = (sortType: SortType): IconName | MaybeElement => {
  const iconDefaults = {
    size: 16,
    padding: { right: 'small' },
    color: Color.GREY_700
  }

  switch (sortType) {
    case SORT_TYPE.ALPHABETICAL:
      return <Icon name="sort-alphabetical" {...iconDefaults} />
    case SORT_TYPE.ALPHABETICAL_DESC:
      return <Icon name="sort-alphabetical-desc" {...iconDefaults} />
    case SORT_TYPE.LAST_UPDATED:
      return <Icon name="sort-desc" {...iconDefaults} />
    case SORT_TYPE.LAST_UPDATED_DESC:
      return <Icon name="sort-asc" {...iconDefaults} />
    case SORT_TYPE.ALPHABETICAL_FOLDER_TYPE:
      return <Icon name="folder-close" {...iconDefaults} />
    case SORT_TYPE.ALPHABETICAL_FILE_TYPE:
      return <Icon name="code-file-light" {...iconDefaults} />
    default:
      return <Icon name="sort" {...iconDefaults} />
  }
}

export const getSortLabelByActionType = (sortType: SortType): keyof StringsMap => {
  switch (sortType) {
    case SORT_TYPE.ALPHABETICAL:
      return 'filestore.sort.byAlphabeticalAz'
    case SORT_TYPE.ALPHABETICAL_DESC:
      return 'filestore.sort.byAlphabeticalZa'
    case SORT_TYPE.LAST_UPDATED:
      return 'common.lastModified'
    case SORT_TYPE.LAST_UPDATED_DESC:
      return 'filestore.sort.firstModified'
    case SORT_TYPE.ALPHABETICAL_FOLDER_TYPE:
      return 'filestore.sort.byFolderType'
    case SORT_TYPE.ALPHABETICAL_FILE_TYPE:
      return 'filestore.sort.byFileType'
    default:
      return 'filestore.sort.nodeBy'
  }
}

export const sortNodesByType = (nodes: FileStoreNodeDTO[], sortType: SortType): FileStoreNodeDTO[] => {
  switch (sortType) {
    case SORT_TYPE.ALPHABETICAL:
      return [...sortBy(nodes, ['name'])]
    case SORT_TYPE.ALPHABETICAL_DESC:
      return [...reverse(sortBy(nodes, ['name']))]
    case SORT_TYPE.LAST_UPDATED:
      return [...reverse(sortBy(nodes, ['lastModifiedAt']))]
    case SORT_TYPE.LAST_UPDATED_DESC:
      return [...sortBy(nodes, ['lastModifiedAt'])]
    case SORT_TYPE.ALPHABETICAL_FILE_TYPE:
      return [...sortBy(nodes, ['type', 'name'])]
    case SORT_TYPE.ALPHABETICAL_FOLDER_TYPE:
      return [...reverse(sortBy(nodes, ['type']))]

    default:
      return [...sortBy(nodes, ['name'])]
  }
}
