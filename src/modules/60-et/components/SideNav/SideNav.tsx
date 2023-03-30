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
import { ModuleName } from 'framework/types/ModuleName'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { ProjectSelector, ProjectSelectorProps } from '@projects-orgs/components/ProjectSelector/ProjectSelector'
import type { PipelinePathProps } from '@common/interfaces/RouteInterfaces'

export default function ETSideNav(): React.ReactElement {
  const { getString } = useStrings()
  const { updateAppStore } = useAppStore()
  const history = useHistory()
  const params = useParams<PipelinePathProps>()
  const { accountId, projectIdentifier, orgIdentifier } = params

  // CET-1024: empty navigation sidebar for now
  /* istanbul ignore next */
  const projectSelectHandler: ProjectSelectorProps['onSelect'] = data => {
    updateAppStore({ selectedProject: data })

    history.push(routes.toET({ accountId }))
  }

  return (
    <Layout.Vertical spacing="small">
      <ProjectSelector
        moduleFilter={ModuleName.CV} // CET-1024: support ModuleName.ET in src/services/cd-ng/index.tsx Project interface
        onSelect={projectSelectHandler}
      />
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
          {/*
          <SidebarLink
            label="Getting Started"
            to={routes.toETHome({
              accountId
            })}
          />
          */}
          <NavExpandable title={getString('common.projectSetup')} route={'undefined'}>
            <Layout.Vertical spacing="small">
              {/*
              <SidebarLink
                label={'Connectors'}
                to={routes.toETHome({
                  accountId
                })}
              />
              <SidebarLink
                label={'Secrets'}
                to={routes.toETHome({
                  accountId
                })}
              />
              <SidebarLink
                label={'Variables'}
                to={routes.toETHome({
                  accountId
                })}
              />
              <SidebarLink
                label={'Access Control'}
                to={routes.toETHome({
                  accountId
                })}
              />
              <SidebarLink
                label={'Delegates'}
                to={routes.toETHome({
                  accountId
                })}
              />
              */}
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
              {/*
              <SidebarLink
                label={'Settings'}
                to={routes.toETHome({
                  accountId
                })}
              />
              */}
            </Layout.Vertical>
          </NavExpandable>
        </React.Fragment>
      )}
    </Layout.Vertical>
  )
}
