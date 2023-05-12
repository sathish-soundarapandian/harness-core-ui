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

// IACM Side Nav: Renders sidenav for IACM module
export default function IACMSideNav(): React.ReactElement {
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
            routes.toIACMWorkspaces({
              projectIdentifier: data.identifier,
              orgIdentifier: data.orgIdentifier,
              accountId
            })
          )
        }}
      />
      {projectIdentifier && orgIdentifier && (
        <>
          <SidebarLink label={getString('iacm.workspaces')} to={routes.toIACMWorkspaces({ ...params })} />
          <SidebarLink label={getString('pipelines')} to={routes.toPipelines({ ...params, module: 'iacm' })} />
          <ProjectSetupMenu module="iacm" />
        </>
      )}
    </Layout.Vertical>
  )
}
