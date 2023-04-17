/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import { Layout } from '@harness/uicore'
import { useParams } from 'react-router-dom'
import { useGetStatusInfoByTypeQuery } from '@harnessio/react-idp-service-client'
import { isEmpty } from 'lodash-es'
import { SidebarLink } from '@common/navigation/SideNav/SideNav'
import { useStrings } from 'framework/strings'
import routes from '@common/RouteDefinitions'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import css from './IDPAdminSideNav.module.scss'

export default function IDPAdminSideNav(): React.ReactElement {
  const { getString } = useStrings()
  const { accountId } = useParams<AccountPathProps>()
  const params = useParams<AccountPathProps>()

  const { data } = useGetStatusInfoByTypeQuery(
    { type: 'onboarding' },
    {
      staleTime: 15 * 60 * 1000
    }
  )
  const onboardingStatus = data?.content?.status?.current_status
  const [showGetStarted, setShowGetStarted] = useState(false)

  useEffect(() => {
    if (!isEmpty(onboardingStatus)) {
      setShowGetStarted(onboardingStatus !== 'COMPLETED')
    }
  }, [onboardingStatus])

  return (
    <Layout.Vertical spacing="small">
      {showGetStarted ? (
        <SidebarLink label={getString('getStarted')} to={routes.toGetStartedWithIDP({ accountId })} />
      ) : (
        <>
          <SidebarLink
            label={getString('back')}
            to={routes.toIDP(params)}
            className={css.backBtn}
            icon="main-chevron-left"
          />
          <SidebarLink label={getString('idp.adminHome')} to={routes.toAdminHome(params)} />
          <SidebarLink label={getString('common.plugins')} to={routes.toPluginsPage(params)} />
          <SidebarLink label={getString('common.configurations')} to={routes.toConfigurations(params)} />
          <SidebarLink label={getString('idp.layout')} to={routes.toLayoutConfig(params)} />
          <SidebarLink label={getString('accessControl')} to={routes.toIDPAccessControl(params)} />
          <SidebarLink label={getString('connectorsLabel')} to={routes.toConnectorsPage(params)} />
        </>
      )}
    </Layout.Vertical>
  )
}
