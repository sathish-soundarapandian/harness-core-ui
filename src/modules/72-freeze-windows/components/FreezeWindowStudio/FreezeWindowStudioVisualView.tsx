/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Icon, Tab, Tabs } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import { FreezeStudioOverviewSection } from './FreezeStudioOverviewSection'
import { FreezeStudioConfigSection } from './FreezeStudioConfigSection'
import css from './FreezeWindowStudio.module.scss'

enum FreezeWindowTabs {
  OVERVIEW = 'OVERVIEW',
  FREEZE_CONFIG = 'FREEZE_CONFIG',
  SCHEDULE = 'SCHEDULE'
}

export const FreezeWindowStudioVisualView = () => {
  const { getString } = useStrings()
  const [selectedTabId, setSelectedTabId] = React.useState<FreezeWindowTabs>(FreezeWindowTabs.OVERVIEW)

  const isReadOnly = false

  return (
    <section className={css.stepTabs}>
      <Tabs
        id="freezeWindowStudio"
        onChange={(tabId: FreezeWindowTabs) => {
          setSelectedTabId(tabId)
        }}
        selectedTabId={selectedTabId}
        data-tabId={selectedTabId}
      >
        <Tab
          id={FreezeWindowTabs.OVERVIEW}
          panel={
            <FreezeStudioOverviewSection
              isReadOnly={isReadOnly}
              onNext={() => setSelectedTabId(FreezeWindowTabs.FREEZE_CONFIG)}
            />
          }
          title={
            <span>
              <Icon name="tick" height={20} size={20} className={css.tabIcon} />
              {getString('overview')}
            </span>
          }
        />
        <Tab
          id={FreezeWindowTabs.FREEZE_CONFIG}
          panel={
            <FreezeStudioConfigSection
              isReadOnly={isReadOnly}
              onBack={() => setSelectedTabId(FreezeWindowTabs.OVERVIEW)}
              onNext={() => setSelectedTabId(FreezeWindowTabs.SCHEDULE)}
            />
          }
          title={
            <span>
              <Icon name="services" height={20} size={20} className={css.tabIcon} />
              {getString('freezeWindows.freezeStudio.freezeConfiguration')}
            </span>
          }
        />
        <Tab
          id={FreezeWindowTabs.SCHEDULE}
          panel={<div>Schedule</div>}
          title={
            <span>
              <Icon name="waiting" height={20} size={20} className={css.tabIcon} />
              {getString('common.schedule')}
            </span>
          }
        />
      </Tabs>
    </section>
  )
}
