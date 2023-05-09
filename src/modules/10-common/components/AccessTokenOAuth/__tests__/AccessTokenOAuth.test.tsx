/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { screen, render, fireEvent, waitFor, findByText, act } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { accountPathProps } from '@common/utils/routeUtils'
import routes from '@common/RouteDefinitions'
import AccessTokenOAuth, { supportedProviders } from '../AccessTokenOAuth'

const pathParams = { accountId: 'dummy' }
const refetchUserSCMMock = jest.fn(() => Promise.resolve())
const mockCreateUserSCM = jest.fn()
jest.useFakeTimers()

jest.mock('services/cd-ng', () => ({
  useSaveUserSourceCodeManager: jest.fn().mockImplementation(() => ({ mutate: mockCreateUserSCM }))
}))

jest.spyOn(global, 'fetch').mockImplementation(() => {
  return Promise.resolve({
    text: () => Promise.resolve('https://gitlab.com/login')
  } as Response)
})

describe('AccessTokenOAuth test suite', () => {
  test('Select a provider and save accessToken should show error for Oauth', async () => {
    const { container, getByText } = render(
      <TestWrapper path={routes.toUserProfile(accountPathProps)} pathParams={pathParams}>
        <AccessTokenOAuth refetch={refetchUserSCMMock} providersWithTokenAvailble={[]} />
      </TestWrapper>
    )

    expect(getByText('common.oAuth.connectToGitProviderPlaceholder')).toBeInTheDocument()
    const dropdown = container.querySelector('[data-icon="main-chevron-down"]') as HTMLInputElement
    expect(refetchUserSCMMock).not.toBeCalled()
    fireEvent.click(dropdown)
    expect(document.querySelector('ul.bp3-menu')?.children?.length).toEqual(supportedProviders.length)

    await waitFor(() => {
      expect(getByText('common.repo_provider.githubLabel')).toBeInTheDocument()
      expect(getByText('common.repo_provider.gitlabLabel')).toBeInTheDocument()
      expect(getByText('common.repo_provider.bitbucketLabel')).toBeInTheDocument()
    })

    const githubSelect = await findByText(document.body, 'common.repo_provider.githubLabel')

    act(() => {
      fireEvent.click(githubSelect)
    })
    expect(getByText('common.connect')).toBeInTheDocument()
    fireEvent.click(getByText('common.connect'))
    expect(global.fetch).toBeCalled()

    // Connect should get hidden while Oauth in progress
    expect(screen.queryByText('common.connect')).not.toBeInTheDocument()
    expect(screen.queryByText('common.OAuthTryAgain')).not.toBeInTheDocument()

    // Todo: Need to mock onMessage event from the other tab
    // window.dispatchEvent(
    //   new Event('message', {
    //     bubbles: true,
    //     cancelable: false,
    //     origin: window.location?.origin,
    //     data: {
    //       status: 'success',
    //       accessTokenRef: 'account.mock_token',
    //       refreshTokenRef: 'placeholder'
    //     }
    //   } as EventInit)
    // )
  })

  test('Select a provider and save accessToken should show error for OauthFailure', async () => {
    const timeoutSpy = jest.spyOn(window, 'setTimeout')
    const { container, getByText } = render(
      <TestWrapper path={routes.toUserProfile(accountPathProps)} pathParams={pathParams}>
        <AccessTokenOAuth refetch={refetchUserSCMMock} providersWithTokenAvailble={[]} />
      </TestWrapper>
    )

    expect(getByText('common.oAuth.connectToGitProviderPlaceholder')).toBeInTheDocument()
    const dropdown = container.querySelector('[data-icon="main-chevron-down"]') as HTMLInputElement
    expect(refetchUserSCMMock).not.toBeCalled()
    fireEvent.click(dropdown)
    const githubSelect = await findByText(document.body, 'common.repo_provider.githubLabel')

    act(() => {
      fireEvent.click(githubSelect)
    })

    expect(getByText('common.connect')).toBeInTheDocument()
    fireEvent.click(getByText('common.connect'))

    expect(global.fetch).toBeCalled()
    jest.runAllTimers()
    expect(timeoutSpy).toBeCalled()
    // Try again and connect should be availble to user after failure
    expect(getByText('common.OAuthTryAgain')).toBeInTheDocument()
    expect(getByText('common.connect')).toBeInTheDocument()
  })

  test('For already added providers Oauth should not be triggered', async () => {
    const { container, getByText } = render(
      <TestWrapper path={routes.toUserProfile(accountPathProps)} pathParams={pathParams}>
        <AccessTokenOAuth refetch={refetchUserSCMMock} providersWithTokenAvailble={['GITHUB']} />
      </TestWrapper>
    )

    expect(getByText('common.oAuth.connectToGitProviderPlaceholder')).toBeInTheDocument()
    const dropdown = container.querySelector('[data-icon="main-chevron-down"]') as HTMLInputElement
    expect(refetchUserSCMMock).not.toBeCalled()
    fireEvent.click(dropdown)

    const githubSelect = await findByText(document.body, 'common.repo_provider.githubLabel')

    act(() => {
      fireEvent.click(githubSelect)
    })
    //Connect or Try again should not appear
    expect(screen.queryByText('common.connect')).not.toBeInTheDocument()
    expect(screen.queryByText('common.OAuthTryAgain')).not.toBeInTheDocument()
  })
})
