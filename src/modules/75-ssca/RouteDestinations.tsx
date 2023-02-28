/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Redirect, Route, useParams } from 'react-router-dom'
import type { ModulePathParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import type { SidebarContext } from '@common/navigation/SidebarProvider'
import routes from '@common/RouteDefinitions'
import { RouteWithLayout } from '@common/router'
import { accountPathProps, projectPathProps } from '@common/utils/routeUtils'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import PipelineStudio from '@pipeline/components/PipelineStudio/PipelineStudio'
import { PipelineDeploymentList } from '@pipeline/pages/pipeline-deployment-list/PipelineDeploymentList'
import { PipelineRouteDestinations } from '@pipeline/RouteDestinations'
import SSCASideNav from './components/SSCASideNav'
import { SSCAApp } from './components/SSCAApp'

const SSCASideNavProps: SidebarContext = {
  navComponent: SSCASideNav,
  title: 'Software Supply Chain Assurance',
  icon: 'ssca-main'
}

const moduleParams: ModulePathParams = {
  module: ':module(ssca)'
}

const RedirectToProjectOverviewPage = (): React.ReactElement => {
  const { accountId } = useParams<ProjectPathProps>()
  const { selectedProject } = useAppStore()

  if (selectedProject) {
    return (
      <Redirect
        to={routes.toProjectOverview({
          accountId,
          orgIdentifier: selectedProject.orgIdentifier || 'default',
          projectIdentifier: selectedProject.identifier,
          module: 'ssca'
        })}
      />
    )
  } else {
    return <Redirect to={routes.toSSCAOverview({ accountId })} />
  }
}

export default (
  <>
    <RouteWithLayout exact path={routes.toSSCA({ ...accountPathProps })}>
      <RedirectToProjectOverviewPage />
    </RouteWithLayout>

    <RouteWithLayout
      exact
      sidebarProps={SSCASideNavProps}
      path={[
        routes.toSSCAOverview({ ...accountPathProps }),
        routes.toAllowDenyList({ ...projectPathProps, ...moduleParams }),
        routes.toProjectOverview({ ...projectPathProps, ...moduleParams })
      ]}
    >
      <SSCAApp />
    </RouteWithLayout>

    <Route path="/account/:accountId/:module(ssca)">
      <PipelineRouteDestinations
        moduleParams={moduleParams}
        sidebarProps={SSCASideNavProps}
        pipelineStudioComponent={PipelineStudio}
        pipelineDeploymentListComponent={PipelineDeploymentList}
      />
    </Route>
  </>
)
