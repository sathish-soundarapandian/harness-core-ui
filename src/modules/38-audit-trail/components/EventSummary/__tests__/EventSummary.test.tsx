/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, screen, within } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'

import AuditTrailFactory from 'framework/AuditTrail/AuditTrailFactory'
import type { AuditEventData } from 'services/audit'
import EventSummary from '../EventSummary'

AuditTrailFactory.registerResourceHandler('PIPELINE', {
  moduleIcon: {
    name: 'cd-main'
  },
  moduleLabel: 'common.purpose.cd.continuous',
  resourceLabel: 'auditTrail.resourceLabel.pipelineExecution',
  additionalDetails: (_auditEventData?: AuditEventData): any => ({
    'Pipeline Identifier': 'dummyPipeline'
  })
})

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

  test('with auditEvent data', async () => {
    render(
      <TestWrapper>
        <EventSummary
          auditEvent={{
            insertId: 'dummy',
            auditId: '6217745b7f53a424fd70e323',
            resourceScope: {
              accountIdentifier: 'dummyAccount'
            },
            timestamp: 1645704281030,
            authenticationInfo: {
              principal: {
                type: 'SYSTEM',
                identifier: 'SYSTEM'
              },
              labels: {
                userId: '2VA3XtI_Q-eJpCVV4Q1_gw',
                username: 'dummy.user@harness.io'
              }
            },
            resource: { identifier: 'dummy', type: 'PIPELINE' },
            module: 'PMS',
            action: 'STAGE_START',
            auditEventData: {
              accountIdentifier: 'dummyAccount',
              orgIdentifier: 'dummyOrg',
              projectIdentifier: 'dummyProject',
              pipelineIdentifier: 'dummyPipeline',
              stageIdentifier: null,
              stageType: '',
              planExecutionId: 'qJesyKLUQhaHCMlyHVd8xA',
              nodeExecutionId: null,
              status: 'FAILED',
              startTs: 1684268040379,
              endTs: 1684268046393
            } as any
          }}
        />
      </TestWrapper>
    )

    const yamlDiffCard = await screen.findByRole('row', {
      name: 'S dummy.user@harness.io auditTrail.actions.stageStart auditTrail.resourceLabel.pipelineExecution dummy'
    })
    const stageStartActionLabel = within(yamlDiffCard).getByText('auditTrail.actions.stageStart')
    expect(stageStartActionLabel).toBeDefined()

    const supplementaryText = await screen.findByText('auditTrail.supplementaryDetails')
    expect(supplementaryText).toBeDefined()
    expect(screen.getByText('Pipeline Identifier')).toBeDefined()
    expect(screen.getByText('dummyPipeline')).toBeDefined()
    const stageIdentifier = screen.queryByText('Stage Identifier')
    expect(stageIdentifier).not.toBeInTheDocument()
    const stageType = screen.queryByText('Stage Type')
    expect(stageType).not.toBeInTheDocument()
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
