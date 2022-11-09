import React from 'react'
import { Layout } from '@harness/uicore'
import { useHistory, useParams, useRouteMatch } from 'react-router-dom'
import { compile } from 'path-to-regexp'
import routes from '@common/RouteDefinitions'
import { RouteWithLayout } from '@common/router'
import { accountPathProps } from '@common/utils/routeUtils'
import ChildAppMounter from 'microfrontends/ChildAppMounter'
import { ProjectSelector } from '@projects-orgs/components/ProjectSelector/ProjectSelector'
import { SidebarLink } from '@common/navigation/SideNav/SideNav'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import ProjectSetupMenu from '@common/navigation/ProjectSetupMenu/ProjectSetupMenu'

// eslint-disable-next-line import/no-unresolved
const IDPMicroFrontend = React.lazy(() => import('idp/MicroFrontendApp'))

function IDPNav(): React.ReactElement {
  const params = useParams<ProjectPathProps>()
  const routeMatch = useRouteMatch()
  const history = useHistory()
  const { updateAppStore } = useAppStore()

  return (
    <Layout.Vertical spacing="small">
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
      <SidebarLink label={'Home'} to={routes.toIDPCatalog(params)} />
      <SidebarLink label={'APIs'} to={routes.toIDPAPIs(params)} />
      <SidebarLink label={'Docs'} to={routes.toIDPDocs(params)} />
      <SidebarLink label={'Playlists'} to={routes.toIDPPlaylists(params)} />
      <SidebarLink label={'Explore'} to={routes.toIDPExplore(params)} />
      <ProjectSetupMenu />
    </Layout.Vertical>
  )
}

export default (
  <>
    <RouteWithLayout
      path={routes.toIDP({ ...accountPathProps })}
      sidebarProps={{ title: 'Developer', subtitle: 'Platform', navComponent: IDPNav }}
    >
      <ChildAppMounter ChildApp={IDPMicroFrontend} />
    </RouteWithLayout>
  </>
)
