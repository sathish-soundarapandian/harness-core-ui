import React from 'react'
import { act, fireEvent, render } from '@testing-library/react'
import { createFavorite, deleteFavorite } from '@harnessio/react-ng-manager-client'
import { TestWrapper } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import FavoriteStar from '../FavoriteStar'

const testAccountId = 'testAccountId'

jest.mock('@harnessio/react-ng-manager-client')
const createFavoriteMock = createFavorite as jest.MockedFunction<any>
createFavoriteMock.mockImplementation(() => {
  return Promise.resolve(true)
})

const deleteFavoriteMock = deleteFavorite as jest.MockedFunction<any>
deleteFavoriteMock.mockImplementation(() => {
  return Promise.resolve(true)
})

describe('test favorite star', () => {
  test('simple render', () => {
    const { container } = render(
      <TestWrapper path={routes.toConnectors({ accountId: testAccountId })} pathParams={{ accountId: testAccountId }}>
        <FavoriteStar resourceId="testResourceId" resourceType="CONNECTOR" />
      </TestWrapper>
    )
    expect(container.querySelector('[data-icon="star-empty"]')).not.toBeNull()
  })

  test('click on empty star', async () => {
    const { container } = render(
      <TestWrapper path={routes.toConnectors({ accountId: testAccountId })} pathParams={{ accountId: testAccountId }}>
        <FavoriteStar resourceId="testResourceId" resourceType="CONNECTOR" />
      </TestWrapper>
    )
    const star = container.querySelector('[data-icon="star-empty"]')
    await act(() => {
      fireEvent.click(star!)
    })
    expect(container.querySelector('[data-icon="star"]')).not.toBeNull()
  })

  test('click on empty star and API fails', async () => {
    const mock = createFavorite as jest.MockedFunction<any>
    mock.mockImplementation(() => {
      return Promise.resolve(false)
    })

    const { container } = render(
      <TestWrapper path={routes.toConnectors({ accountId: testAccountId })} pathParams={{ accountId: testAccountId }}>
        <FavoriteStar resourceId="testResourceId" resourceType="CONNECTOR" />
      </TestWrapper>
    )
    const star = container.querySelector('[data-icon="star-empty"]')
    await act(() => {
      fireEvent.click(star!)
    })
    expect(container.querySelector('[data-icon="star"]')).toBeNull()
  })

  test('click on filled star and API fails', async () => {
    const mock = deleteFavorite as jest.MockedFunction<any>
    mock.mockImplementation(() => {
      return Promise.resolve(false)
    })

    const { container } = render(
      <TestWrapper path={routes.toConnectors({ accountId: testAccountId })} pathParams={{ accountId: testAccountId }}>
        <FavoriteStar resourceId="testResourceId" resourceType="CONNECTOR" isFavorite />
      </TestWrapper>
    )
    const star = container.querySelector('[data-icon="star"]')
    await act(() => {
      fireEvent.click(star!)
    })
    expect(container.querySelector('[data-icon="star-empty"]')).toBeNull()
  })

  test('click on filled star', () => {
    const { container } = render(
      <TestWrapper path={routes.toConnectors({ accountId: testAccountId })} pathParams={{ accountId: testAccountId }}>
        <FavoriteStar resourceId="testResourceId" resourceType="CONNECTOR" isFavorite />
      </TestWrapper>
    )
    const star = container.querySelector('[data-icon="star"]')
    fireEvent.click(star!)
    expect(container.querySelector('[data-icon="star-empty"]')).not.toBeNull()
  })
})
