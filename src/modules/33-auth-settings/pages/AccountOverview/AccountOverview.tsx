/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import { Page } from '@common/exports'
import { useStrings } from 'framework/strings'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import AccountDetails from '@auth-settings/pages/AccountOverview/views/AccountDetails'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import SubscribedModules from '@auth-settings/pages/AccountOverview/views/SubscribedModules'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import AccountSettings from './views/Settings/AccountSettings'

const AccountOverview: React.FC = () => {
  const { getString } = useStrings()
  const { accountId } = useParams<AccountPathProps>()
  const { currentUserInfo } = useAppStore()
  const { NG_LICENSES_ENABLED, DISABLE_HARNESS_SM } = useFeatureFlags()

  const { accounts } = currentUserInfo
  const createdFromNG = accounts?.find(account => account.uuid === accountId)?.createdFromNG
  return (
    <>
      <Page.Header title={getString('common.accountOverview')} />
      <Page.Body>
        <AccountDetails />
        {(createdFromNG || NG_LICENSES_ENABLED) && <SubscribedModules />}
        {DISABLE_HARNESS_SM ? <AccountSettings /> : null}
      </Page.Body>
    </>
  )
}

export default AccountOverview
