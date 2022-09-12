/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, render, waitFor } from '@testing-library/react'

import { TestWrapper } from '@common/utils/testUtils'

import { PolicySetListRenderer } from '../PolicySetListRenderer'
import { PolicySetType } from '../../../PolicyStepTypes'

jest.mock('@common/exports', () => ({
  useToaster: () => ({
    showError: jest.fn()
  })
}))

describe('Policy Set List Renderer', () => {
  test('snapshot test when no data', () => {
    const { container } = render(
      <TestWrapper
        queryParams={{
          accountIdentifier: 'account',
          orgIdentifier: 'org',
          projectIdentifier: 'project'
        }}
      >
        <PolicySetListRenderer
          loading={false}
          error={null}
          refetch={jest.fn()}
          newPolicySetIds={[]}
          setNewPolicySetIds={jest.fn}
          policySetList={[]}
          selectedTabId={PolicySetType.ACCOUNT}
          showModal={jest.fn()}
        />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('when account data is already selected', async () => {
    const { container } = render(
      <TestWrapper
        queryParams={{
          accountIdentifier: 'account',
          orgIdentifier: 'org',
          projectIdentifier: 'project'
        }}
      >
        <PolicySetListRenderer
          loading={false}
          error={null}
          refetch={jest.fn()}
          newPolicySetIds={['account.test']}
          setNewPolicySetIds={jest.fn}
          policySetList={[
            {
              name: 'test',
              identifier: 'test',
              account_id: 'account',
              updated: 1234
            }
          ]}
          selectedTabId={PolicySetType.ACCOUNT}
          showModal={jest.fn()}
        />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()

    const input = container.getElementsByTagName('input')[0]
    expect(input).toBeDefined()
    expect(input).toHaveAttribute('checked')

    act(async () => {
      fireEvent.click(input)
      await waitFor(() => expect(input).not.toHaveAttribute('checked'))
    })
  })

  test('when org data is already selected', async () => {
    const { container } = render(
      <TestWrapper
        queryParams={{
          accountIdentifier: 'account',
          orgIdentifier: 'org',
          projectIdentifier: 'project'
        }}
      >
        <PolicySetListRenderer
          loading={false}
          error={null}
          refetch={jest.fn()}
          newPolicySetIds={['org.test']}
          setNewPolicySetIds={jest.fn}
          policySetList={[
            {
              name: 'test',
              identifier: 'test',
              account_id: 'account',
              org_id: 'org',
              updated: 1234
            }
          ]}
          selectedTabId={PolicySetType.ORG}
          showModal={jest.fn()}
        />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()

    const input = container.getElementsByTagName('input')[0]
    expect(input).toBeDefined()
    expect(input).toHaveAttribute('checked')

    act(async () => {
      fireEvent.click(input)
      await waitFor(() => expect(input).not.toHaveAttribute('checked'))
    })
  })

  test('when project data is already selected', async () => {
    const { container } = render(
      <TestWrapper
        queryParams={{
          accountIdentifier: 'account',
          orgIdentifier: 'org',
          projectIdentifier: 'project'
        }}
      >
        <PolicySetListRenderer
          loading={false}
          error={null}
          refetch={jest.fn()}
          newPolicySetIds={['test']}
          setNewPolicySetIds={jest.fn}
          policySetList={[
            {
              name: 'test',
              identifier: 'test',
              account_id: 'account',
              org_id: 'org',
              project_id: 'project',
              updated: 1234
            }
          ]}
          selectedTabId={PolicySetType.PROJECT}
          showModal={jest.fn()}
        />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()

    const input = container.getElementsByTagName('input')[0]
    expect(input).toBeDefined()
    expect(input).toHaveAttribute('checked')

    act(async () => {
      fireEvent.click(input)
      await waitFor(() => expect(input).not.toHaveAttribute('checked'))
    })
  })

  test('when no data is selected', async () => {
    const { container } = render(
      <TestWrapper
        queryParams={{
          accountIdentifier: 'account',
          orgIdentifier: 'org',
          projectIdentifier: 'project'
        }}
      >
        <PolicySetListRenderer
          loading={false}
          error={null}
          refetch={jest.fn()}
          newPolicySetIds={[]}
          setNewPolicySetIds={jest.fn}
          policySetList={[
            {
              name: 'test',
              identifier: 'test',
              account_id: 'account',
              updated: 1234
            }
          ]}
          selectedTabId={PolicySetType.ACCOUNT}
          showModal={jest.fn()}
        />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()

    const input = container.getElementsByTagName('input')[0]
    expect(input).toBeDefined()
    expect(input).not.toHaveAttribute('checked')

    act(async () => {
      fireEvent.click(input)
      await waitFor(() => expect(input).toHaveAttribute('checked'))
    })
  })
})
