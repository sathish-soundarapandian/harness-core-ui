/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export const referencedByResponse = {
  status: 'SUCCESS',
  data: {
    content: [
      {
        accountIdentifier: 'a1',
        referredEntity: {
          type: 'Files',
          entityRef: {
            scope: 'project',
            identifier: 'id1',
            accountIdentifier: 'a1',
            orgIdentifier: 'default',
            projectIdentifier: 'SSH_Testing',
            metadata: {
              fqn: 'service.serviceDefinition.spec.configFiles.FS.spec.store.spec.files'
            },
            repoIdentifier: null,
            branch: null,
            isDefault: true,
            fullyQualifiedScopeIdentifier: 'a2',
            default: true
          },
          name: ''
        },
        referredByEntity: {
          type: 'Service',
          entityRef: {
            scope: 'project',
            identifier: 'Custom_Artifact_service',
            accountIdentifier: 'a1',
            orgIdentifier: 'default',
            projectIdentifier: 'SSH_Testing',
            metadata: {},
            repoIdentifier: null,
            branch: null,
            isDefault: true,
            fullyQualifiedScopeIdentifier: 'a2',
            default: true
          },
          name: 'Custom Artifact service'
        },
        detail: null,
        createdAt: 1664892005936
      }
    ],
    pageable: {
      sort: {
        sorted: true,
        unsorted: false,
        empty: false
      },
      pageSize: 10,
      pageNumber: 0,
      offset: 0,
      paged: true,
      unpaged: false
    },
    last: true,
    totalPages: 1,
    totalElements: 7,
    first: true,
    sort: {
      sorted: true,
      unsorted: false,
      empty: false
    },
    number: 0,
    numberOfElements: 7,
    size: 10,
    empty: false
  },
  metaData: null,
  correlationId: 'aa1'
}
