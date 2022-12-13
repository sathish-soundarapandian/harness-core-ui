/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

/* eslint-disable import/no-unresolved */
import React, { lazy } from 'react'
import { customComponents, customFunctions, customHooks } from '@sscs/utils/SSCSChildAppUtils'
import type { SSCSCustomMicroFrontendProps } from '@sscs/interfaces/SSCSCustomMicroFrontendProps.types'
import ChildAppMounter from 'microfrontends/ChildAppMounter'

const RemoteSSCSApp = lazy(() => import('sscs/MicroFrontendApp'))

export const SSCSApp = (): React.ReactElement => (
  <ChildAppMounter<SSCSCustomMicroFrontendProps>
    ChildApp={RemoteSSCSApp}
    customComponents={customComponents}
    customFunctions={customFunctions}
    customHooks={customHooks}
  />
)

export const SSCSComponentMap = {
  SSCSStage: lazy(() => import('sscs/SSCSStage'))
}

export const SSCSComponentMounter = <T,>(props: {
  component: keyof typeof SSCSComponentMap
  childProps: T
}): React.ReactElement => {
  const { component, childProps, ...rest } = props
  const Component = SSCSComponentMap[component]
  return (
    <ChildAppMounter<SSCSCustomMicroFrontendProps>
      ChildApp={RemoteSSCSApp}
      customComponents={customComponents}
      customFunctions={customFunctions}
      customHooks={customHooks}
      {...rest}
    >
      <Component {...childProps} />
    </ChildAppMounter>
  )
}
