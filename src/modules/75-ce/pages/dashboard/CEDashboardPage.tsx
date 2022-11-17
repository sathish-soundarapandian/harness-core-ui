/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Container, Heading, Text, Icon, Layout } from '@harness/uicore'
import { Page } from '@common/exports'
import { useStrings } from 'framework/strings'

export const CEDashboardPage: React.FC = () => {
  const { getString } = useStrings()
  return (
    <Page.Body>
      <Container width={600} style={{ margin: '0 auto', paddingTop: 200 }}>
        <Layout.Vertical spacing="large" flex>
          <Heading>{getString('ce.dashboardPage.welcome')}</Heading>
          <Text>{getString('ce.dashboardPage.description')}</Text>
          <Icon name="nav-cd" size={200} />
        </Layout.Vertical>
      </Container>
    </Page.Body>
  )
}

export default CEDashboardPage
