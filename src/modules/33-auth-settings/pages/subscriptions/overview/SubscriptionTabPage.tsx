/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Tabs, Card, Tab } from '@harness/uicore'
import pageCss from '../SubscriptionsPage.module.scss'
import { useStrings } from 'framework/strings'
import type { ModuleName } from 'framework/types/ModuleName'
import type { ModuleLicenseDTO } from 'services/cd-ng'
import CDUsageTable from './CDUsageTable'

interface SubscriptionTabPageProps {
  module: ModuleName
  licenseData?: ModuleLicenseDTO
}
enum SubscriptionDataTab {
  BREAKDOWN = 'BREAKDOWN',
  TREND = 'TREND'
}

const SubscriptionTabPage: React.FC<SubscriptionTabPageProps> = props => {
  const { getString } = useStrings()
  const [activeTab, setActiveTab] = React.useState(SubscriptionDataTab.BREAKDOWN)
  return (
    <Card className={pageCss.outterCard}>
      <Tabs
        id="subscription-data"
        className={pageCss.tabs}
        selectedTabId={activeTab}
        onChange={newTab => {
          //   manuallySelected.current = true
          //   setActiveTab(newTab as ApprovalStepTab)
        }}
      >
        <Tabs.Tab
          id={SubscriptionDataTab.BREAKDOWN}
          title={getString('common.subscriptions.tabs.breakdown')}
          panel={<CDUsageTable {...props} />}
        />
      </Tabs>
    </Card>
  )
}

export default SubscriptionTabPage
