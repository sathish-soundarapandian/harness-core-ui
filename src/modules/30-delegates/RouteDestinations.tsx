/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Redirect, useParams } from 'react-router-dom'

import { RouteWithLayout } from '@common/router'
import routes from '@common/RouteDefinitions'
import { accountPathProps, delegateConfigProps, delegatePathProps } from '@common/utils/routeUtils'
import { AccountSideNavProps } from '@common/RouteDestinations'

import RbacFactory from '@rbac/factories/RbacFactory'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ResourceType, ResourceCategory } from '@rbac/interfaces/ResourceType'

import type { ResourceDTO } from 'services/audit'
import AuditTrailFactory, { ResourceScope } from '@audit-trail/factories/AuditTrailFactory'

import { String } from 'framework/strings'

import DelegatesPage from '@delegates/pages/delegates/DelegatesPage'
import DelegateProfileDetails from '@delegates/pages/delegates/DelegateConfigurationDetailPage'
import DelegateDetails from '@delegates/pages/delegates/DelegateDetails'

import DelegateResourceModalBody from '@delegates/components/DelegateResourceModalBody/DelegateResourceModalBody'
import DelegateConfigurationResourceModalBody from '@delegates/components/DelegateConfigurationResourceModalBody/DelegateConfigurationResourceModalBody'
import DelegateConfigurationResourceRenderer from '@delegates/components/DelegateConfigurationResourceRenderer/DelegateConfigurationResourceRenderer'
import DelegateResourceRenderer from '@delegates/components/DelegateResourceRenderer/DelegateResourceRenderer'

import DelegateListing from '@delegates/pages/delegates/DelegateListing'
import DelegateConfigurations from '@delegates/pages/delegates/DelegateConfigurations'
import DelegateTokens from '@delegates/components/DelegateTokens/DelegateTokens'
import type { AccountPathProps, Module } from '@common/interfaces/RouteInterfaces'

RbacFactory.registerResourceTypeHandler(ResourceType.DELEGATE, {
  icon: 'res-delegates',
  label: 'delegate.delegates',
  category: ResourceCategory.SHARED_RESOURCES,
  permissionLabels: {
    [PermissionIdentifier.VIEW_DELEGATE]: <String stringID="rbac.permissionLabels.view" />,
    [PermissionIdentifier.UPDATE_DELEGATE]: <String stringID="rbac.permissionLabels.createEdit" />,
    [PermissionIdentifier.DELETE_DELEGATE]: <String stringID="rbac.permissionLabels.delete" />
  },
  // eslint-disable-next-line react/display-name
  addResourceModalBody: props => <DelegateResourceModalBody {...props} />,
  // eslint-disable-next-line react/display-name
  staticResourceRenderer: props => <DelegateResourceRenderer {...props} />
})

RbacFactory.registerResourceTypeHandler(ResourceType.DELEGATECONFIGURATION, {
  icon: 'res-delegates',
  label: 'delegate.delegateConfigurations',
  category: ResourceCategory.SHARED_RESOURCES,
  permissionLabels: {
    [PermissionIdentifier.VIEW_DELEGATE_CONFIGURATION]: <String stringID="rbac.permissionLabels.view" />,
    [PermissionIdentifier.UPDATE_DELEGATE_CONFIGURATION]: <String stringID="rbac.permissionLabels.createEdit" />,
    [PermissionIdentifier.DELETE_DELEGATE_CONFIGURATION]: <String stringID="rbac.permissionLabels.delete" />
  },
  // eslint-disable-next-line react/display-name
  addResourceModalBody: props => <DelegateConfigurationResourceModalBody {...props} />,
  // eslint-disable-next-line react/display-name
  staticResourceRenderer: props => <DelegateConfigurationResourceRenderer {...props} />
})

/**
 * Register for Audit Trail
 * */
AuditTrailFactory.registerResourceHandler(ResourceType.DELEGATE_TOKEN, {
  moduleIcon: {
    name: 'delegates-icon'
  },
  moduleLabel: 'common.delegateTokenLabel',
  resourceLabel: 'common.delegateTokenLabel',
  resourceUrl: (_: ResourceDTO, resourceScope: ResourceScope, module?: Module) => {
    const { accountIdentifier, orgIdentifier, projectIdentifier } = resourceScope
    return routes.toDelegateTokens({
      module,
      orgIdentifier,
      projectIdentifier,
      accountId: accountIdentifier
    })
  }
})

AuditTrailFactory.registerResourceHandler(ResourceType.DELEGATE, {
  moduleIcon: {
    name: 'delegates-icon'
  },
  moduleLabel: 'delegate.DelegateName',
  resourceLabel: 'delegate.DelegateName',
  resourceUrl: (_: ResourceDTO, resourceScope: ResourceScope, module?: Module) => {
    const { accountIdentifier, orgIdentifier, projectIdentifier } = resourceScope
    return routes.toDelegateList({
      module,
      orgIdentifier,
      projectIdentifier,
      accountId: accountIdentifier
    })
  }
})

const RedirectToDelegatesHome = (): React.ReactElement => {
  const { accountId } = useParams<AccountPathProps>()
  return <Redirect to={routes.toDelegateList({ accountId })} />
}

export default (
  <>
    <RouteWithLayout sidebarProps={AccountSideNavProps} path={[routes.toDelegates({ ...accountPathProps })]} exact>
      <RedirectToDelegatesHome />
    </RouteWithLayout>

    <RouteWithLayout sidebarProps={AccountSideNavProps} path={[routes.toDelegateList({ ...accountPathProps })]} exact>
      <DelegatesPage>
        <DelegateListing />
      </DelegatesPage>
    </RouteWithLayout>

    <RouteWithLayout
      sidebarProps={AccountSideNavProps}
      path={[routes.toDelegateConfigs({ ...accountPathProps })]}
      exact
    >
      <DelegatesPage>
        <DelegateConfigurations />
      </DelegatesPage>
    </RouteWithLayout>

    <RouteWithLayout
      sidebarProps={AccountSideNavProps}
      path={[routes.toDelegatesDetails({ ...accountPathProps, ...delegatePathProps })]}
    >
      <DelegateDetails />
    </RouteWithLayout>
    <RouteWithLayout
      sidebarProps={AccountSideNavProps}
      path={[routes.toDelegateConfigsDetails({ ...accountPathProps, ...delegateConfigProps })]}
    >
      <DelegateProfileDetails />
    </RouteWithLayout>
    <RouteWithLayout sidebarProps={AccountSideNavProps} path={[routes.toDelegateTokens({ ...accountPathProps })]}>
      <DelegatesPage>
        <DelegateTokens />
      </DelegatesPage>
    </RouteWithLayout>
  </>
)
