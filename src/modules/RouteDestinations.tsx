/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Switch, Route } from 'react-router-dom'
import GitOpsRoutes from '@gitops/RouteDestinations'
import auditTrailRoutes from '@audit-trail/RouteDestinations'
import delegatesRoutes from '@delegates/RouteDestinations'
import commonRoutes from '@common/RouteDestinations'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import AuthSettingsRoutes from '@auth-settings/RouteDestinations'
import secretsRoutes from '@secrets/RouteDestinations'
import variableRoutes from '@variables/RouteDestinations'
import fileStoreRoutes from '@filestore/RouteDestinations'
import rbacRoutes from '@rbac/RouteDestinations'
import projectsOrgsRoutes from '@projects-orgs/RouteDestinations'
import connectorRoutes from '@connectors/RouteDestinations'
import tempatesRoutes from '@templates-library/RouteDestinations'
import userProfileRoutes from '@user-profile/RouteDestinations'
import '@pipeline/RouteDestinations'
import CDRoutes from '@cd/RouteDestinations'
import CIRoutes from '@ci/RouteDestinations'
import CVRoutes from '@cv/RouteDestinations'
import CFRoutes from '@cf/RouteDestinations'
import CERoutes from '@ce/RouteDestinations'
import STORoutes from '@sto-steps/RouteDestinations'
import GovernanceRoutes from '@governance/RouteDestinations'
import ChaosRoutes from '@chaos/RouteDestinations'
import DASHBOARDRoutes from '@dashboards/RouteDestinations'
import AccountSideNav from '@common/components/AccountSideNav/AccountSideNav'
import type { SidebarContext } from '@common/navigation/SidebarProvider'
import NotFoundPage from '@common/pages/404/NotFoundPage'
import DefaultSettingsRoutes from '@default-settings/RouteDestinations'
export const AccountSideNavProps: SidebarContext = {
  navComponent: AccountSideNav,
  icon: 'nav-settings',
  title: 'Account Settings'
}

export default function RouteDestinations(): React.ReactElement {
  const { CDNG_ENABLED, CVNG_ENABLED, CING_ENABLED, CENG_ENABLED, CFNG_ENABLED, SECURITY, CHAOS_ENABLED, NG_SETTINGS } =
    useFeatureFlags()

  return (
    <Switch>
      {commonRoutes.props.children}
      {secretsRoutes.props.children}
      {variableRoutes.props.children}
      {auditTrailRoutes.props.children}
      {rbacRoutes.props.children}
      {NG_SETTINGS ? DefaultSettingsRoutes().props.children : null}
      {delegatesRoutes.props.children}
      {fileStoreRoutes.props.children}
      {projectsOrgsRoutes.props.children}
      {DASHBOARDRoutes.props.children}
      {GovernanceRoutes.props.children}
      {connectorRoutes.props.children}
      {tempatesRoutes.props.children}
      {userProfileRoutes.props.children}
      {CHAOS_ENABLED ? ChaosRoutes().props.children : null}
      {CING_ENABLED ? CIRoutes.props.children : null}
      {CDNG_ENABLED ? CDRoutes.props.children : null}
      {CVNG_ENABLED ? CVRoutes.props.children : null}
      {GitOpsRoutes.props.children}
      {SECURITY ? (
        <Route path="/account/:accountId/:module(sto)">
          <STORoutes />
        </Route>
      ) : null}
      <Route path="/account/:accountId/settings">
        <AuthSettingsRoutes />
      </Route>
      {CENG_ENABLED ? (
        <Route path="/account/:accountId/:module(ce)">
          <CERoutes />
        </Route>
      ) : null}
      {CFNG_ENABLED ? CFRoutes({})?.props.children : null}
      <Route path="*">
        <NotFoundPage />
      </Route>
    </Switch>
  )
}
