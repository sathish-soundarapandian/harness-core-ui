import { Container, Layout } from '@harness/uicore'
import React from 'react'
import InfoCard from './InfoCard/InfoCard'
import ModuleInfoContainer from './ModuleInfoContainer/ModuleInfoContainer'
import ResourcesCountContainer from './ResourcesCountContainer/ResourcesCountContainer'

const OverviewDashboardPage = () => {
  return (
    <Layout.Horizontal padding="large" style={{ justifyContent: 'center', backgroundColor: '#FAFCFF' }}>
      <Layout.Vertical style={{ width: 598, marginRight: 92 }}>
        <Container margin={{ bottom: 'large' }}>
          <ResourcesCountContainer />
        </Container>
        <ModuleInfoContainer />
      </Layout.Vertical>
      <Layout.Vertical style={{ width: 475 }}>
        <InfoCard />
        <InfoCard />
      </Layout.Vertical>
    </Layout.Horizontal>
  )
}

export default OverviewDashboardPage
