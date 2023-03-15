/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'

import { Layout } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import { ModuleName } from 'framework/types/ModuleName'

import type { ModuleLicenseDTO } from 'services/cd-ng'

import CDUsageTable from './CDUsageTable'

import css from '../SubscriptionsPage.module.scss'

interface SubscriptionUsageViewProps {
  module: ModuleName
  licenseData: ModuleLicenseDTO
}

const getModuleUsagesTable = (props: SubscriptionUsageViewProps): React.ReactElement | undefined => {
  switch (props.module) {
    // case ModuleName.CI:
    //   return <CIUsageTable />
    case ModuleName.CD:
      return <CDUsageTable {...props} />
    default:
      return undefined
  }
}

const SubscriptionUsageView: React.FC<SubscriptionUsageViewProps> = props => {
  const { getString } = useStrings()
  const usageModuleTable = getModuleUsagesTable(props)
  return usageModuleTable ? (
    <Layout.Vertical spacing="xxlarge" flex={{ alignItems: 'baseline', justifyContent: 'space-between' }}>
      {usageModuleTable}
    </Layout.Vertical>
  ) : (
    <></>
  )
}

export default SubscriptionUsageView
