/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, RenderResult, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import type { JiraIssue } from 'services/cf'
import * as cfServiceMock from 'services/cf'
import { useTelemetry } from '@common/hooks/useTelemetry'
import JiraIssueList, { JiraIssueListProps } from '../JiraIssueList'
jest.mock('services/cf')
jest.mock('@common/hooks/useTelemetry', () => ({
  useTelemetry: jest.fn(() => ({
    trackEvent: jest.fn()
  }))
}))

const patchMutateMock = jest.fn()
const renderComponent = (props?: Partial<JiraIssueListProps>): RenderResult => {
  jest.spyOn(cfServiceMock, 'usePatchFeature').mockReturnValue({
    loading: false,
    mutate: patchMutateMock
  } as any)

  jest.spyOn(cfServiceMock, 'useGetJiraIssues').mockReturnValue({
    loading: false,
    refetch: jest.fn(),
    data: {
      issues: [
        {
          id: 'ISSUE_ID',
          self: 'https://jira.com/ISSUE_ID',
          key: 'FD-7',
          fields: {
            summary: 'This is the issue title'
          }
        }
      ]
    }
  } as any)

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
      <JiraIssueList jiraIssues={jiraIssues} refetchFlag={jest.fn()} featureIdentifier="TEST_1" {...props} />
    </TestWrapper>
  )
}

describe('JiraIssueList', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

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

  test('it should display "Add Jira Issue Modal" on button click', async () => {
    renderComponent()

    const jiraModalButton = screen.getByRole('button', { name: 'cf.featureFlags.jira.newJiraIssueButton' })
    expect(jiraModalButton).toBeInTheDocument()
    await userEvent.click(jiraModalButton)

    //assert dialog elements appear
    expect(screen.getByText('cf.featureFlags.jira.jiraModalTitle')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('- cf.featureFlags.jira.inputPlaceholder -')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'add' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'cancel' })).toBeInTheDocument()
  })

  test('it should let the user save a Jira Issue correctly', async () => {
    renderComponent()

    const jiraModalButton = screen.getByRole('button', { name: 'cf.featureFlags.jira.newJiraIssueButton' })
    expect(jiraModalButton).toBeInTheDocument()
    await userEvent.click(jiraModalButton)

    // type into issue search field
    expect(screen.getByPlaceholderText('- cf.featureFlags.jira.inputPlaceholder -')).toBeInTheDocument()
    await userEvent.click(screen.getByPlaceholderText('- cf.featureFlags.jira.inputPlaceholder -'))
    await userEvent.type(screen.getByPlaceholderText('- cf.featureFlags.jira.inputPlaceholder -'), 'FD-7')

    // select issue from dropdown
    const item = await screen.findByRole('listitem')
    expect(item).toHaveTextContent('FD-7')
    await userEvent.click(screen.getByRole('listitem'))
    await waitFor(() =>
      expect(screen.getByPlaceholderText('- cf.featureFlags.jira.inputPlaceholder -')).toHaveValue('FD-7')
    )

    // submit form
    await userEvent.click(screen.getByRole('button', { name: 'add' }))
    await waitFor(() => {
      expect(patchMutateMock).toHaveBeenCalledWith({
        instructions: [
          {
            kind: 'addJiraIssueToFlag',
            parameters: {
              issueKey: 'FD-7'
            }
          }
        ]
      })
      expect(useTelemetry).toHaveBeenCalled()
    })
  })

  test('it should handle/show error on add button click', async () => {
    renderComponent()

    jest.spyOn(cfServiceMock, 'usePatchFeature').mockReturnValue({
      loading: false,
      mutate: patchMutateMock.mockRejectedValueOnce(false)
    } as any)

    const jiraModalButton = screen.getByRole('button', { name: 'cf.featureFlags.jira.newJiraIssueButton' })
    expect(jiraModalButton).toBeInTheDocument()
    await userEvent.click(jiraModalButton)

    // type into issue search field
    expect(screen.getByPlaceholderText('- cf.featureFlags.jira.inputPlaceholder -')).toBeInTheDocument()
    await userEvent.click(screen.getByPlaceholderText('- cf.featureFlags.jira.inputPlaceholder -'))
    await userEvent.type(screen.getByPlaceholderText('- cf.featureFlags.jira.inputPlaceholder -'), 'FD-7')

    // select issue from dropdown
    await waitFor(() => expect(screen.getAllByRole('listitem')).toHaveLength(1))
    expect(screen.getByRole('listitem')).toHaveTextContent('FD-7')
    await userEvent.click(screen.getByRole('listitem'))
    await waitFor(() =>
      expect(screen.getByPlaceholderText('- cf.featureFlags.jira.inputPlaceholder -')).toHaveValue('FD-7')
    )

    // submit form
    await userEvent.click(screen.getByRole('button', { name: 'add' }))
    await waitFor(() => expect(screen.getByText('warning-sign')).toBeInTheDocument())
  })

  test('it should show correct error message if issue not found', async () => {
    renderComponent()

    const jiraModalButton = screen.getByRole('button', { name: 'cf.featureFlags.jira.newJiraIssueButton' })
    expect(jiraModalButton).toBeInTheDocument()
    await userEvent.click(jiraModalButton)

    // type into issue search field
    expect(screen.getByPlaceholderText('- cf.featureFlags.jira.inputPlaceholder -')).toBeInTheDocument()
    await userEvent.click(screen.getByPlaceholderText('- cf.featureFlags.jira.inputPlaceholder -'))
    await userEvent.type(screen.getByPlaceholderText('- cf.featureFlags.jira.inputPlaceholder -'), 'FD-NOT-FOUND')

    // 'no issue found' message should appear in dropdown
    await waitFor(() => expect(screen.getByText('No Match Found')).toBeInTheDocument())
  })

  test('it should render empty select options if no Jira Issues exist', async () => {
    renderComponent()

    jest.spyOn(cfServiceMock, 'useGetJiraIssues').mockReturnValue({
      loading: false,
      refetch: jest.fn(),
      data: {
        issues: []
      }
    } as any)

    const jiraModalButton = screen.getByRole('button', { name: 'cf.featureFlags.jira.newJiraIssueButton' })
    expect(jiraModalButton).toBeInTheDocument()
    await userEvent.click(jiraModalButton)

    await userEvent.click(screen.getByPlaceholderText('- cf.featureFlags.jira.inputPlaceholder -'))

    // 'no issue found' message should appear in dropdown
    await waitFor(() => expect(screen.getByText('No matching results found')).toBeInTheDocument())
  })

  test('it should show correct error message if no issue selected', async () => {
    renderComponent()

    const jiraModalButton = screen.getByRole('button', { name: 'cf.featureFlags.jira.newJiraIssueButton' })
    expect(jiraModalButton).toBeInTheDocument()
    await userEvent.click(jiraModalButton)

    await waitFor(() => expect(screen.getByRole('button', { name: 'add' })).toBeInTheDocument())
    await userEvent.click(screen.getByRole('button', { name: 'add' }))

    // 'no issue found' message should appear in dropdown
    await waitFor(() => expect(screen.getByText('cf.featureFlags.jira.jiraIssueRequiredError')).toBeInTheDocument())
  })

  test('it should close modal on cancel click', async () => {
    renderComponent()

    const jiraModalButton = screen.getByRole('button', { name: 'cf.featureFlags.jira.newJiraIssueButton' })
    expect(jiraModalButton).toBeInTheDocument()
    await userEvent.click(jiraModalButton)

    await waitFor(() => expect(screen.getByRole('button', { name: 'cancel' })).toBeInTheDocument())
    await userEvent.click(screen.getByRole('button', { name: 'cancel' }))

    await waitFor(() => expect(screen.queryByText('cf.featureFlagDetail.jira.jiraModalTitle')).not.toBeInTheDocument())
  })

  test.each([undefined, []])('it should render component when Jira Issues %s', async type => {
    renderComponent({ jiraIssues: type })

    expect(screen.getByText('cf.featureFlagDetail.jiraIssuesTitle')).toBeInTheDocument()
    expect(screen.getByText('cf.featureFlagDetail.jiraIssuesDescription')).toBeInTheDocument()

    expect(screen.queryAllByRole('link')).toHaveLength(0)
  })
})
