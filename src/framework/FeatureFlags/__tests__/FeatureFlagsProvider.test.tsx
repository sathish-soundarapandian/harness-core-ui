/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, RenderResult, screen } from '@testing-library/react'
import * as ffSDK from '@harnessio/ff-react-client-sdk'
import { FeatureFlagsProvider } from '../FeatureFlagsProvider'

// eslint-disable-next-line jest-no-mock
jest.mock('react-router-dom', () => ({
  useParams: jest.fn().mockReturnValue({ accountId: 'accountId' })
}))

jest.mock('@harnessio/ff-react-client-sdk')

const renderComponent = (config: Partial<Window['featureFlagsConfig']> = {}): RenderResult => {
  window.featureFlagsConfig = {
    ...{
      useLegacyFeatureFlags: true,
      sdkKey: 'SDK_KEY',
      baseUrl: 'https://url.com',
      enableStream: false,
      async: true
    },
    ...config
  }

  return render(
    <FeatureFlagsProvider>
      <span data-testid="child">Child</span>
    </FeatureFlagsProvider>
  )
}

describe('FeatureFlagsProvider', () => {
  const ffContextProviderMock = jest
    .spyOn(ffSDK, 'FFContextProvider')
    .mockImplementation(({ children }) => <span data-testid="ff-context-provider">{children}</span>)

  beforeEach(jest.clearAllMocks)

  test('it should render only the child when useLegacyFeatureFlags is true', async () => {
    renderComponent({ useLegacyFeatureFlags: true })

    expect(screen.getByTestId('child')).toBeInTheDocument()
    expect(screen.queryByTestId('ff-context-provider')).not.toBeInTheDocument()
  })

  test('it should render the child within the FFContentProvider when useLegacyFeatureFlags is false', async () => {
    renderComponent({ useLegacyFeatureFlags: false })

    expect(screen.getByTestId('child')).toBeInTheDocument()
    expect(screen.getByTestId('ff-context-provider')).toBeInTheDocument()
  })

  test('it should pass on the async, apiKey, baseUrl and streamEnabled vars to the SDK', async () => {
    const config = {
      useLegacyFeatureFlags: false,
      async: true,
      sdkKey: 'TEST KEY',
      baseUrl: 'https://test.base.url',
      enableStream: true
    }

    renderComponent(config)

    expect(ffContextProviderMock).toHaveBeenCalledWith(
      expect.objectContaining({
        apiKey: config.sdkKey,
        async: config.async,
        options: expect.objectContaining({
          baseUrl: config.baseUrl,
          streamEnabled: config.enableStream
        })
      }),
      {}
    )
  })

  test('it should construct and pass on the target to the SDK', async () => {
    renderComponent({ useLegacyFeatureFlags: false })

    expect(ffContextProviderMock).toHaveBeenCalledWith(
      expect.objectContaining({
        target: {
          identifier: 'accountId',
          name: 'accountId'
        }
      }),
      {}
    )
  })
})
