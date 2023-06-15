/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export const rootMock = {
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
        identifier: 't2confiog',
        parentIdentifier: 'Root',
        name: 't2confiog',
        type: 'FILE',
        path: '/t2confiog',
        lastModifiedAt: 1664447092647,
        lastModifiedBy: {
          name: 'automation ng',
          email: 'autouser1@harness.io'
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
          email: 'autouser1@harness.io'
        },
        children: []
      }
    ]
  },
  metaData: null,
  correlationId: 'e3a316d4-cc08-477f-a3c9-54d7e34b0ebf'
}

export const useGetCreatedByListMock = [{ email: 'autouser1@harness.io', name: 'automation ng' }]
export const entityTypeResponseMock = ['Pipelines', 'PipelineSteps', 'Service', 'Secrets', 'Template']
