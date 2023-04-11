/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { ReactElement, useState, useEffect } from 'react'
import cx from 'classnames'

import { useParams, useHistory } from 'react-router-dom'
import { Button, Layout } from '@harness/uicore'
import type { Editions } from '@common/constants/SubscriptionTypes'
import { CIUsageTabNames, ModuleLicenseType } from '@common/constants/SubscriptionTypes'
import { useStrings } from 'framework/strings'
import { useQueryParams } from '@common/hooks'
import type { ModuleName } from 'framework/types/ModuleName'
import type { AccountDTO, ModuleLicenseDTO } from 'services/cd-ng'
import routes from '@common/RouteDefinitions'
import type { AccountPathProps, Module } from '@common/interfaces/RouteInterfaces'
import type { StringsMap } from 'stringTypes'
import { useGetCommunity, isOnPrem } from '@common/utils/utils'
import SubscriptionOverview from './overview/SubscriptionOverview'
import SubscriptionBanner from './SubscriptionBanner'
import SubscriptionPlans from './plans/SubscriptionPlans'
import css from './SubscriptionsPage.module.scss'

export interface CIUsageTabInfo {
  name: CIUsageTabNames
  label: keyof StringsMap
}

export const CI_USAGE_TABS: CIUsageTabInfo[] = [
  {
    name: SubscriptionTabNames.BREAKDOWN,
    label: 'common.subscriptions.tabs.breakdown'
  },
  {
    name: SubscriptionTabNames.TREND,
    label: 'common.subscriptions.tabs.trend'
  }
]

interface SubscriptionTabProps {
  trialInfo: TrialInformation
  hasLicense?: boolean
  selectedModule: ModuleName
  licenseData?: ModuleLicenseDTO
  refetchGetLicense: () => void
  accountData?: AccountDTO
}

const CIUsageTab = ({
  accountData,
  trialInfo,
  selectedModule,
  hasLicense,
  licenseData,
  refetchGetLicense
}: SubscriptionTabProps): ReactElement => {
  const isCommunity = useGetCommunity()
  const [selectedCIUsageTab, setSelectedCIUsageTab] = useState<SubscriptionTabInfo>(CI_USAGE_TABS[0])
  const { getString } = useStrings()
  const { tab: queryTab } = useQueryParams<{ tab?: SubscriptionTabNames }>()
  const { accountId } = useParams<AccountPathProps>()
  const history = useHistory()
  const { isFreeOrCommunity, edition, isExpired, expiredDays, days } = trialInfo

  useEffect(() => {
    if (queryTab) {
      setSelectedSubscriptionTab(CI_USAGE_TABS.find(tab => tab.name === queryTab) || CI_USAGE_TABS[0])
    }
  }, [queryTab])

  function getSubscriptionTabButtons(): React.ReactElement[] {
    const tabs = CI_USAGE_TABS.map(tab => {
      function handleTabClick(): void {
        history.push(routes.toCIUsage({ accountId, tab: tab.name }))
      }

      const isSelected = tab === selectedCIUsageTab
      const buttonClassnames = cx(css.subscriptionTabButton, isSelected && css.selected)
      return (
        <Button className={buttonClassnames} key={tab.label} round onClick={handleTabClick}>
          {getString(tab.label)}
        </Button>
      )
    })

    return tabs
  }

  function getTabComponent(): React.ReactElement | null {
    switch (selectedCIUsageTab.name) {
      case CIUsageTabNames.BREAKDOWN:
        return <SubscriptionPlans module={selectedModule} />
      case CIUsageTabNames.TREND:
      default:
        return (
          <SubscriptionOverview
            accountName={accountData?.name}
            module={selectedModule}
            licenseData={licenseData}
            trialInformation={trialInfo}
            refetchGetLicense={refetchGetLicense}
          />
        )
    }
  }

  return (
    <React.Fragment>
      <Layout.Horizontal className={css.subscriptionTabButtons} spacing="medium">
        {getSubscriptionTabButtons()}
      </Layout.Horizontal>
      {getTabComponent()}
    </React.Fragment>
  )
}

export default CIUsageTab
