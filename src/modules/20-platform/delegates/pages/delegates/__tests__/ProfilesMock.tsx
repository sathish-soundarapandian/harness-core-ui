/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import moment from 'moment'
export default {
  metadata: '',
  resource: {
    response: [
      {
        identifier: 'ident_1',
        accountId: 'TEST_ACCOUNTID',
        uuid: 'profile1',
        name: 'Primary',
        description: 'The primary profile for the account',
        primary: true,
        approvalRequired: true,
        startupScript: 'test this',
        createdBy: {
          uuid: 'person1',
          name: 'Admin',
          email: 'adm@harn.io'
        },
        lastUpdatedBy: {
          uuid: 'person1',
          name: 'Admin',
          email: 'adm@harn.io'
        },
        lastUpdatedAt: moment(),
        scopingRules: []
      },
      {
        identifier: 'ident_2',
        accountId: 'TEST_ACCOUNTID',
        uuid: 'profile2',
        name: 'profile 2',
        description: 'The profile for the account',
        primary: false,
        approvalRequired: true,
        startupScript: 'test this',
        createdBy: {
          uuid: 'person1',
          name: 'Admin',
          email: 'adm@harn.io'
        },
        lastUpdatedBy: {
          uuid: 'person1',
          name: 'Admin',
          email: 'adm@harn.io'
        },
        lastUpdatedAt: moment(),
        scopingRules: []
      }
    ]
  }
}
