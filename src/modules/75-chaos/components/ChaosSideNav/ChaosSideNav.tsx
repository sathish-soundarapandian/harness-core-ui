/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { Layout } from '@harness/uicore'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { SidebarLink } from '@common/navigation/SideNav/SideNav'
import routes from '@common/RouteDefinitions'
import { ProjectSelector } from '@projects-orgs/components/ProjectSelector/ProjectSelector'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import ProjectSetupMenu from '@common/navigation/ProjectSetupMenu/ProjectSetupMenu'
import { useStrings } from 'framework/strings'

// ChaosSideNav: Renders sidenav for chaos module
export default function ChaosSideNav(): React.ReactElement {
  const params = useParams<ProjectPathProps>()
  const { accountId, projectIdentifier, orgIdentifier } = params
  const { getString } = useStrings()

  const { updateAppStore } = useAppStore()
  const history = useHistory()

  return (
    <Layout.Vertical spacing="small">
      <ProjectSelector
        onSelect={data => {
          updateAppStore({ selectedProject: data })
          history.push(
            routes.toProjectOverview({
              projectIdentifier: data.identifier,
              orgIdentifier: data.orgIdentifier || /* istanbul ignore next */ '',
              accountId,
              module: 'chaos'
            })
          )
        }}
      />
      {projectIdentifier && orgIdentifier ? (
        <>
          <SidebarLink label={getString('overview')} to={routes.toProjectOverview({ ...params, module: 'chaos' })} />
          <SidebarLink
            label={getString('chaos.navLabels.chaosExperiments')}
            to={routes.toChaosExperiments({ ...params })}
          />
          <SidebarLink label={getString('chaos.navLabels.chaosHubs')} to={routes.toChaosHubs({ ...params })} />
          <SidebarLink
            label={getString('chaos.navLabels.chaosInfrastructures')}
            to={routes.toChaosInfrastructures({ ...params })}
          />
          <ProjectSetupMenu module="chaos" />
        </>
      ) : null}
    </Layout.Vertical>
  )
}
