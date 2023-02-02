/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'

import cx from 'classnames'
import MainNav from '@common/navigation/MainNav'
import { useModuleInfo } from '@common/hooks/useModuleInfo'
import { TrialLicenseBanner } from '@common/layouts/TrialLicenseBanner'
import SideNav from '@common/navigation/SideNav'
import { useSidebar } from '@common/navigation/SidebarProvider'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import FeatureBanner from './FeatureBanner'
import css from './layouts.module.scss'

export function MinimalLayout(props: React.PropsWithChildren<unknown>): React.ReactElement {
  const { title, subtitle, icon, navComponent: NavComponent, launchButtonText, launchButtonRedirectUrl } = useSidebar()
  const { SPG_SIDENAV_COLLAPSE } = useFeatureFlags()
  const { module } = useModuleInfo()

  return (
    <div className={cx(css.main, { [css.flex]: SPG_SIDENAV_COLLAPSE })} data-layout="minimal">
      <MainNav />
      {SPG_SIDENAV_COLLAPSE && NavComponent && (
        <SideNav
          title={title}
          subtitle={subtitle}
          icon={icon}
          data-testid="side-nav"
          launchButtonText={launchButtonText}
          launchButtonRedirectUrl={launchButtonRedirectUrl}
          collapseByDefault
        >
          <NavComponent />
        </SideNav>
      )}

      <div className={css.rhs}>
        {module && <TrialLicenseBanner />}
        {module && <FeatureBanner />}
        <div className={css.children}>{props.children}</div>
      </div>
    </div>
  )
}
