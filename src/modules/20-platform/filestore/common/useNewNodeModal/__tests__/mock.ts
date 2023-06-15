/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export const createResponseMock = {
  status: 'SUCCESS',
  data: {
    accountIdentifier: 'a1',
    orgIdentifier: 'o1',
    projectIdentifier: 'p1',
    identifier: 'test1',
    name: 'test1',
    fileUsage: 'MANIFEST_FILE',
    type: 'FILE',
    parentIdentifier: 'Root',
    description: '',
    tags: [],
    mimeType: 'txt',
    path: '/test1',
    createdBy: {
      name: 'autouser1@test.io',
      email: 'autouser1@test.io'
    },
    lastModifiedBy: {
      name: 'autouser1@test.io',
      email: 'autouser1@test.io'
    },
    lastModifiedAt: 1664902253806
  },
  metaData: null,
  correlationId: 'asdasd123'
}

export const createResponseFolderMock = {
  status: 'SUCCESS',
  data: {
    accountIdentifier: 'a1',
    orgIdentifier: 'default',
    projectIdentifier: 'test1',
    identifier: 'folder112',
    name: 'folder112',
    type: 'FOLDER',
    parentIdentifier: 'Root',
    path: '/folder112',
    createdBy: {
      name: 'automation ng',
      email: 'a1@ha.io'
    },
    lastModifiedBy: {
      name: 'automation ng',
      email: 'a1@ha.io'
    },
    lastModifiedAt: 1668498597208
  },
  metaData: null,
  correlationId: 't5'
}
