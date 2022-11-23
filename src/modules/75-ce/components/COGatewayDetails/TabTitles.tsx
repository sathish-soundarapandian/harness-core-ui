/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Icon, Layout, Text } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import css from './COGatewayDetails.module.scss'

interface TabTitle {
  isValidConfig?: boolean
  isValidAccessSetup?: boolean
}

export const ConfigTabTitle: React.FC<TabTitle> = props => {
  const { getString } = useStrings()
  return (
    <Layout.Horizontal>
      {props.isValidConfig ? (
        <Icon name="tick-circle" className={css.greenSymbol} size={16} />
      ) : (
        <Icon name="symbol-circle" className={css.symbol} size={16} />
      )}
      <Text className={css.tabTitle}>1. {getString('configuration')}</Text>
    </Layout.Horizontal>
  )
}

export const SetupAccessTabTitle: React.FC<TabTitle> = props => {
  const { getString } = useStrings()
  return (
    <Layout.Horizontal>
      {props.isValidAccessSetup ? (
        <Icon name="tick-circle" className={css.greenSymbol} size={16} />
      ) : (
        <Icon name="symbol-circle" className={css.symbol} size={16} />
      )}
      <Text className={css.tabTitle}>2. {getString('ce.co.autoStoppingRule.setupAccess.pageName')}</Text>
    </Layout.Horizontal>
  )
}

export const ReviewTabTitle: React.FC<TabTitle> = props => {
  const { getString } = useStrings()
  return (
    <Layout.Horizontal>
      {props.isValidConfig && props.isValidAccessSetup ? (
        <Icon name="tick-circle" className={css.greenSymbol} size={16} />
      ) : (
        <Icon name="symbol-circle" className={css.symbol} size={16} />
      )}
      <Text className={css.tabTitle}>3. {getString('review')}</Text>
    </Layout.Horizontal>
  )
}
