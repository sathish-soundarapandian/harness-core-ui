/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { ReactElement } from 'react'

import { useParams, useHistory } from 'react-router-dom'
import { Button, Layout } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import type { AccountPathProps, Module } from '@common/interfaces/RouteInterfaces'
import type { ModuleName } from 'framework/types/ModuleName'
import type { ModuleLicenseDTO } from 'services/cd-ng'
import routes from '@common/RouteDefinitions'
import { ModuleLicenseType } from '@common/constants/SubscriptionTypes'

interface SubscriptionDetailsCardFooterProps {
  openMarketoContactSales: () => void
  handleExtendTrial: () => Promise<void>
  licenseData?: ModuleLicenseDTO
  module: ModuleName
  isExpired: boolean
  expiredDays: number
}

const SubscriptionDetailsCardFooter = ({
  openMarketoContactSales,
  handleExtendTrial,
  licenseData,
  module,
  isExpired,
  expiredDays
}: SubscriptionDetailsCardFooterProps): ReactElement => {
  const { getString } = useStrings()
  const history = useHistory()
  const { accountId } = useParams<AccountPathProps>()

  function handleSubscribeClick(): void {
    history.push(
      routes.toModuleTrialHome({
        accountId,
        module: module.toLowerCase() as Module
      })
    )
  }
  const subscribeButton = (
    <Button onClick={handleSubscribeClick} intent="primary">
      {getString('common.subscriptions.overview.subscribe')}
    </Button>
  )

  const contactSalesButton = (
    <Button intent="primary" onClick={openMarketoContactSales}>
      {getString('common.banners.trial.contactSales')}
    </Button>
  )

  const extendTrialButton = (
    <Button onClick={handleExtendTrial}>{getString('common.banners.trial.expired.extendTrial')}</Button>
  )

  return (
    <Layout.Horizontal spacing="xxlarge">
      <React.Fragment>
        {!licenseData && subscribeButton}
        {licenseData?.licenseType !== ModuleLicenseType.PAID && contactSalesButton}
        {licenseData?.licenseType !== ModuleLicenseType.PAID && isExpired && expiredDays < 15 && extendTrialButton}
      </React.Fragment>
    </Layout.Horizontal>
  )
}

export default SubscriptionDetailsCardFooter
