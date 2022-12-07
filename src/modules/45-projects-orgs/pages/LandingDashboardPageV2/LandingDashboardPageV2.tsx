/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Layout, PageBody, PageHeader } from '@harness/uicore'
import React, { useState } from 'react'
import TimeRangePicker from '@common/components/TimeRangePicker/TimeRangePicker'
import { DEFAULT_TIME_RANGE } from '@common/utils/momentUtils'
import type { TimeRangeFilterType } from '@common/types'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { useStrings } from 'framework/strings'
import OverviewGlanceCardsV2 from './OverviewGlanceCardsContainer/OverviewGlanceCardsContainer'
import NotificationsCard from './NotificationsCard/NotificationsCard'
import css from './LandingDashboardPageV2.module.scss'

const LandingDashboardPageV2 = () => {
  const { currentUserInfo } = useAppStore()
  const [timeRange, setTimeRange] = useState<TimeRangeFilterType>(DEFAULT_TIME_RANGE)
  const name = currentUserInfo.name || currentUserInfo.email

  const { getString } = useStrings()

  return (
    <>
      <PageHeader
        title={getString('projectsOrgs.landingDashboard.dashboardTitle', {
          name
        })}
        toolbar={
          <TimeRangePicker timeRange={timeRange} disableCustomRange setTimeRange={range => setTimeRange(range)} />
        }
      />
      <PageBody>
        <Layout.Horizontal
          className={css.container}
          padding={{ top: 'huge' }}
          flex={{ justifyContent: 'center', alignItems: 'flex-start' }}
        >
          <Layout.Vertical className={css.left}>
            <OverviewGlanceCardsV2 timeRange={timeRange} />
          </Layout.Vertical>
          <Layout.Vertical className={css.right}>
            <NotificationsCard timeRange={timeRange} />
          </Layout.Vertical>
        </Layout.Horizontal>
      </PageBody>
    </>
  )
}

export default LandingDashboardPageV2
