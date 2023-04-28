/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { act } from 'react-dom/test-utils'
import { TestWrapper } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import { accountPathProps, orgPathProps } from '@common/utils/routeUtils'
import AuditTrailFactory from 'framework/AuditTrail/AuditTrailFactory'
import AuditLogsListView from '../AuditLogsListView'
import { data } from './mockData'

AuditTrailFactory.registerResourceHandler('CONNECTOR', {
  moduleIcon: { name: 'nav-settings' },
  moduleLabel: 'common.resourceCenter.ticketmenu.platform',
  resourceLabel: 'connector'
})

AuditTrailFactory.registerResourceHandler('PIPELINE', {
  moduleIcon: { name: 'cd' },
  resourceLabel: 'common.pipeline'
})

describe('Audit trail list view', () => {
  test('render', () => {
    const renderObj = render(
      <TestWrapper path={routes.toAuditTrail({ ...accountPathProps })} pathParams={{ accountId: 'testAcc' }}>
        <AuditLogsListView data={data.data as any} />
      </TestWrapper>
    )
    expect(renderObj.container).toMatchSnapshot()
  })

  test('render in org scope', () => {
    const renderObj = render(
      <TestWrapper
        path={routes.toAuditTrail({ ...orgPathProps })}
        pathParams={{ accountId: 'testAcc', orgIdentifier: 'orgdummy' }}
      >
        <AuditLogsListView data={data.data as any} />
      </TestWrapper>
    )
    expect(renderObj.container).toMatchSnapshot()
  })

  test('test event summary click', () => {
    render(
      <TestWrapper path={routes.toAuditTrail({ ...accountPathProps })} pathParams={{ accountId: 'testAcc' }}>
        <AuditLogsListView data={data.data as any} />
      </TestWrapper>
    )
    const notesIcon = document.body.querySelector('.notesIcon')
    act(() => {
      fireEvent.click(notesIcon as Element)
    })
    const eventSummary = screen.queryByText('auditTrail.eventSummary')
    expect(eventSummary).toBeDefined()
  })
})
