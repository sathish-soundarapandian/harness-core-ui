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
        <GitOpsExecutionSummary stageInfo={{}} limit={1} />
      </TestWrapper>
    )

    expect(container).toMatchInlineSnapshot(`<div />`)
  })

  test('render with one application', () => {
    const { container } = render(
      <TestWrapper>
        <GitOpsExecutionSummary
          stageInfo={{
            gitOpsAppSummary: { applications: [{ agentIdentifier: 'AGENT_1', identifier: 'ID_1', name: 'NAME_1' }] }
          }}
          limit={1}
        />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('render with multiple applications', () => {
    const { container } = render(
      <TestWrapper>
        <GitOpsExecutionSummary
          stageInfo={{
            gitOpsAppSummary: {
              applications: [
                { agentIdentifier: 'AGENT_1', identifier: 'ID_1', name: 'NAME_1' },
                { agentIdentifier: 'AGENT_2', identifier: 'ID_2', name: 'NAME_2' },
                { agentIdentifier: 'AGENT_3', identifier: 'ID_3', name: 'NAME_3' }
              ]
            }
          }}
          limit={1}
        />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })
})
