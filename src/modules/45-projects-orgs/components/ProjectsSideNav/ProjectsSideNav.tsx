/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams, useHistory, useRouteMatch, matchPath, useLocation } from 'react-router-dom'
import { Container, Layout } from '@harness/uicore'
import { compile } from 'path-to-regexp'

import routes from '@common/RouteDefinitions'
import { ProjectSelector } from '@projects-orgs/components/ProjectSelector/ProjectSelector'
import type { PipelinePathProps } from '@common/interfaces/RouteInterfaces'
import { SidebarLink } from '@common/navigation/SideNav/SideNav'
import { useStrings } from 'framework/strings'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import ProjectSetupMenu from '@common/navigation/ProjectSetupMenu/ProjectSetupMenu'
import css from './ProjectSideNav.module.scss'
export default function ProjectsSideNav(): React.ReactElement {
  const params = useParams<PipelinePathProps>()
  const routeMatch = useRouteMatch()
  const location = useLocation()
  const history = useHistory()
  const { selectedProject, updateAppStore } = useAppStore()
  const { NEW_LEFT_NAVBAR_SETTINGS } = useFeatureFlags()
  const { getString } = useStrings()

  const projectDetailsParams = {
    accountId: params.accountId,
    projectIdentifier: selectedProject?.identifier ? selectedProject.identifier : '',
    orgIdentifier: selectedProject?.orgIdentifier ? selectedProject.orgIdentifier : ''
  }

  const allProjectsPath = matchPath(location.pathname, {
    path: routes.toAllProjects({ accountId: params.accountId }),
    exact: true,
    strict: false
  })

  return (
    <Layout.Vertical spacing="small">
      {NEW_LEFT_NAVBAR_SETTINGS && (
        <>
          <SidebarLink
            label={getString('rbac.scopeItems.allProjects')}
            to={routes.toAllProjects({ accountId: params.accountId })}
            icon="nav-project"
            style={{ marginTop: 'var(--spacing-medium)', marginBottom: 'var(--spacing-small)' }}
            className={css.iconColor}
            exact
          />
          <div className={css.divStyle} />
        </>
      )}
      {selectedProject && (
        <Container className={allProjectsPath?.isExact ? css.projectSelectorContainer : undefined}>
          <Container className={css.selector}>
            <ProjectSelector
              onSelect={data => {
                updateAppStore({ selectedProject: data })
                // changing project
                history.push(
                  compile(routeMatch.path)({
                    ...routeMatch.params,
                    projectIdentifier: data.identifier,
                    orgIdentifier: data.orgIdentifier
                  })
                )
              }}
            />
          </Container>
          <SidebarLink label={getString('overview')} to={routes.toProjectDetails(projectDetailsParams)} />
          {NEW_LEFT_NAVBAR_SETTINGS && (
            <SidebarLink
              label={getString('common.pipelineExecution')}
              to={routes.toDeployments(projectDetailsParams)}
            />
          )}
          {NEW_LEFT_NAVBAR_SETTINGS && (
            <SidebarLink label={getString('pipelines')} to={routes.toPipelines(projectDetailsParams)} />
          )}
          <ProjectSetupMenu defaultExpanded={NEW_LEFT_NAVBAR_SETTINGS} />
        </Container>
      )}
    </Layout.Vertical>
  )
}
