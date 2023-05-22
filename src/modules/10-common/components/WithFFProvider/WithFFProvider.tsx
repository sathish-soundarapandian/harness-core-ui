/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { FFContextProvider } from '@harnessio/ff-react-client-sdk'
import { PageSpinner } from '@harness/uicore'

interface WithFFProviderProps {
  featureFlagsToken?: string
  children: JSX.Element
  config: {
    identifier: string
    experimentKey: string | string[]
  }
  fallback: JSX.Element
}
function WithFFProvider({ featureFlagsToken, children, config, fallback }: WithFFProviderProps): JSX.Element {
  const [hasError, setHasError] = useState(false)
  const onError = (): void => {
    setHasError(true)
  }
  return hasError ? (
    fallback
  ) : featureFlagsToken ? (
    <FFContextProvider
      apiKey={featureFlagsToken as string}
      target={{
        identifier: config.identifier,
        attributes: {
          experiment: config.experimentKey
        }
      }}
      fallback={<PageSpinner />}
      onError={onError}
    >
      {children}
    </FFContextProvider>
  ) : (
    children
  )
}

export default WithFFProvider
