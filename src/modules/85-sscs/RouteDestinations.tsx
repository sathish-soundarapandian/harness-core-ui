/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { SidebarContext } from '@common/navigation/SidebarProvider'
import { PAGE_NAME } from '@common/pages/pageContext/PageName'
import routes from '@common/RouteDefinitions'
import { RouteWithLayout } from '@common/router'
import { accountPathProps, projectPathProps } from '@common/utils/routeUtils'
import type { ModulePathParams } from '@common/interfaces/RouteInterfaces'
import SSCSSideNav from './components/SSCSSideNav/SSCSSideNav'
import { SBOMList } from './components/SBOMList/SBOMList'

// const SSCSHome = React.lazy(() => import('sscs/MicroFrontendApp'))

const SSCSSideNavProps: SidebarContext = {
  navComponent: SSCSSideNav,
  subtitle: 'SSCS',
  title: 'Software Supply Chain Security',
  icon: 'sscs-main'
}

const pipelineModuleParams: ModulePathParams = {
  module: ':module(sscs)'
}

// const SSCSPage = (): React.ReactElement | null => {
//   return <ChildAppMounter getLinkForAccountResources={getLinkForAccountResources} ChildApp={<SSCSHome>} />
// }

export default (
  <>
    <RouteWithLayout
      sidebarProps={SSCSSideNavProps}
      path={[
        routes.toSSCS({ ...accountPathProps, ...projectPathProps, ...pipelineModuleParams }),
        routes.toSBOMs({ ...accountPathProps, ...projectPathProps, ...pipelineModuleParams })
      ]}
      pageName={PAGE_NAME.SSCSPage}
    >
      <SBOMList />
    </RouteWithLayout>
  </>
)
