/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import { Layout } from '@harness/uicore'

import routes from '@common/RouteDefinitions'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { SidebarLink } from '@common/navigation/SideNav/SideNav'
import { useStrings } from 'framework/strings'
import { FeatureFlag } from '@common/featureFlags'
import { useFeatureFlag } from '@common/hooks/useFeatureFlag'

export default function DashboardHomeSideNav(): React.ReactElement {
  const params = useParams<AccountPathProps>()
  const { getString } = useStrings()
  const GLOBAL_SERVICE_ENV = useFeatureFlag(FeatureFlag.GLOBAL_SERVICE_ENV)

  return (
    <Layout.Vertical spacing="small" margin={{ top: 'xxxlarge' }}>
      <SidebarLink label={getString('common.welcome')} to={routes.toMainDashboard(params)} />
      {GLOBAL_SERVICE_ENV && (
        <>
          <SidebarLink label={getString('services')} to={routes.toServices({ ...params })} />
          <SidebarLink label={getString('environments')} to={routes.toEnvironment({ ...params })} />
        </>
      )}
    </Layout.Vertical>
  )
}
