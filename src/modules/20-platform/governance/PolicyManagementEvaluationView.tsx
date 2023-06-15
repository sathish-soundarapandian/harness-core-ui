/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { lazy, FC } from 'react'
import { useRouteMatch } from 'react-router-dom'
// eslint-disable-next-line no-restricted-imports
import ChildComponentMounter from 'microfrontends/ChildComponentMounter'
import { customHooks, customComponents } from './GovernanceCustomMicroFrontendProps'
import type { RouteMatch } from './GovernanceCustomMicroFrontendProps'
import type { GovernanceCustomMicroFrontendProps } from './GovernanceCustomMicroFrontendProps.types'

// eslint-disable-next-line import/no-unresolved
const RemoteEvaluationView = lazy(() => import('governance/EvaluationView'))

export const PolicyManagementEvaluationView: FC<any> = (props: any) => {
  const { path }: RouteMatch = useRouteMatch()
  return (
    <ChildComponentMounter<GovernanceCustomMicroFrontendProps>
      ChildComponent={RemoteEvaluationView}
      customHooks={customHooks}
      customComponents={customComponents}
      baseRoutePath={path}
      {...props}
    />
  )
}
