import React from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { Layout } from '@harness/uicore'
import type { ModulePathParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { SidebarLink } from '@common/navigation/SideNav/SideNav'
import routes from '@common/RouteDefinitions'
import { ProjectSelector } from '@projects-orgs/components/ProjectSelector/ProjectSelector'
import { useAppStore } from 'framework/AppStore/AppStoreContext'

export default function ChaosSideNav(): React.ReactElement {
  const params = useParams<ProjectPathProps & ModulePathParams>()
  const { accountId, projectIdentifier, orgIdentifier, module } = params

  const { updateAppStore } = useAppStore()
  const history = useHistory()

  return (
    <Layout.Vertical spacing="small">
      <ProjectSelector
        onSelect={data => {
          updateAppStore({ selectedProject: data })
          history.push(
            routes.toChaosHome({
              projectIdentifier: data.identifier,
              orgIdentifier: data.orgIdentifier || /* istanbul ignore next */ '',
              accountId,
              module: module ?? 'chaos'
            })
          )
        }}
      />
      {projectIdentifier && orgIdentifier ? (
        <>
          <SidebarLink label="Workflows" to={routes.toChaosWorkflows({ ...params })}></SidebarLink>
          <SidebarLink label="ChaosHubs" to={routes.toChaosHubs({ ...params })}></SidebarLink>
          <SidebarLink label="ChaosAgents" to={routes.toChaosAgents({ ...params })}></SidebarLink>
        </>
      ) : null}
    </Layout.Vertical>
  )
}
