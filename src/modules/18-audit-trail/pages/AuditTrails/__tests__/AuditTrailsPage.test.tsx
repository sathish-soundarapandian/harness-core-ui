/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import { accountPathProps } from '@common/utils/routeUtils'
import * as auditServices from 'services/audit'
import AuditTrailsPage from '../AuditTrailsPage'
import { filters } from '../../../components/__tests__/mockData'

jest.spyOn(auditServices, 'useGetAuditFilterList').mockImplementation(() => ({ data: filters, loading: false } as any))

describe('Audit trail Page', () => {
  test('render', () => {
    const renderObj = render(
      <TestWrapper path={routes.toAuditTrail({ ...accountPathProps })} pathParams={{ accountId: 'testAcc' }}>
        <AuditTrailsPage />
      </TestWrapper>
    )
    expect(renderObj.container).toMatchSnapshot()
  })
})
