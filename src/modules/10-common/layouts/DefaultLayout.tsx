/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect } from 'react'

import MainNav from '@common/navigation/MainNav'
import SideNav from '@common/navigation/SideNav'

import { useSidebar } from '@common/navigation/SidebarProvider'
import { useModuleInfo } from '@common/hooks/useModuleInfo'
import { TrialLicenseBanner } from '@common/layouts/TrialLicenseBanner'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { usePage } from '@common/pages/pageContext/PageProvider'
import { useAppStore } from 'framework/AppStore/AppStoreContext'

import FeatureBanner from './FeatureBanner'

import css from './layouts.module.scss'

export function DefaultLayout(props: React.PropsWithChildren<unknown>): React.ReactElement {
  const { title, subtitle, icon, navComponent: NavComponent } = useSidebar()
  const { pageName } = usePage()
  const { module } = useModuleInfo()
  const { trackPage, identifyUser } = useTelemetry()
  const { currentUserInfo } = useAppStore()

  useEffect(() => {
    if (pageName) {
      identifyUser(currentUserInfo.email)
      trackPage(pageName, { module: module || '' })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageName])

  return (
    <div className={css.main} data-layout="default">
      <MainNav />
      <SideNav title={title} subtitle={subtitle} icon={icon}>
        <NavComponent />
      </SideNav>
      <main>
        {module && <TrialLicenseBanner />}
        {module && <FeatureBanner />}
        {props.children}
      </main>
    </div>
  )
}
