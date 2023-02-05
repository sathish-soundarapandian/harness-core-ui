/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import routes from '@common/RouteDefinitions'
import { RouteWithLayout } from '@common/router'
import { accountPathProps } from '@common/utils/routeUtils'
import ChildAppMounter from 'microfrontends/ChildAppMounter'
import { MinimalLayout } from '@common/layouts'
import './idp.module.scss'

// eslint-disable-next-line import/no-unresolved
const IDPMicroFrontend = React.lazy(() => import('idp/MicroFrontendApp'))

// eslint-disable-next-line import/no-unresolved
const IDPAdminMicroFrontend = React.lazy(() => import('idpadmin/MicroFrontendApp'))

export default (
  <>
    <RouteWithLayout path={routes.toIDP({ ...accountPathProps })} layout={MinimalLayout}>
      <ChildAppMounter ChildApp={IDPMicroFrontend} />
    </RouteWithLayout>
    <RouteWithLayout path={routes.toIDPAdmin({ ...accountPathProps })} layout={MinimalLayout}>
      <ChildAppMounter ChildApp={IDPAdminMicroFrontend} />
    </RouteWithLayout>
  </>
)
