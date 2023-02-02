/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { ResourceDTO, ResourceScopeDTO } from 'services/audit'
import AuditTrailFactory from '../AuditTrailFactory'

describe('Audit trail factory tests', () => {
  AuditTrailFactory.registerResourceHandler('CONNECTOR', {
    moduleIcon: { name: 'nav-settings' },
    resourceUrl: (_resource: ResourceDTO, _resourceScopeDTO: ResourceScopeDTO) => {
      return 'dummy_url'
    },
    resourceLabel: 'connector'
  })

  test('test with registered resource', () => {
    const handler = AuditTrailFactory.getResourceHandler('CONNECTOR')
    expect(handler?.moduleIcon.name).toBe('nav-settings')
    expect(
      handler?.resourceUrl?.(
        { identifier: 'test_connector_id', type: 'CONNECTOR' },
        { orgIdentifier: 'orgIdentifier', accountIdentifier: 'accountIdentifier' }
      )
    ).toBe('dummy_url')
  })

  test('test without registered resource', () => {
    const handler = AuditTrailFactory.getResourceHandler('SECRET')
    expect(handler).toBeUndefined()
  })
})
