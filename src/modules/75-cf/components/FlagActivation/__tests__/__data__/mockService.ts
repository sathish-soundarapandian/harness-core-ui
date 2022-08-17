/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

const mockServiceList = {
  loading: false,
  data: {
    totalPages: 1,
    totalItems: 4,
    pageItemCount: 2,
    pageSize: 10,
    content: [
      {
        service: {
          accountId: 'zEaak-FLS425IEO7OLzMUg',
          identifier: 'Support',
          orgIdentifier: 'default',
          projectIdentifier: 'crystalfongtest',
          name: 'Support',
          description: null,
          deleted: false,
          tags: {},
          yaml: 'service:\n  name: "Support"\n  identifier: "Support"\n  tags: {}\n'
        },
        createdAt: 1659516298640,
        lastModifiedAt: 1659516298640
      },
      {
        service: {
          accountId: 'zEaak-FLS425IEO7OLzMUg',
          identifier: 'Messages',
          orgIdentifier: 'default',
          projectIdentifier: 'crystalfongtest',
          name: 'Messages',
          description: null,
          deleted: false,
          tags: {},
          yaml: 'service:\n  name: "Messages"\n  identifier: "Messages"\n  tags: {}\n'
        },
        createdAt: 1659516293339,
        lastModifiedAt: 1659516293339
      },
      {
        service: {
          accountId: 'zEaak-FLS425IEO7OLzMUg',
          identifier: 'Account',
          orgIdentifier: 'default',
          projectIdentifier: 'crystalfongtest',
          name: 'Account',
          description: null,
          deleted: false,
          tags: {},
          yaml: 'service:\n  name: "Account"\n  identifier: "Account"\n  tags: {}\n'
        },
        createdAt: 1659516285757,
        lastModifiedAt: 1659516285757
      },
      {
        service: {
          accountId: 'zEaak-FLS425IEO7OLzMUg',
          identifier: 'service1Id',
          orgIdentifier: 'default',
          projectIdentifier: 'crystalfongtest',
          name: 'My Service 1',
          description: null,
          deleted: false,
          tags: {},
          yaml: 'service:\n  name: "Account"\n  identifier: "Account"\n  tags: {}\n'
        },
        createdAt: 1659516285757,
        lastModifiedAt: 1659516285757
      }
    ],

    pageIndex: 0,
    empty: false
  }
}

export default mockServiceList
