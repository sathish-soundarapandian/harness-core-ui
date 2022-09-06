import React from 'react'
import routes from '@common/RouteDefinitions'
import { RouteWithLayout } from '@common/router'
import { accountPathProps } from '@common/utils/routeUtils'
import ChildAppMounter from 'microfrontends/ChildAppMounter'
import SideNav from '@common/navigation/SideNav'
import { ProjectSelector } from '@projects-orgs/components/ProjectSelector/ProjectSelector'
import { noop } from 'lodash'

// eslint-disable-next-line import/no-unresolved
const IDPMicroFrontend = React.lazy(() => import('idp/MicroFrontendApp'))

function IDPNav() {
  return (
    <SideNav>
      <ProjectSelector onSelect={noop} />
    </SideNav>
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
