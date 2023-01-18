/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { RouteWithLayout } from '@common/router'
import routes from '@common/RouteDefinitions'
import { accountPathProps, orgPathProps, projectPathProps } from '@common/utils/routeUtils'
import { IACMSideNavProps, RedirectToIACMProject } from '@iacm/utils/IACMChildAppUtils'
import '@iacm/components/IACMStage'
import { IACMApp } from './components/IACMApp'

function IACMRoutes(): JSX.Element {
  return (
    <>
      <RouteWithLayout sidebarProps={IACMSideNavProps} path={routes.toIACM({ ...accountPathProps })} exact>
        <RedirectToIACMProject />
      </RouteWithLayout>
      <RouteWithLayout
        sidebarProps={IACMSideNavProps}
        path={[
          routes.toIACMMicroFrontend({ ...projectPathProps, ...accountPathProps, ...orgPathProps }),
          routes.toIACM({ ...accountPathProps })
        ]}
      >
        <IACMApp />
      </RouteWithLayout>
    </>
  )
}

export default IACMRoutes
