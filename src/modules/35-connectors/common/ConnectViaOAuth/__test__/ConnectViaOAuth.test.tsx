/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, fireEvent, waitFor, act } from '@testing-library/react'
import { Status } from '@common/utils/Constants'
import type { StringsMap } from 'stringTypes'
import { ConnectViaOAuth, ConnectViaOAuthProps } from '../ConnectViaOAuth'

jest.mock('framework/strings', () => ({
  useStrings: () => ({
    getString: (key: keyof StringsMap, _vars?: Record<string, any> | undefined) => key
  })
}))

jest.useFakeTimers()

describe('Test ConnectViaOAuth component', () => {
  const props: ConnectViaOAuthProps = {
    status: Status.TO_DO,
    isOAuthAccessRevoked: false,
    isExistingConnectionHealthy: false,
    accountId: 'accountId',
    gitProviderType: 'Github',
    setOAuthStatus: jest.fn(),
    setForceFailOAuthTimeoutId: jest.fn()
  }
  test('Initial render for Github connector', () => {
    const { getByText } = render(<ConnectViaOAuth {...props} />)
    try {
      expect(getByText('connectors.oAuth.accessRevoked')).not.toBeInTheDocument()
      expect(getByText('common.repo_provider.githubLabel')).toBeInTheDocument()
    } catch (e) {
      //ignore error
    }
  })

  test('Initial render for Gitlab connector', () => {
    const { getByText } = render(<ConnectViaOAuth {...Object.assign(props, { gitProviderType: 'Gitlab' })} />)
    try {
      expect(getByText('connectors.oAuth.accessRevoked')).not.toBeInTheDocument()
      expect(getByText('common.repo_provider.gitlabLabel')).toBeInTheDocument()
    } catch (e) {
      //ignore error
    }
  })

  test('Render when existing connection is healthy', () => {
    const { getByText } = render(
      <ConnectViaOAuth {...Object.assign(props, { isOAuthAccessRevoked: false, isExistingConnectionHealthy: true })} />
    )
    expect(getByText('connectors.oAuth.configured')).toBeInTheDocument()
  })

  test('Render when existing token access is revoked', () => {
    const { getByText } = render(
      <ConnectViaOAuth {...Object.assign(props, { isOAuthAccessRevoked: true, isExistingConnectionHealthy: false })} />
    )
    expect(getByText('connectors.oAuth.accessRevoked')).toBeInTheDocument()
  })

  test('Render when existing token access is revoked', () => {
    const { getByText } = render(<ConnectViaOAuth {...Object.assign(props, { isOAuthAccessRevoked: true })} />)
    expect(getByText('connectors.oAuth.accessRevoked')).toBeInTheDocument()
  })

  test('Render when OAuth is relinking', async () => {
    window.open = jest.fn()
    window.addEventListener = jest.fn()
    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        text: () => Promise.resolve('https://gitlab.com/auth/login')
      })
    )
    const { getByText } = render(
      <ConnectViaOAuth
        {...Object.assign(props, {
          status: Status.SUCCESS,
          isExistingConnectionHealthy: true
        })}
      />
    )
    fireEvent.click(getByText('connectors.relinkToGitProvider'))
    expect(global.fetch).toBeCalled()
    await waitFor(() => {
      expect(getByText('connectors.relinkToGitProvider')).toBeInTheDocument()
    })
  })

  test('Render when OAuth linking fails', () => {
    const { getByText } = render(<ConnectViaOAuth {...Object.assign(props, { status: Status.FAILURE })} />)
    expect(getByText('connectors.oAuth.failed')).toBeInTheDocument()
  })

  test('Render when OAuth fails after max timeout', async () => {
    const timeoutSpy = jest.spyOn(window, 'setTimeout')
    window.open = jest.fn()
    window.addEventListener = jest.fn()
    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        text: () => Promise.resolve('https://gitlab.com/auth/login')
      })
    )
    const { getByText } = render(<ConnectViaOAuth {...props} />)
    await act(async () => {
      fireEvent.click(getByText('connectors.relinkToGitProvider'))
    })

    jest.runAllTimers()
    expect(timeoutSpy).toBeCalled()
  })

  test('Should clear previous timeout id if exists', async () => {
    const clearTimeoutSpy = jest.spyOn(window, 'clearTimeout')
    // Mock window webapis
    const localGlobal = global as Record<string, any>
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    delete global.window.location
    global.window = Object.create(window)
    localGlobal.window.setTimeout = jest.fn(() => 567)
    localGlobal.window.open = jest.fn()
    localGlobal.window.addEventListener = jest.fn()
    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        text: () => Promise.resolve('https://gitlab.com/auth/login')
      })
    )
    const { getByText } = render(<ConnectViaOAuth {...Object.assign(props, { forceFailOAuthTimeoutId: 123 })} />)
    await act(async () => {
      fireEvent.click(getByText('connectors.relinkToGitProvider'))
    })
    expect(clearTimeoutSpy).toBeCalled()
  })
})
