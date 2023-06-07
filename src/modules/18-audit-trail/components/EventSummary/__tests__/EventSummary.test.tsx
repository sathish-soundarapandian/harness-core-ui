/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'

import EventSummary from '../EventSummary'

describe('Event summary test', () => {
  test('render', async () => {
    render(
      <TestWrapper>
        <EventSummary
          auditEvent={{
            insertId: 'dummy',
            auditId: '6217745b7f53a424fd70e323',
            resourceScope: {
              accountIdentifier: 'px7xd_BFRCi-pfWPYXVjvw'
            },
            httpRequestInfo: {
              requestMethod: 'POST'
            },
            requestMetadata: {
              clientIP: '10.24.38.14'
            },
            timestamp: 1645704281030,
            authenticationInfo: {
              principal: {
                type: 'USER',
                identifier: 'nataraja@harness.io'
              },
              labels: {
                userId: '2VA3XtI_Q-eJpCVV4Q1_gw',
                username: 'nataraja@harness.io'
              }
            },
            module: 'CORE',
            resource: {
              type: 'USER',
              identifier: 'nataraja@harness.io',
              labels: {
                resourceName: 'nataraja@harness.io',
                userId: '2VA3XtI_Q-eJpCVV4Q1_gw'
              }
            },
            action: 'LOGIN'
          }}
        />
      </TestWrapper>
    )
    const drawer = document.body.querySelector(`.bp3-drawer`)
    expect(drawer).toMatchSnapshot()
    const supplementaryText = screen.queryByText('auditTrail.supplementaryDetails')
    expect(supplementaryText).toBeDefined()
  })

  test('without requestMethod and ip', async () => {
    render(
      <TestWrapper>
        <EventSummary
          auditEvent={{
            insertId: 'dummy',
            auditId: '6217745b7f53a424fd70e323',
            resourceScope: {
              accountIdentifier: 'px7xd_BFRCi-pfWPYXVjvw'
            },
            timestamp: 1645704281030,
            authenticationInfo: {
              principal: {
                type: 'USER',
                identifier: 'nataraja@harness.io'
              },
              labels: {
                userId: '2VA3XtI_Q-eJpCVV4Q1_gw',
                username: 'nataraja@harness.io'
              }
            },
            resource: { identifier: 'dummy', type: 'API_KEY' },
            module: 'CORE',
            action: 'LOGIN'
          }}
        />
      </TestWrapper>
    )
    const supplementaryText = screen.queryByText('auditTrail.supplementaryDetails')
    expect(supplementaryText).toBeNull()
  })
})
