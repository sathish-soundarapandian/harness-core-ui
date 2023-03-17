/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import GitOpsExecutionSummary from '../GitOpsExecutionSummary'

export const accountId = 'accountId'
export const projectIdentifier = 'project1'
export const orgIdentifier = 'default'

describe('GitOpsExecutionSummary', () => {
  test('empty applications', () => {
    const { container } = render(
      <TestWrapper>
        <GitOpsExecutionSummary stageInfo={{}} />
      </TestWrapper>
    )

    expect(container).toMatchInlineSnapshot(`<div />`)
  })

  test('render with one application', () => {
    const { container } = render(
      <TestWrapper
        path="/account/:accountId/:module/orgs/:orgIdentifier/projects/:projectIdentifier/gitops/applications/:applicationId"
        pathParams={{ projectIdentifier, orgIdentifier, accountId, module: 'cd', applicationId: 'applicationId' }}
      >
        <GitOpsExecutionSummary
          stageInfo={{
            gitOpsAppSummary: { applications: [{ agentIdentifier: 'AGENT_1', identifier: 'ID_1', name: 'NAME_1' }] }
          }}
        />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('render with multiple applications', () => {
    const { container } = render(
      <TestWrapper
        path="/account/:accountId/:module/orgs/:orgIdentifier/projects/:projectIdentifier/gitops/applications/:applicationId"
        pathParams={{ projectIdentifier, orgIdentifier, accountId, module: 'cd', applicationId: 'applicationId' }}
      >
        <GitOpsExecutionSummary
          stageInfo={{
            gitOpsAppSummary: {
              applications: [
                {
                  agentIdentifier: 'AGENT_1',
                  identifier: 'ID_1',
                  name: 'NAME_1 NAME_1 NAME_1 NAME_1 NAME_1 NAME_1 NAME_1 NAME_1 NAME_1'
                },
                {
                  agentIdentifier: 'AGENT_2',
                  identifier: 'ID_2',
                  name: 'NAME_2 NAME_2 NAME_2 NAME_2 NAME_2 NAME_2 NAME_2 NAME_2 NAME_2'
                },
                { agentIdentifier: 'AGENT_3', identifier: 'ID_3', name: 'NAME_3' }
              ]
            }
          }}
        />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('render clusters', () => {
    const { container } = render(
      <TestWrapper
        path="/account/:accountId/:module/orgs/:orgIdentifier/projects/:projectIdentifier/gitops/applications/:applicationId"
        pathParams={{ projectIdentifier, orgIdentifier, accountId, module: 'cd', applicationId: 'applicationId' }}
      >
        <GitOpsExecutionSummary
          stageInfo={{
            gitopsExecutionSummary: {
              environments: [
                {
                  name: 'prod',
                  identifier: 'prod'
                },
                {
                  name: 'prod-3',
                  identifier: 'prod3'
                }
              ],
              clusters: [
                {
                  envId: 'prod3',
                  envName: 'prod-3',
                  clusterId: 'prodcluster3',
                  clusterName: 'prod-cluster-3'
                },
                {
                  envId: 'prod',
                  envName: 'prod',
                  clusterId: 'prodcluster',
                  clusterName: 'prod-cluster'
                }
              ]
            }
          }}
        />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
