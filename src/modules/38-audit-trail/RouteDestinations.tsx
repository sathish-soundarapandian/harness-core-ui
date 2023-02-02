/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { RouteWithLayout } from '@common/router'
import { AccountSideNavProps } from '@common/RouteDestinations'
import routes from '@common/RouteDefinitions'
import { accountPathProps } from '@common/utils/routeUtils'
import AuditTrailsPage from './pages/AuditTrails/AuditTrailsPage'

export default (
  <>
    <RouteWithLayout sidebarProps={AccountSideNavProps} path={routes.toAuditTrail({ ...accountPathProps })} exact>
      <AuditTrailsPage />
    </RouteWithLayout>
  </>
)
