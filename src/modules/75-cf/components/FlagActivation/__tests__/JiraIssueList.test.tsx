/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, RenderResult, screen } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import type { JiraIssue } from 'services/cf'
import JiraIssueList, { JiraIssueListProps } from '../JiraIssueList'

const renderComponent = (props?: Partial<JiraIssueListProps>): RenderResult => {
  const jiraIssues: JiraIssue[] = [
    {
      issueKey: 'ISSUE_1',
      issueURL: 'https://jira.com/ISSUE_1'
    },
    {
      issueKey: 'ISSUE_2',
      issueURL: 'https://jira.com/ISSUE_2'
    }
  ]

  return render(
    <TestWrapper
      path="/account/:accountId/cf/orgs/:orgIdentifier/projects/:projectIdentifier/feature-flags"
      pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
    >
      <JiraIssueList jiraIssues={jiraIssues} {...props} />
    </TestWrapper>
  )
}

describe('JiraIssueList', () => {
  test('it should display pre-existing Jira Issues', async () => {
    renderComponent()

    expect(screen.getByText('cf.featureFlagDetail.jiraIssuesTitle')).toBeInTheDocument()
    expect(screen.getByText('cf.featureFlagDetail.jiraIssuesDescription')).toBeInTheDocument()

    expect(screen.getAllByRole('link')).toHaveLength(2)

    expect(screen.getByText('ISSUE_1')).toBeInTheDocument()
    expect(screen.getByText('ISSUE_1')).toHaveAttribute('href', 'https://jira.com/ISSUE_1')
    expect(screen.getByText('ISSUE_2')).toBeInTheDocument()
    expect(screen.getByText('ISSUE_2')).toHaveAttribute('href', 'https://jira.com/ISSUE_2')
  })

  test.each([undefined, []])('it should render component when Jira Issues %s', async type => {
    renderComponent({ jiraIssues: type })

    expect(screen.getByText('cf.featureFlagDetail.jiraIssuesTitle')).toBeInTheDocument()
    expect(screen.getByText('cf.featureFlagDetail.jiraIssuesDescription')).toBeInTheDocument()

    expect(screen.queryAllByRole('link')).toHaveLength(0)
  })
})
