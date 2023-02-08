/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import routes from '@common/RouteDefinitions'
import { RouteWithLayout } from '@common/router'
import { accountPathProps } from '@common/utils/routeUtils'
import ChildAppMounter from 'microfrontends/ChildAppMounter'
import { MinimalLayout } from '@common/layouts'
import { PAGE_NAME } from '@common/pages/pageContext/PageName'
import { ConnectorReferenceField } from '@connectors/components/ConnectorReferenceField/ConnectorReferenceField'
import type { SidebarContext } from '@common/navigation/SidebarProvider'
import type { IDPCustomMicroFrontendProps } from './interfaces/IDPCustomMicroFrontendProps.types'
import IDPAdminSideNav from './components/IDPAdminSideNav/IDPAdminSideNav'
import './idp.module.scss'

// eslint-disable-next-line import/no-unresolved
const IDPMicroFrontend = React.lazy(() => import('idp/MicroFrontendApp'))

// eslint-disable-next-line import/no-unresolved
const IDPAdminMicroFrontend = React.lazy(() => import('idpadmin/MicroFrontendApp'))

const IDPAdminSideNavProps: SidebarContext = {
  navComponent: IDPAdminSideNav,
  subtitle: 'Internal Developer',
  title: 'Portal',
  icon: 'idp'
}
export default (
  <>
    <RouteWithLayout path={routes.toIDP({ ...accountPathProps })} layout={MinimalLayout}>
      <ChildAppMounter ChildApp={IDPMicroFrontend} />
    </RouteWithLayout>

    <RouteWithLayout
      path={[routes.toIDPAdmin({ ...accountPathProps })]}
      pageName={PAGE_NAME.IDPAdminPage}
      sidebarProps={IDPAdminSideNavProps}
    >
      <ChildAppMounter<IDPCustomMicroFrontendProps>
        ChildApp={IDPAdminMicroFrontend}
        customComponents={{ ConnectorReferenceField }}
      />
    </RouteWithLayout>
  </>
)
