/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import { accountPathProps } from '@common/utils/routeUtils'
import { VIEWS } from '@audit-trail/pages/AuditTrails/AuditTrailsPage'
import ALSCard from '../AuditLogStreamingCards/ALSCard'

describe('ALSCard', () => {
  test('Renders', async () => {
    render(
      <TestWrapper
        queryParams={{ view: VIEWS.AUDIT_LOG_STREAMING }}
        path={routes.toAuditTrail({ ...accountPathProps })}
        pathParams={{ accountId: 'testAcc' }}
      >
        <ALSCard title="title" subtitle="subtitle" />
      </TestWrapper>
    )
    expect(screen.getByText('title')).toBeInTheDocument()
    expect(screen.getByText('subtitle')).toBeInTheDocument()
  })
})
