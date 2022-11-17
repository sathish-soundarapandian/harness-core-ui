/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export const userGroupsMockResponse = {
  status: 'SUCCESS',
  data: {
    totalPages: 1,
    totalItems: 2,
    pageItemCount: 50,
    pageSize: 50,
    content: [
      {
        userGroupDTO: {
          accountIdentifier: 'px7xd_BFRCi-pfWPYXVjvx',
          identifier: 'user_group_1',
          name: 'user group 1',
          users: ['3U51dI0LR2itpTfqZIVv9g', 'Zt32yseqQVG9osmghJ2tjw'],
          notificationConfigs: [],
          externallyManaged: true,
          description: '',
          tags: {},
          ssoLinked: false
        },
        users: [
          {
            name: 'scimuser901088@mailinator.com',
            email: 'scimuser901088@mailinator.com',
            uuid: 'Zt32yseqQVG9osmghJ2tjw',
            locked: false,
            disabled: false,
            externallyManaged: true
          },
          {
            name: 'scimuser049357@mailinator.com',
            email: 'scimuser049357@mailinator.com',
            uuid: '3U51dI0LR2itpTfqZIVv9g',
            locked: false,
            disabled: false,
            externallyManaged: true
          }
        ],
        roleAssignmentsMetadataDTO: null,
        lastModifiedAt: 1661158931736
      },
      {
        userGroupDTO: {
          accountIdentifier: 'px7xd_BFRCi-pfWPYXVjvx',
          identifier: 'user_group_2',
          name: 'user group 2',
          users: ['zXiyXD9ORtaZpaLd6GX0iQ', 'Xc1HxcXbTKCvf2L3DlqmnQ'],
          notificationConfigs: [],
          externallyManaged: true,
          description: '',
          tags: {},
          ssoLinked: false
        },
        users: [
          {
            name: 'scimuser474757@mailinator.com',
            email: 'scimuser474757@mailinator.com',
            uuid: 'Xc1HxcXbTKCvf2L3DlqmnQ',
            locked: false,
            disabled: false,
            externallyManaged: true
          },
          {
            name: 'scimuser714733@mailinator.com',
            email: 'scimuser714733@mailinator.com',
            uuid: 'zXiyXD9ORtaZpaLd6GX0iQ',
            locked: false,
            disabled: false,
            externallyManaged: true
          }
        ],
        roleAssignmentsMetadataDTO: null,
        lastModifiedAt: 1661152621040
      }
    ],
    pageIndex: 0,
    empty: false
  },
  metaData: null,
  correlationId: '0a4a8984-233f-405d-9f54-3125a555924f'
}
