/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { ResponsePageResourceGroupV2Response } from 'services/resourcegroups'

export const resourceGroupListResponse: ResponsePageResourceGroupV2Response = {
  status: 'SUCCESS',
  data: {
    totalPages: 2,
    totalItems: 20,
    pageItemCount: 10,
    pageSize: 10,
    content: [
      {
        resourceGroup: {
          accountIdentifier: 'kmpySmUISimoRrJL6NL73w',
          identifier: 'ss33',
          name: 'ss33',
          color: '#0063f7',
          includedScopes: [
            {
              filter: 'EXCLUDING_CHILD_SCOPES',
              accountIdentifier: 'kmpySmUISimoRrJL6NL73w'
            }
          ],
          resourceFilter: {
            includeAllResources: false,
            resources: [{ resourceType: 'ORGANIZATION' }, { resourceType: 'SECRET_MANAGER' }]
          },
          tags: {},
          description: ''
        },
        createdAt: 1614237155621,
        harnessManaged: false,
        lastModifiedAt: 1614237168823
      },
      {
        resourceGroup: {
          accountIdentifier: 'kmpySmUISimoRrJL6NL73w',
          identifier: 'starte',
          name: 'starte',
          color: '#0063f7',
          includedScopes: [
            {
              filter: 'EXCLUDING_CHILD_SCOPES',
              accountIdentifier: 'kmpySmUISimoRrJL6NL73w'
            }
          ],
          resourceFilter: {
            includeAllResources: false,
            resources: [
              { resourceType: 'ORGANIZATION' },
              { resourceType: 'SECRET_MANAGER' },
              { resourceType: 'PROJECT' }
            ]
          },
          tags: {},
          description: ''
        },
        createdAt: 1614235877442,
        harnessManaged: false,
        lastModifiedAt: 1614237139987
      },
      {
        resourceGroup: {
          accountIdentifier: 'kmpySmUISimoRrJL6NL73w',

          identifier: 'swarfdfds34343',
          name: 'swarfdfds34343',
          color: '#0063f7',
          includedScopes: [
            {
              filter: 'EXCLUDING_CHILD_SCOPES',
              accountIdentifier: 'kmpySmUISimoRrJL6NL73w'
            }
          ],
          resourceFilter: {
            includeAllResources: false,
            resources: [{ resourceType: 'ORGANIZATION' }, { resourceType: 'PROJECT' }]
          },

          tags: {},
          description: ''
        },
        createdAt: 1614235749097,
        harnessManaged: false,
        lastModifiedAt: 1614235755919
      }
    ],
    pageIndex: 0,
    empty: false
  },
  correlationId: '74bd725c-de9e-47eb-b588-c9aca8b1433c'
}
