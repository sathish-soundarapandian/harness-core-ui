/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Card } from '@harness/uicore'
import { Tabs } from '@blueprintjs/core'
import { useStrings } from 'framework/strings'
import { ModuleName } from 'framework/types/ModuleName'
import type { ModuleLicenseDTO } from 'services/cd-ng'
import SubscriptionUsageView from './SubscriptionUsageView'
import SubscriptionGraphView from './SubscriptionGraphVIew'
import pageCss from '../SubscriptionsPage.module.scss'
interface SubscriptionTabPageProps {
  module: ModuleName
  licenseData?: ModuleLicenseDTO
  accountId: string
  licenseType: 'SERVICES' | 'SERVICE_INSTANCES' | undefined
}

enum SubscriptionDataTab {
  BREAKDOWN = 'BREAKDOWN',
  TREND = 'TREND'
}

function SubscriptionTabPage(props: SubscriptionTabPageProps) {
  const { getString } = useStrings()
  const [activeTab, setActiveTab] = React.useState(SubscriptionDataTab.BREAKDOWN)
  if (props.module !== ModuleName.CI && props.module !== ModuleName.CD) {
    return <></>
  }
  return (
    <Card>
      <Tabs
        id="subscription-data"
        className={pageCss.tabs}
        selectedTabId={activeTab}
        onChange={newTab => {
          setActiveTab(newTab as SubscriptionDataTab)
        }}
      >
        <Tabs.Tab
          id={SubscriptionDataTab.BREAKDOWN}
          title={getString('common.subscriptions.tabs.breakdown')}
          panel={<SubscriptionUsageView {...props} />}
        />

        <Tabs.Tab
          id={SubscriptionDataTab.TREND}
          title={getString('common.subscriptions.tabs.trend')}
          panel={<SubscriptionGraphView {...props} />}
        />
      </Tabs>
    </Card>
  )
}

export default SubscriptionTabPage
