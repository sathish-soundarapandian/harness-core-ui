import { Layout, PageBody, PageHeader, Container } from '@harness/uicore'
import React from 'react'
import { useStrings } from 'framework/strings'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import OverviewGlanceCardsV2 from './OverviewGlanceCardsContainer/OverviewGlanceCardsContainer'
import ModuleTiles from './ModuleTiles/ModuleTiles'
import PreferencesCard from './PreferencesCard/PreferencesCard'
import NotificationsCard from './NotificationsCard/NotificationsCard'

import ResourcesCard from './ResourcesCard/ResourcesCard'
import css from './OverviewDashboardPage.module.scss'

const OverviewDashboardPage = () => {
  const { currentUserInfo } = useAppStore()
  const name = currentUserInfo.name || currentUserInfo.email

  const { getString } = useStrings()

  return (
    <>
      <PageHeader
        title={getString('projectsOrgs.landingDashboard.dashboardTitle', {
          name
        })}
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
            <ModuleTiles />
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
