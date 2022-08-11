/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor, queryByText, fireEvent, queryAllByText } from '@testing-library/react'
import { renderHook } from '@testing-library/react-hooks'
import { useStrings } from 'framework/strings'
import { TestWrapper } from '@common/utils/testUtils'
import * as usePermission from '@rbac/hooks/usePermission'
import routes from '@common/RouteDefinitions'
import { pipelinePathProps } from '@common/utils/routeUtils'
import { GetTriggerResponse } from './webhookMockResponses'
import { GetPipelineResponse, GetTriggerListForTargetResponse } from './sharedMockResponses'
import { PipelineResponse as PipelineDetailsMockResponse } from './PipelineDetailsMocks'
import TriggersPage from '../TriggersPage'

const mockDelete = jest.fn().mockReturnValue(Promise.resolve({ data: {}, status: {} }))
const mockUpdateTrigger = jest.fn().mockReturnValue(Promise.resolve({ data: {}, status: {} }))
const mockGetTriggersFunction = jest.fn()
jest.mock('services/pipeline-ng', () => ({
  useGetPipeline: jest.fn(() => GetPipelineResponse),
  useGetPipelineSummary: jest.fn(() => PipelineDetailsMockResponse),
  useGetTriggerListForTarget: jest.fn(args => {
    mockGetTriggersFunction(args)
    return GetTriggerListForTargetResponse
  }),
  useGetTrigger: jest.fn(() => GetTriggerResponse),
  useDeleteTrigger: jest.fn().mockImplementation(() => ({ mutate: mockDelete })),
  useUpdateTrigger: jest.fn().mockImplementation(() => ({ mutate: mockUpdateTrigger }))
}))

const wrapper = ({ children }: React.PropsWithChildren<unknown>): React.ReactElement => (
  <TestWrapper>{children}</TestWrapper>
)
const { result } = renderHook(() => useStrings(), { wrapper })

function WrapperComponent(): JSX.Element {
  return (
    <TestWrapper
      path={routes.toTriggersPage({ ...pipelinePathProps, module: ':module' })}
      pathParams={{
        projectIdentifier: 'projectIdentifier',
        orgIdentifier: 'orgIdentifier',
        accountId: 'accountId',
        pipelineIdentifier: 'pipelineIdentifier',
        module: 'cd'
      }}
    >
      <TriggersPage />
    </TestWrapper>
  )
}

describe('TriggersPage Triggers tests', () => {
  describe('Renders/snapshots', () => {
    test('Initial Render - Shows Trigger List', async () => {
      render(<WrapperComponent />)
      await waitFor(() => expect(result.current.getString('common.triggerLabel').toUpperCase()).not.toBeNull())
      // eslint-disable-next-line no-document-body-snapshot
      expect(document.body).toMatchSnapshot()
    })
    test('Initial Render - New Triggers Drawer', async () => {
      const { container } = render(
        <TestWrapper>
          <TriggersPage />
        </TestWrapper>
      )
      await waitFor(() => expect(result.current.getString('common.triggerLabel').toUpperCase()).not.toBeNull())
      const addTriggerButton = queryByText(container, result.current.getString('triggers.newTrigger'))
      if (!addTriggerButton) {
        throw Error('No action button')
      }
      fireEvent.click(addTriggerButton)
      // eslint-disable-next-line no-document-body-snapshot
      expect(document.body).toMatchSnapshot()
    })
  })
  describe('Interactivity', () => {
    test('Delete a trigger', async () => {
      const { container } = render(<WrapperComponent />)
      jest.spyOn(usePermission, 'usePermission').mockImplementation(() => [true])
      await waitFor(() => expect(result.current.getString('common.triggerLabel').toUpperCase()).not.toBeNull())
      const firstActionButton = container.querySelectorAll('[class*="actionButton"]')?.[0]
      if (!firstActionButton) {
        throw Error('No action button')
      }
      fireEvent.click(firstActionButton)

      const deleteButton = queryByText(document.body, result.current.getString('delete'))

      if (!deleteButton) {
        throw Error('No error button')
      }
      fireEvent.click(deleteButton)
      await waitFor(() => expect(result.current.getString('triggers.confirmDelete')).not.toBeNull())
      const confirmDeleteButton = document.body.querySelector('[class*="dialog"] [class*="intent-danger"]')
      if (!confirmDeleteButton) {
        throw Error('No error button')
      }
      fireEvent.click(confirmDeleteButton)

      expect(mockDelete).toBeCalledWith('AllValues', { headers: { 'content-type': 'application/json' } })
    })

    test('Edit a trigger redirects to Trigger Wizard', async () => {
      jest.spyOn(usePermission, 'usePermission').mockImplementation(() => [true])

      const { container, getByTestId } = render(<WrapperComponent />)
      await waitFor(() => expect(result.current.getString('common.triggerLabel').toUpperCase()).not.toBeNull())
      const firstActionButton = container.querySelectorAll('[class*="actionButton"]')?.[0]
      if (!firstActionButton) {
        throw Error('No action button')
      }
      fireEvent.click(firstActionButton)

      const editButton = queryAllByText(document.body, 'edit')[0]

      if (!editButton) {
        throw Error('No edit button')
      }
      fireEvent.click(editButton)
      expect(getByTestId('location')).toMatchInlineSnapshot(`
        <div
          data-testid="location"
        >
          /account/accountId/cd/orgs/orgIdentifier/projects/projectIdentifier/pipelines/pipelineIdentifier/triggers/AllValues
        </div>
      `)
    })

    // eslint-disable-next-line jest/no-disabled-tests
    test.skip('Add a trigger redirects to Trigger Wizard', async () => {
      const { container, getByTestId } = render(
        <TestWrapper>
          <TriggersPage />
        </TestWrapper>
      )
      await waitFor(() => expect(result.current.getString('common.triggerLabel').toUpperCase()).not.toBeNull())
      const addTriggerButton = queryByText(container, result.current.getString('triggers.newTrigger'))
      if (!addTriggerButton) {
        throw Error('No action button')
      }
      fireEvent.click(addTriggerButton)

      expect(getByTestId('location')).toMatchInlineSnapshot()
    })

    test('Search for a trigger shows filtered results', async () => {
      const { container } = render(<WrapperComponent />)
      await waitFor(() => expect(result.current.getString('common.triggerLabel').toUpperCase()).not.toBeNull())
      const searchInput = container.querySelector('[data-name="search"]')
      if (!searchInput) {
        throw Error('No search input')
      }
      fireEvent.change(searchInput, { target: { value: 'test1' } })

      expect(mockGetTriggersFunction).toBeCalledWith({
        debounce: 300,
        queryParams: {
          projectIdentifier: 'projectIdentifier',
          orgIdentifier: 'orgIdentifier',
          accountIdentifier: 'accountId',
          targetIdentifier: 'pipelineIdentifier',
          searchTerm: 'test1'
        }
      })
    })
  })
})
