/* eslint-disable import/no-unresolved */
import React, { lazy } from 'react'
import { customComponents, customFunctions, customHooks } from '@iac/utils/IacChildAppUtils'
import type { IacCustomMicroFrontendProps } from '@iac/interfaces/IacCustomMicroFrontendProps.types'
import ChildAppMounter from 'microfrontends/ChildAppMounter'

const RemoteIacApp = lazy(() => import('iac/MicroFrontendApp'))

export const IacApp = (props: any): React.ReactElement => (
  <ChildAppMounter<IacCustomMicroFrontendProps>
    ChildApp={RemoteIacApp}
    customComponents={customComponents}
    customFunctions={customFunctions}
    customHooks={customHooks}
    {...props}
  />
)

export const IacComponentMap = {
  IacStage: lazy(() => import('iac/IacStage'))
}

export const IacComponentMounter = <T,>(props: {
  component: keyof typeof IacComponentMap
  childProps: T
}): React.ReactElement => {
  const { component, childProps, ...rest } = props
  const Component = IacComponentMap[component]
  return (
    <ChildAppMounter<IacCustomMicroFrontendProps>
      ChildApp={RemoteIacApp}
      customComponents={customComponents}
      customFunctions={customFunctions}
      customHooks={customHooks}
      {...rest}
    >
      <Component {...childProps} />
    </ChildAppMounter>
  )
}
