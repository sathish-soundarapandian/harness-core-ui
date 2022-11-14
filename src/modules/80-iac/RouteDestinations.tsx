import React from 'react'
import { RouteWithLayout } from '@common/router'
import routes from '@common/RouteDefinitions'
import { accountPathProps, orgPathProps, projectPathProps } from '@common/utils/routeUtils'
import { IacSideNavProps, RedirectToIacProject } from './utils/IacChildAppUtils'
import { IacApp } from './components/IacApp'
import '@iac/components/IacStage/index'

function IacmRoutes(): JSX.Element {
  return (
    <>
      <RouteWithLayout sidebarProps={IacSideNavProps} path={routes.toIac({ ...accountPathProps })} exact>
        <RedirectToIacProject />
      </RouteWithLayout>
      <RouteWithLayout
        sidebarProps={IacSideNavProps}
        path={[
          routes.toIacMicroFrontend({ ...projectPathProps, ...accountPathProps, ...orgPathProps }),
          routes.toIac({ ...accountPathProps })
        ]}
      >
        <IacApp />
      </RouteWithLayout>
    </>
  )
}

export default IacmRoutes
