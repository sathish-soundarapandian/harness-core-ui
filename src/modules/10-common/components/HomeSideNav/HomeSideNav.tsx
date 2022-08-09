/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import { Layout } from '@wings-software/uicore'
import routes from '@common/RouteDefinitions'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { SidebarLink } from '@common/navigation/SideNav/SideNav'
import { useStrings } from 'framework/strings'
import { returnLaunchUrl } from '@common/utils/routeUtils'
import { LaunchButton } from '../LaunchButton/LaunchButton'

export default function HomeSideNav(): React.ReactElement {
  const params = useParams<AccountPathProps>()
  const { getString } = useStrings()
  const { NEW_LEFT_NAVBAR_SETTINGS } = useFeatureFlags()
  return (
    <Layout.Vertical spacing="small" margin={{ top: 'xxxlarge' }}>
      <SidebarLink label={getString('common.welcome')} to={routes.toLandingDashboard(params)} />
      {!NEW_LEFT_NAVBAR_SETTINGS && <SidebarLink label={getString('projectsText')} to={routes.toProjects(params)} />}
      <LaunchButton
        launchButtonText={getString('common.cgLaunchText')}
        redirectUrl={returnLaunchUrl(`#/account/${params.accountId}/dashboard`)}
      />
    </Layout.Vertical>
  )
}
