/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { PropsWithChildren, ReactElement, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { FFContextProvider, FFContextProviderProps } from '@harnessio/ff-react-client-sdk'
import { PageSpinner } from '@harness/uicore'

export function FeatureFlagsProvider({ children }: PropsWithChildren<unknown>): ReactElement {
  const { useLegacyFeatureFlags, sdkKey, baseUrl, enableStream: streamEnabled, async } = window.featureFlagsConfig
  const { accountId } = useParams<Record<string, string>>()

  const target = useMemo<FFContextProviderProps['target']>(
    () => ({
      identifier: accountId,
      name: accountId
    }),
    [accountId]
  )

  if (useLegacyFeatureFlags) {
    return <>{children}</>
  }

  return (
    <FFContextProvider
      async={async}
      apiKey={sdkKey}
      target={target}
      options={{ baseUrl, streamEnabled }}
      fallback={<PageSpinner />}
    >
      {children}
    </FFContextProvider>
  )
}
