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
import { PipelineRouteDestinations } from '@pipeline/RouteDestinations'
import SSCSSideNav from './components/SSCSSideNav'
import SSCSPipelineDeploymentList from './components/SSCSPipelineDeploymentList'
import { SSCSApp } from './components/SSCSApp'

const SSCSSideNavProps: SidebarContext = {
  navComponent: SSCSSideNav,
  title: 'Software Supply Chain Security',
  icon: 'sscs-main'
}

const moduleParams: ModulePathParams = {
  module: ':module(sscs)'
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
          ...moduleParams
        })}
      />
    )
  } else {
    return <Redirect to={routes.toSSCSOverview({ accountId })} />
  }
}

export default (
  <>
    <RouteWithLayout exact path={routes.toSSCS({ ...accountPathProps })}>
      <RedirectToProjectOverviewPage />
    </RouteWithLayout>

    <RouteWithLayout
      exact
      sidebarProps={SSCSSideNavProps}
      path={[
        routes.toAllowDenyList({ ...accountPathProps, ...projectPathProps, ...moduleParams }),
        routes.toSSCSOverview({ ...accountPathProps }),
        routes.toProjectOverview({ ...accountPathProps, ...projectPathProps, ...moduleParams })
      ]}
    >
      <SSCSApp />
    </RouteWithLayout>

    <Route path="/account/:accountId/:module(sscs)">
      <PipelineRouteDestinations
        moduleParams={moduleParams}
        sidebarProps={SSCSSideNavProps}
        pipelineStudioComponent={PipelineStudio}
        pipelineDeploymentListComponent={SSCSPipelineDeploymentList}
      />
    </Route>
  </>
)
