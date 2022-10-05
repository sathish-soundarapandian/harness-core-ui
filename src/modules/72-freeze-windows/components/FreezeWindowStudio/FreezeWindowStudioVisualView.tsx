/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Icon, Tab, Tabs } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import { useQueryParams, useUpdateQueryParams } from '@common/hooks'
import type { ResourcesInterface } from '@freeze-windows/types'
import { FreezeWindowContext } from './FreezeWindowContext/FreezeWindowContext'
import { FreezeStudioOverviewSection } from './FreezeStudioOverviewSection'
import { FreezeStudioConfigSection } from './FreezeStudioConfigSection'
import { FreezeWindowScheduleSection } from './FreezeWindowScheduleSection'
import css from './FreezeWindowStudio.module.scss'

enum FreezeWindowTabs {
  OVERVIEW = 'OVERVIEW',
  FREEZE_CONFIG = 'FREEZE_CONFIG',
  SCHEDULE = 'SCHEDULE'
}

export const FreezeWindowStudioVisualView = ({ resources }: { resources: ResourcesInterface }) => {
  const { getString } = useStrings()
  const { updateQueryParams } = useUpdateQueryParams<{ sectionId?: string | null }>()
  const { sectionId } = useQueryParams<{ sectionId?: string | null }>()
  const { isReadOnly } = React.useContext(FreezeWindowContext)

  React.useEffect(() => {
    if (!sectionId) {
      updateQueryParams({ sectionId: FreezeWindowTabs.OVERVIEW })
    }
  }, [])

  const setSelectedTabId = (tabId: FreezeWindowTabs) => {
    updateQueryParams({ sectionId: tabId })
  }

  return (
    <section className={css.stepTabs}>
      <Tabs
        id="freezeWindowStudio"
        onChange={(tabId: FreezeWindowTabs) => {
          setSelectedTabId(tabId)
        }}
        selectedTabId={sectionId as FreezeWindowTabs}
        data-tabId={sectionId}
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
              onBack={() => setSelectedTabId(FreezeWindowTabs.OVERVIEW)}
              onNext={() => setSelectedTabId(FreezeWindowTabs.SCHEDULE)}
              resources={resources}
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
          panel={
            <FreezeWindowScheduleSection
              onBack={() => setSelectedTabId(FreezeWindowTabs.FREEZE_CONFIG)}
              isReadOnly={isReadOnly}
            />
          }
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
