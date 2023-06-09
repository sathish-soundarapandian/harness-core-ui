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
import { ModuleName } from 'framework/types/ModuleName'
import type { ModuleLicenseDTO } from 'services/cd-ng'
import routes from '@common/RouteDefinitions'
import { ModuleLicenseType } from '@common/constants/SubscriptionTypes'
import { isOnPrem } from '@common/utils/utils'

interface SubscriptionDetailsCardFooterProps {
  openMarketoContactSales: () => void
  licenseData?: ModuleLicenseDTO
  module: ModuleName
  isExpired: boolean
  expiredDays: number
}

const SubscriptionDetailsCardFooter = ({
  openMarketoContactSales,
  licenseData,
  module,
  isExpired,
  expiredDays
}: SubscriptionDetailsCardFooterProps): ReactElement => {
  const { getString } = useStrings()
  const history = useHistory()
  let moduleCloned = module
  if (module.toLowerCase() === 'srm') {
    moduleCloned = ModuleName.CV
  }
  const { accountId } = useParams<AccountPathProps>()
  const FREE_PLAN_ENABLED = !isOnPrem()
  function handleSubscribeClick(): void {
    history.push(
      routes.toModuleTrialHome({
        accountId,
        module: moduleCloned.toLowerCase() as Module
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
    <Button onClick={openMarketoContactSales}>{getString('common.banners.trial.expired.extendTrialSales')}</Button>
  )

  return (
    <Layout.Horizontal spacing="xxlarge">
      <React.Fragment>
        {!licenseData && FREE_PLAN_ENABLED && subscribeButton}
        {licenseData?.licenseType !== ModuleLicenseType.PAID && contactSalesButton}
        {licenseData?.licenseType !== ModuleLicenseType.PAID && isExpired && expiredDays < 15 && extendTrialButton}
      </React.Fragment>
    </Layout.Horizontal>
  )
}

export default SubscriptionDetailsCardFooter
