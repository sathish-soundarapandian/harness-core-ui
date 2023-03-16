import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { TestWrapper } from '@common/utils/testUtils'

import EntityUsageListingPage from '../EntityUsageListingPage'

import referencedDataWithDetails from './entity-usage-connector-data.json'

describe('Entity Usage Listing Page', () => {
  test('should show spinner when loading', () => {
    render(
      <TestWrapper>
        <EntityUsageListingPage
          withSearchBarInPageHeader
          apiReturnProps={{ data: {}, loading: true, error: {}, refetch: jest.fn() }}
          setPage={jest.fn()}
          setSearchTerm={jest.fn()}
        />
      </TestWrapper>
    )
    expect(screen.getByTestId('page-spinner')).toBeVisible()
  })

  test('should show error', async () => {
    const refetchMock = jest.fn()
    render(
      <TestWrapper>
        <EntityUsageListingPage
          withSearchBarInPageHeader={false}
          apiReturnProps={{ data: {}, loading: false, error: { message: 'Failed to fetch' }, refetch: refetchMock }}
          setPage={jest.fn()}
          setSearchTerm={jest.fn()}
        />
      </TestWrapper>
    )
    expect(screen.queryByRole('searchbox')).toBeNull()
    expect(screen.getByText('Failed to fetch')).toBeVisible()
    await userEvent.click(screen.getByRole('button'))
    expect(refetchMock).toHaveBeenCalled()
  })

  test('should render complete data & should signal next page traversing and search', async () => {
    const setPageMock = jest.fn()
    const setSearchTermMock = jest.fn()

    render(
      <TestWrapper>
        <EntityUsageListingPage
          withSearchBarInPageHeader
          apiReturnProps={{
            data: referencedDataWithDetails as any,
            loading: false,
            error: {},
            refetch: jest.fn()
          }}
          setPage={setPageMock}
          setSearchTerm={setSearchTermMock}
        />
      </TestWrapper>
    )

    // wait for page load
    await waitFor(() => expect(screen.getByText('Showing 3 per page')).toBeVisible())
    expect(screen.getByText('(1 - 3) of 4')).toBeVisible()

    // signal traverse to next page
    const buttons = screen.getAllByRole('button')
    userEvent.click(buttons[3])

    expect(setPageMock).toHaveBeenCalledWith(1)

    // signal search query
    userEvent.type(screen.getByRole('searchbox'), 'test   ')

    await waitFor(() => expect(setSearchTermMock).toHaveBeenCalledWith('test'))
    // do not need await here. If setSearchTermMock has been called, then so has setPageMock
    expect(setPageMock).toHaveBeenLastCalledWith(0)
  })

  test('should render complete data & should signal next page traversing and search - not in header', async () => {
    const setPageMock = jest.fn()
    const setSearchTermMock = jest.fn()

    render(
      <TestWrapper>
        <EntityUsageListingPage
          withSearchBarInPageHeader={false}
          apiReturnProps={{
            data: referencedDataWithDetails as any,
            loading: false,
            error: {},
            refetch: jest.fn()
          }}
          searchTerm={'t'}
          setPage={setPageMock}
          setSearchTerm={setSearchTermMock}
        />
      </TestWrapper>
    )

    // wait for page load
    await waitFor(() => expect(screen.getByText('Showing 3 per page')).toBeVisible())
    expect(screen.getByText('(1 - 3) of 4')).toBeVisible()

    // signal traverse to next page
    const buttons = screen.getAllByRole('button')
    userEvent.click(buttons[3])

    expect(setPageMock).toHaveBeenCalledWith(1)

    // signal search query
    userEvent.type(screen.getByRole('searchbox'), 'test   ')

    await waitFor(() => expect(setSearchTermMock).toHaveBeenCalledWith('test'))
    // do not need await here. If setSearchTermMock has been called, then so has setPageMock
    expect(setPageMock).toHaveBeenLastCalledWith(0)
  })
})
