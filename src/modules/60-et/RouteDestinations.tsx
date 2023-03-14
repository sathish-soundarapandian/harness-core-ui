/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FC } from 'react'
import { Redirect, useParams } from 'react-router-dom'
import { RouteWithLayout } from '@common/router'
import routes from '@common/RouteDefinitions'
import { accountPathProps, projectPathProps } from '@common/utils/routeUtils'
import { PAGE_NAME } from '@common/pages/pageContext/PageName'
import type { SidebarContext } from '@common/navigation/SidebarProvider'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import SideNav from './components/SideNav/SideNav'
import ETHomePage from './pages/ETHomePage'

export const ETSideNavProps: SidebarContext = {
  navComponent: SideNav,
  subtitle: 'Continuous',
  title: 'Error Tracking',
  icon: 'cet'
}

const RedirectToETHome = (): React.ReactElement => {
  const params = useParams<AccountPathProps>()

  return <Redirect to={routes.toETHome(params)} />
}

const ETRoutes: FC = () => {
  return (
    <>
      <RouteWithLayout path={routes.toET({ ...accountPathProps })} exact pageName={PAGE_NAME.ETHomePage}>
        <RedirectToETHome />
      </RouteWithLayout>

      <RouteWithLayout
        sidebarProps={ETSideNavProps}
        path={routes.toETHome({ ...accountPathProps })}
        exact
        pageName={PAGE_NAME.ETHomePage}
      >
        <ETHomePage />
      </RouteWithLayout>

      <RouteWithLayout
        sidebarProps={ETSideNavProps}
        path={routes.toETPlaceholder({ ...projectPathProps })}
        exact
        pageName={PAGE_NAME.ETHomePage}
      >
        <ETHomePage />
      </RouteWithLayout>
    </>
  )
}

export default ETRoutes
