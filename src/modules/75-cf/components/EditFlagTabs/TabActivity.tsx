/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Container } from '@harness/uicore'
import { AuditLogObjectType } from '@cf/utils/CFUtils'
import type { Feature } from 'services/cf'
import { AuditLogs } from '../AuditLogs/AuditLogs'

const TabActivity: React.FC<{ flagData: Feature }> = ({ flagData }) => {
  return (
    <Container
      style={{
        marginTop: '-20px',
        height: 'calc(100vh - 135px)',
        overflow: 'auto'
      }}
    >
      <AuditLogs flagData={flagData} objectType={AuditLogObjectType.FeatureActivation} />
    </Container>
  )
}

export default TabActivity
