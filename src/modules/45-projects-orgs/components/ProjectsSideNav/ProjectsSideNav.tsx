/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams, useHistory, matchPath, useLocation } from 'react-router-dom'
import { Container, Layout } from '@harness/uicore'

import routes from '@common/RouteDefinitions'
import { ProjectSelector } from '@projects-orgs/components/ProjectSelector/ProjectSelector'
import type { PipelinePathProps } from '@common/interfaces/RouteInterfaces'
import { SidebarLink } from '@common/navigation/SideNav/SideNav'
import { useStrings } from 'framework/strings'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import ProjectSetupMenu from '@common/navigation/ProjectSetupMenu/ProjectSetupMenu'
import css from './ProjectSideNav.module.scss'
export default function ProjectsSideNav(): React.ReactElement {
  const params = useParams<PipelinePathProps>()
  const location = useLocation()
  const history = useHistory()
  const { selectedProject, updateAppStore } = useAppStore()

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
      {selectedProject && (
        <Container className={allProjectsPath?.isExact ? css.projectSelectorContainer : undefined}>
          <Container className={css.selector}>
            <ProjectSelector
              onSelect={data => {
                updateAppStore({ selectedProject: data })
                // changing project
                history.push(
                  routes.toProjectDetails({
                    accountId: params.accountId,
                    orgIdentifier: data.orgIdentifier || '',
                    projectIdentifier: data.identifier
                  })
                )
              }}
            />
          </Container>
          <Layout.Vertical spacing="small">
            <SidebarLink label={getString('overview')} to={routes.toProjectDetails(projectDetailsParams)} />
            <>
              <SidebarLink
                label={getString('common.pipelineExecution')}
                to={routes.toDeployments(projectDetailsParams)}
              />
              <SidebarLink label={getString('pipelines')} to={routes.toPipelines(projectDetailsParams)} />
              <SidebarLink label={getString('services')} to={routes.toServices(projectDetailsParams)} />
              <SidebarLink label={getString('environments')} to={routes.toEnvironment(projectDetailsParams)} />
            </>
          </Layout.Vertical>
          <ProjectSetupMenu defaultExpanded={true} />
        </Container>
      )}
    </Layout.Vertical>
  )
}
