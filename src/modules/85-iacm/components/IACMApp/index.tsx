/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

/* eslint-disable import/no-unresolved */
import React, { lazy } from 'react'
import { customComponents, customFunctions, customHooks } from '@iacm/utils/IACMChildAppUtils'
import type { IACMCustomMicroFrontendProps } from '@iacm/interfaces/IACMCustomMicroFrontendProps.types'
import ChildAppMounter from 'microfrontends/ChildAppMounter'

const RemoteIACMApp = lazy(() => import('iacm/MicroFrontendApp'))

export const IACMApp = (): React.ReactElement => (
  <ChildAppMounter<IACMCustomMicroFrontendProps>
    ChildApp={RemoteIACMApp}
    customComponents={customComponents}
    customFunctions={customFunctions}
    customHooks={customHooks}
  />
)

export const IACMComponentMap = {
  IACMStage: lazy(() => import('iacm/IACMStage'))
}

export const IACMComponentMounter = <T,>(props: {
  component: keyof typeof IACMComponentMap
  childProps: T
}): React.ReactElement => {
  const { component, childProps, ...rest } = props
  const Component = IACMComponentMap[component]
  return (
    <ChildAppMounter<IACMCustomMicroFrontendProps>
      ChildApp={RemoteIACMApp}
      customComponents={customComponents}
      customFunctions={customFunctions}
      customHooks={customHooks}
      {...rest}
    >
      <Component {...childProps} />
    </ChildAppMounter>
  )
}
