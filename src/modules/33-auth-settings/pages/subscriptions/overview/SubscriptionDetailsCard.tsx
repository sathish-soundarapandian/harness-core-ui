/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Card, Heading, Layout, PageSpinner } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import { useContactSalesMktoModal } from '@common/modals/ContactSales/useContactSalesMktoModal'
import type { ModuleName } from 'framework/types/ModuleName'
import type { ModuleLicenseDTO } from 'services/cd-ng'
import SubscriptionDetailsCardFooter from './SubscriptionDetailsCardFooter'
import type { TrialInformation } from '../SubscriptionsPage'
import SubscriptionDetailsCardBody from './SubscriptionDetailsCardBody'
import pageCss from '../SubscriptionsPage.module.scss'

interface SubscriptionDetailsCardProps {
  accountName?: string
  licenseData?: ModuleLicenseDTO
  module: ModuleName
  trialInformation: TrialInformation
}

const SubscriptionDetailsCard: React.FC<SubscriptionDetailsCardProps> = props => {
  const { accountName, module, licenseData, trialInformation } = props
  const { days, expiryDate, isExpired, expiredDays, edition, isFreeOrCommunity } = trialInformation

  const { getString } = useStrings()
  const { openMarketoContactSales, loading: loadingContactSales } = useContactSalesMktoModal({})

  const loading = loadingContactSales

  if (loading) {
    return <PageSpinner />
  }

  return (
    <Card className={pageCss.outterCard}>
      <Layout.Vertical spacing="xxlarge" flex={{ alignItems: 'baseline', justifyContent: 'space-between' }}>
        <Heading color={Color.BLACK} font={{ size: 'medium' }}>
          {getString('common.subscriptions.overview.details')}
        </Heading>
        <SubscriptionDetailsCardBody
          licenseData={licenseData}
          edition={edition}
          isFreeOrCommunity={isFreeOrCommunity}
          isExpired={isExpired}
          days={days}
          expiryDate={expiryDate}
          expiredDays={expiredDays}
          accountName={accountName}
        />
        <SubscriptionDetailsCardFooter
          openMarketoContactSales={openMarketoContactSales}
          licenseData={licenseData}
          module={module}
          isExpired={isExpired}
          expiredDays={expiredDays}
        />
      </Layout.Vertical>
    </Card>
  )
}

export default SubscriptionDetailsCard
