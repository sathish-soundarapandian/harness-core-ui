/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { GitOpsApplicationsList } from '../GitOpsApplicationsList'

export const accountId = 'accountId'
export const projectIdentifier = 'project1'
export const orgIdentifier = 'default'

describe('GitOpsApplicationsList', () => {
  test('render GitOpsApplicationsList with empty list', () => {
    const { container: container1 } = render(
      <TestWrapper>
        <GitOpsApplicationsList applications={[]} limit={2} className={'demo_GitOpsApplicationsList'} />
      </TestWrapper>
    )
    expect(container1).toMatchSnapshot('empty GitOpsApplicationsList')
  })

  test('render GitOpsApplicationsList with 2 items in list', () => {
    const { container: container2 } = render(
      <TestWrapper
        path="/account/:accountId/:module/orgs/:orgIdentifier/projects/:projectIdentifier/gitops/applications/:applicationId"
        pathParams={{ projectIdentifier, orgIdentifier, accountId, module: 'cd', applicationId: 'applicationId' }}
        queryParams={{ agendId: 'agendId' }}
      >
        <GitOpsApplicationsList
          applications={[
            { agentIdentifier: 'AGENT_1', identifier: 'ID_1', name: 'NAME_1' },
            { agentIdentifier: 'AGENT_2', identifier: 'ID_2', name: 'NAME_2' }
          ]}
          limit={2}
          className={'demo_GitOpsApplicationsList'}
        />
      </TestWrapper>
    )
    expect(container2).toMatchSnapshot('2 items in GitOpsApplicationsList')
  })

  test('render GitOpsApplicationsList with 4 items in list', () => {
    const { container: container3 } = render(
      <TestWrapper
        path="/account/:accountId/:module/orgs/:orgIdentifier/projects/:projectIdentifier/gitops/applications/:applicationId"
        pathParams={{ projectIdentifier, orgIdentifier, accountId, module: 'cd', applicationId: 'applicationId' }}
        queryParams={{ agendId: 'agendId' }}
      >
        <GitOpsApplicationsList
          applications={[
            { agentIdentifier: 'AGENT_1', identifier: 'ID_1', name: 'NAME_1' },
            { agentIdentifier: 'AGENT_2', identifier: 'ID_2', name: 'NAME_2' },
            { agentIdentifier: 'AGENT_3', identifier: 'ID_3', name: 'NAME_3' },
            { agentIdentifier: 'AGENT_4', identifier: 'ID_4', name: 'NAME_4' }
          ]}
          limit={2}
          className={'demo_GitOpsApplicationsList'}
        />
      </TestWrapper>
    )
    expect(container3).toMatchSnapshot('4 items in GitOpsApplicationsList, 2 upfront, 2 in popover')
  })
})
