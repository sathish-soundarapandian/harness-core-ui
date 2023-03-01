/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Route } from 'react-router-dom'
import { RouteWithLayout } from '@common/router'
import routes from '@common/RouteDefinitions'
import { accountPathProps, orgPathProps, projectPathProps } from '@common/utils/routeUtils'
import { IACMSideNavProps, RedirectToIACMProject } from '@iacm/utils/IACMChildAppUtils'
import { PipelineRouteDestinations } from '@pipeline/RouteDestinations'
import PipelineStudio from '@pipeline/components/PipelineStudio/PipelineStudio'
import { PipelineDeploymentList } from '@pipeline/pages/pipeline-deployment-list/PipelineDeploymentList'
import '@iacm/components/IACMStage'
import type { ModulePathParams } from '@common/interfaces/RouteInterfaces'
import { ConnectorRouteDestinations } from '@connectors/RouteDestinations'
import { SecretRouteDestinations } from '@secrets/RouteDestinations'
import { VariableRouteDestinations } from '@variables/RouteDestinations'
import { AccessControlRouteDestinations } from '@rbac/RouteDestinations'
import { DelegateRouteDestinations } from '@delegates/RouteDestinations'
import { DefaultSettingsRouteDestinations } from '@default-settings/RouteDestinations'
import { String } from 'framework/strings'
import RbacFactory from '@rbac/factories/RbacFactory'
import { ResourceCategory, ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { IACMApp } from './components/IACMApp'

const moduleParams: ModulePathParams = {
  module: ':module(iacm)'
}

RbacFactory.registerResourceCategory(ResourceCategory.IACM, {
  icon: 'iacm',
  label: 'iacm.navTitle'
})

RbacFactory.registerResourceTypeHandler(ResourceType.IAC_STACK, {
  icon: 'nav-settings',
  label: 'iacm.permissions.iacmStacks',
  labelSingular: 'iacm.permissions.iacmStack',
  category: ResourceCategory.IACM,
  permissionLabels: {
    [PermissionIdentifier.IAC_VIEW_STACK]: <String stringID="rbac.permissionLabels.view" />,
    [PermissionIdentifier.IAC_EDIT_STACK]: <String stringID="rbac.permissionLabels.createEdit" />,
    [PermissionIdentifier.IAC_DELETE_STACK]: <String stringID="rbac.permissionLabels.delete" />
  }
})

function IACMRoutes(): JSX.Element {
  return (
    <>
      <RouteWithLayout sidebarProps={IACMSideNavProps} path={routes.toIACM({ ...accountPathProps })} exact>
        <RedirectToIACMProject />
      </RouteWithLayout>
      <Route
        sidebarProps={IACMSideNavProps}
        path={routes.toIACMSetup({ ...projectPathProps, ...accountPathProps, ...orgPathProps })}
      >
        <AccessControlRouteDestinations moduleParams={moduleParams} sidebarProps={IACMSideNavProps} />
        <ConnectorRouteDestinations moduleParams={moduleParams} sidebarProps={IACMSideNavProps} />
        <SecretRouteDestinations moduleParams={moduleParams} sidebarProps={IACMSideNavProps} />
        <VariableRouteDestinations moduleParams={moduleParams} sidebarProps={IACMSideNavProps} />
        <DelegateRouteDestinations moduleParams={moduleParams} sidebarProps={IACMSideNavProps} />
        <DefaultSettingsRouteDestinations moduleParams={moduleParams} sidebarProps={IACMSideNavProps} />
      </Route>
      <Route
        sidebarProps={IACMSideNavProps}
        path={routes.toIACMPipelines({ ...projectPathProps, ...accountPathProps, ...orgPathProps })}
      >
        <PipelineRouteDestinations
          pipelineStudioComponent={PipelineStudio}
          pipelineDeploymentListComponent={PipelineDeploymentList}
          moduleParams={moduleParams}
          sidebarProps={IACMSideNavProps}
        />
      </Route>
      <RouteWithLayout
        sidebarProps={IACMSideNavProps}
        path={[
          routes.toIACMOverview({ ...accountPathProps }),
          routes.toIACMMicroFrontend({ ...projectPathProps, ...accountPathProps, ...orgPathProps })
        ]}
      >
        <IACMApp />
      </RouteWithLayout>
    </>
  )
}

export default IACMRoutes
