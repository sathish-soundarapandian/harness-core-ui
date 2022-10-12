/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { FileStoreContextState } from '@filestore/components/FileStoreContext/FileStoreContext'

export const contextFSMock = {
  currentNode: {
    identifier: 'Root',
    parentIdentifier: '',
    name: '/',
    type: 'FOLDER',
    path: '/',
    lastModifiedAt: null,
    lastModifiedBy: null,
    children: [
      {
        identifier: 't2confiog',
        parentIdentifier: 'Root',
        name: 't2confiog',
        type: 'FILE',
        path: '/t2confiog',
        lastModifiedAt: 1664447092647,
        lastModifiedBy: {
          name: 'automation ng',
          email: 'test1@test.io'
        },
        fileUsage: 'CONFIG',
        description: '',
        tags: [],
        mimeType: 'txt',
        content: null,
        size: 0
      },
      {
        identifier: 'test123',
        parentIdentifier: 'Root',
        name: 'test123',
        type: 'FOLDER',
        path: '/test123',
        lastModifiedAt: 1664446531624,
        lastModifiedBy: {
          name: 'automation ng',
          email: 'test@test.io'
        },
        children: []
      }
    ],
    parentName: 'Root'
  },
  fileStore: [
    {
      identifier: 't2confiog',
      parentIdentifier: 'Root',
      name: 't2confiog',
      type: 'FILE',
      path: '/t2confiog',
      lastModifiedAt: 1664447092647,
      lastModifiedBy: {
        name: 'automation ng',
        email: 'test@test.io'
      },
      fileUsage: 'CONFIG',
      description: '',
      tags: [],
      mimeType: 'txt',
      content: null,
      size: 0,
      parentName: 'Root'
    },
    {
      identifier: 'test123',
      parentIdentifier: 'Root',
      name: 'test123',
      type: 'FOLDER',
      path: '/test123',
      lastModifiedAt: 1664446531624,
      lastModifiedBy: {
        name: 'automation ng',
        email: 'test@test.io'
      },
      children: [],
      parentName: 'Root'
    }
  ],
  loading: false,
  tempNodes: [],
  activeTab: 'details',
  isModalView: false,
  scope: 'project',
  queryParams: {
    accountIdentifier: 'acc123',
    orgIdentifier: 'org123',
    projectIdentifier: 'project123'
  },
  deletedNode: '',
  unsavedNodes: [],
  fileUsage: 'CONFIG'
}

export const getDummyFileStoreContextValue = (): FileStoreContextState => {
  return {
    ...contextFSMock,
    setCurrentNode: jest.fn(),
    setFileStore: jest.fn(),
    updateFileStore: jest.fn(),
    getNode: jest.fn(),
    setLoading: jest.fn(),
    setActiveTab: jest.fn(),
    updateCurrentNode: jest.fn(),
    setTempNodes: jest.fn(),
    setUnsavedNodes: jest.fn(),
    updateTempNodes: jest.fn(),
    addDeletedNode: jest.fn(),
    removeFromTempNodes: jest.fn(),
    isCachedNode: jest.fn(),
    handleSetIsUnsaved: jest.fn()
  } as any
}
