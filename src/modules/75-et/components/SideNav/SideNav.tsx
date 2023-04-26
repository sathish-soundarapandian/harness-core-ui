/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Layout } from '@harness/uicore'
import { useHistory, useParams } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import routes from '@common/RouteDefinitions'
import NavExpandable from '@common/navigation/NavExpandable/NavExpandable'
import { SidebarLink } from '@common/navigation/SideNav/SideNav'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { ProjectSelector, ProjectSelectorProps } from '@projects-orgs/components/ProjectSelector/ProjectSelector'
import type { PipelinePathProps } from '@common/interfaces/RouteInterfaces'

export default function ETSideNav(): React.ReactElement {
  const { getString } = useStrings()
  const { updateAppStore } = useAppStore()
  const history = useHistory()
  const params = useParams<PipelinePathProps>()
  const { accountId, projectIdentifier, orgIdentifier } = params

  const projectSelectHandler: ProjectSelectorProps['onSelect'] = data => {
    updateAppStore({ selectedProject: data })

    history.push(routes.toET({ accountId }))
  }

  return (
    <Layout.Vertical spacing="small">
      <ProjectSelector onSelect={projectSelectHandler} />
      {projectIdentifier && orgIdentifier && (
        <React.Fragment>
          <SidebarLink
            label="Events Summary"
            to={routes.toETEventsSummary({
              projectIdentifier,
              orgIdentifier,
              accountId
            })}
          />
          <SidebarLink
            label="Monitored Services"
            to={routes.toETMonitoredServices({
              projectIdentifier,
              orgIdentifier,
              accountId
            })}
          />
          <NavExpandable title={getString('common.projectSetup')} route={'undefined'}>
            <Layout.Vertical spacing="small">
              <SidebarLink
                label={'Tokens'}
                to={routes.toETAgentsTokens({
                  projectIdentifier,
                  orgIdentifier,
                  accountId
                })}
              />
              <SidebarLink
                label={'Agents'}
                to={routes.toETAgents({
                  projectIdentifier,
                  orgIdentifier,
                  accountId
                })}
              />
              <SidebarLink
                label={getString('connectorsLabel')}
                to={routes.toETConnectors({
                  projectIdentifier,
                  orgIdentifier,
                  accountId
                })}
              />
              <SidebarLink
                label={getString('common.secrets')}
                to={routes.toETSecrets({
                  projectIdentifier,
                  orgIdentifier,
                  accountId
                })}
              />
              <SidebarLink
                label={getString('accessControl')}
                to={routes.toETAccessControl({
                  projectIdentifier,
                  orgIdentifier,
                  accountId
                })}
              />
              <SidebarLink
                label={getString('delegate.delegates')}
                to={routes.toETDelegates({
                  projectIdentifier,
                  orgIdentifier,
                  accountId
                })}
              />
              <SidebarLink
                label={'Policies'}
                to={routes.toETPolicies({
                  projectIdentifier,
                  orgIdentifier,
                  accountId
                })}
              />
              <SidebarLink
                label={getString('common.defaultSettings')}
                to={routes.toETDefaultSettings({
                  projectIdentifier,
                  orgIdentifier,
                  accountId
                })}
              />
            </Layout.Vertical>
          </NavExpandable>
        </React.Fragment>
      )}
    </Layout.Vertical>
  )
}
