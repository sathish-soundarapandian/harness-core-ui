/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect } from 'react'

import cx from 'classnames'
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
import { Icon } from '@harness/icons'
import { Button, Popover } from '@harness/uicore'
import DocsChat from '@common/components/DocsChat/DocsChat'
import { PopoverInteractionKind } from '@blueprintjs/core'

export function DefaultLayout(props: React.PropsWithChildren<unknown>): React.ReactElement {
  const { title, subtitle, icon, navComponent: NavComponent, launchButtonText, launchButtonRedirectUrl } = useSidebar()

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
    <div className={cx(css.main, css.flex)} data-layout="default">
      <MainNav />
      {NavComponent && (
        <SideNav
          title={title}
          subtitle={subtitle}
          icon={icon}
          launchButtonText={launchButtonText}
          launchButtonRedirectUrl={launchButtonRedirectUrl}
          data-testid="side-nav"
        >
          <NavComponent />
        </SideNav>
      )}

      <div className={css.rhs}>
        {module && <TrialLicenseBanner />}
        {module && <FeatureBanner />}
        <div className={css.children}>{props.children}</div>
      </div>

      <div style={{ position: 'absolute', bottom: '20px', right: '20px' }}>
        <Popover interactionKind={PopoverInteractionKind.CLICK} defaultIsOpen={true}>
          <Button intent="primary">
            <Icon name="chat" size={32} />
          </Button>
          <DocsChat />
        </Popover>
      </div>
    </div>
  )
}
