/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { getStringKeyFromObjectValues, keysToCompare } from 'framework/rbac/PermissionsContext'

describe('PermissionContext', () => {
  test('getStringKeyFromObjectValues', () => {
    expect(
      getStringKeyFromObjectValues(
        {
          resourceScope: {
            accountIdentifier: 'kmpySmUISimoRrJL6NL73w',
            orgIdentifier: 'org2'
          },
          resourceType: 'PROJECT',
          resourceIdentifier: 'asdas',
          permission: 'core_project_edit'
        },
        keysToCompare
      )
    ).toEqual('kmpySmUISimoRrJL6NL73w/org2/PROJECT/asdas/core_project_edit')
  })
  test('getStringKeyFromObjectValues with abac filters', () => {
    expect(
      getStringKeyFromObjectValues(
        {
          resourceScope: {
            accountIdentifier: 'kmpySmUISimoRrJL6NL73w',
            orgIdentifier: 'org2'
          },
          resourceAttributes: {
            category: 'CLOUD_PROVIDER'
          },
          resourceType: 'PROJECT',
          resourceIdentifier: 'asdas',
          permission: 'core_project_edit'
        },
        keysToCompare
      )
    ).toEqual('kmpySmUISimoRrJL6NL73w/org2/PROJECT/asdas/core_project_edit/category/CLOUD_PROVIDER')
  })
})
