/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { lazy, FC } from 'react'
import { useRouteMatch } from 'react-router-dom'
import ChildAppMounter from 'microfrontends/ChildAppMounter'
import type { GovernanceCustomMicroFrontendProps } from './GovernanceCustomMicroFrontendProps.types'
import { customComponents, customHooks, RouteMatch } from './GovernanceCustomMicroFrontendProps'

// eslint-disable-next-line import/no-unresolved
const RemoteGovernanceApp = lazy(() => import('governance/App'))
// eslint-disable-next-line import/no-unresolved
const RemotePipelineGovernanceView = lazy(() => import('governance/PipelineGovernanceView'))
// eslint-disable-next-line import/no-unresolved
const RemotePolicySetWizard = lazy(() => import('governance/PolicySetWizard'))

/*
 * Would like to change these baseRoutePath and accountId props to use the default
 * renderUrl.
 */
const PolicyManagementMFE: FC = props => {
  const { path }: RouteMatch = useRouteMatch()
  return (
    <ChildAppMounter<GovernanceCustomMicroFrontendProps>
      ChildApp={RemoteGovernanceApp}
      customHooks={customHooks}
      customComponents={customComponents}
      baseRoutePath={path}
      {...props}
    />
  )
}

export const PolicyManagementPipelineView: FC<any> = (props: any) => {
  const { path }: RouteMatch = useRouteMatch()
  return (
    <ChildAppMounter<GovernanceCustomMicroFrontendProps>
      ChildApp={RemoteGovernanceApp}
      customHooks={customHooks}
      customComponents={customComponents}
      baseRoutePath={path}
    >
      <RemotePipelineGovernanceView {...props} />
    </ChildAppMounter>
  )
}

export const PolicyManagementPolicySetWizard: FC<any> = (props: any) => {
  const { path }: RouteMatch = useRouteMatch()
  return (
    <ChildAppMounter<GovernanceCustomMicroFrontendProps>
      ChildApp={RemoteGovernanceApp}
      customHooks={customHooks}
      customComponents={customComponents}
      baseRoutePath={path}
    >
      <RemotePolicySetWizard {...props} />
    </ChildAppMounter>
  )
}

export default PolicyManagementMFE
