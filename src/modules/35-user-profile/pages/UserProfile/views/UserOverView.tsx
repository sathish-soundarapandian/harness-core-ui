/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Container } from '@harness/uicore'
import UserSummaryTab from './UserSummaryTab'

const UserOverView: React.FC = () => {
  return (
    <Container padding="xlarge">
      <UserSummaryTab />
      {/* <Tabs id="overview"> */}
      {/* <Tab id="summary" title={<Text color={Color.BLACK}>{getString('summary')}</Text>} panel={<UserSummaryTab />} /> */}
      {/* <Tab
          id="authentication"
          title={<Text color={Color.BLACK}>{getString('authentication')}</Text>}
          panel={<UserAuthenticationTab />}
        />
        <Tab
          id="permissions"
          title={<Text color={Color.BLACK}>{getString('permissions')}</Text>}
          panel={<UserPermissionsTab />}
        />
        <Tab
          id="activityLog"
          title={<Text color={Color.BLACK}>{getString('activityLog')}</Text>}
          panel={<UserActivityLogTab />}
        /> */}
      {/* </Tabs> */}
    </Container>
  )
}

export default UserOverView
