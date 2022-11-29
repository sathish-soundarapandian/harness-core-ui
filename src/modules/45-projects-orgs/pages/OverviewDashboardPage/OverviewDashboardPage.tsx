import { Layout, PageBody, PageHeader, Container } from '@harness/uicore'
import React, { useState } from 'react'
import { useStrings } from 'framework/strings'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import TimeRangePicker from '@common/components/TimeRangePicker/TimeRangePicker'
import { DEFAULT_TIME_RANGE } from '@common/utils/momentUtils'
import type { TimeRangeFilterType } from '@common/types'
import OverviewGlanceCardsV2 from './OverviewGlanceCardsContainer/OverviewGlanceCardsContainer'
import ModuleTiles from './ModuleTiles/ModuleTiles'
import PreferencesCard from './PreferencesCard/PreferencesCard'
import NotificationsCard from './NotificationsCard/NotificationsCard'
import ResourcesCard from './ResourcesCard/ResourcesCard'
import css from './OverviewDashboardPage.module.scss'

const OverviewDashboardPage = () => {
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
            <OverviewGlanceCardsV2 />
            <Container className={css.border} />
            <ModuleTiles selectedTimeRange={timeRange} />
          </Layout.Vertical>
          <Layout.Vertical className={css.right}>
            <PreferencesCard />
            <NotificationsCard />
            <ResourcesCard />
          </Layout.Vertical>
        </Layout.Horizontal>
      </PageBody>
    </>
  )
}

export default OverviewDashboardPage
