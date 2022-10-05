/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { FileStoreContextState } from '@filestore/components/FileStoreContext/FileStoreContext'

export const contextFSMock = {
  currentNode: {
    identifier: 'asd12',
    parentIdentifier: 'Root',
    name: 'asd12',
    type: 'FILE',
    path: '/asd12',
    lastModifiedAt: 1664608028996,
    lastModifiedBy: {
      name: 'autouser1@harness.io',
      email: 'autouser1@harness.io'
    },
    fileUsage: 'MANIFEST_FILE',
    description: 'desc',
    tags: [
      {
        key: 'asd',
        value: ''
      }
    ],
    mimeType: 'txt',
    content: 'asd',
    size: 3,
    initialContent: 'asd'
  },
  fileStore: [
    {
      identifier: 'asd12',
      parentIdentifier: 'Root',
      name: 'asd12',
      type: 'FILE',
      path: '/asd12',
      lastModifiedAt: 1664608028996,
      lastModifiedBy: {
        name: 'autouser1@harness.io',
        email: 'autouser1@harness.io'
      },
      fileUsage: 'MANIFEST_FILE',
      description: 'desc',
      tags: [
        {
          key: 'asd',
          value: ''
        }
      ],
      mimeType: 'txt',
      content: null,
      size: 3,
      parentName: 'Root'
    }
  ],
  loading: false,
  tempNodes: [],
  activeTab: 'details',
  isModalView: false,
  scope: '',
  queryParams: {
    accountIdentifier: 'acc1',
    orgIdentifier: 'org1',
    projectIdentifier: 'proj1'
  },
  deletedNode: '',
  unsavedNodes: []
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

export const responseGetFoldersNodesMock = {
  status: 'SUCCESS',
  data: {
    identifier: 'Root',
    parentIdentifier: '',
    name: '/',
    type: 'FOLDER',
    path: '/',
    lastModifiedAt: null,
    lastModifiedBy: null,
    children: [
      {
        identifier: 'asd122',
        parentIdentifier: 'Root',
        name: 'asd122',
        type: 'FILE',
        path: '/asd122',
        lastModifiedAt: 1664609070682,
        lastModifiedBy: {
          name: 'autouser12r1@te.io',
          email: 'autouser12r1@te.io'
        },
        fileUsage: 'MANIFEST_FILE',
        description: '',
        tags: [],
        mimeType: 'txt',
        content: null,
        size: 0
      }
    ]
  },
  metaData: null,
  correlationId: 't1'
}

export const newNodeMock = {
  identifier: 'asd123',
  parentIdentifier: 'Root',
  name: 'asd123',
  type: 'FILE',
  path: '/asd123',
  lastModifiedAt: 1664609070682,
  lastModifiedBy: {
    name: 'autouser123r1@te.io',
    email: 'autouser123r1@te.io'
  },
  fileUsage: 'MANIFEST_FILE',
  description: '',
  tags: [],
  mimeType: 'txt',
  content: null,
  size: 0
}
