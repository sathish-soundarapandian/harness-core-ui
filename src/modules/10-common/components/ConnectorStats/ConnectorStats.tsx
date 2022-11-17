/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import * as moment from 'moment'
import { Layout, Text } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { StringUtils } from '@common/exports'
import type { ConnectorConnectivityDetails } from 'services/cd-ng'
import i18n from './ConnectorStats.i18n'
import css from './ConnectorStats.module.scss'

interface ConnectorStatsProps {
  createdAt: number
  lastTested?: number
  lastUpdated?: number
  lastConnected?: number
  status: ConnectorConnectivityDetails['status']
  className?: string
}
const TestStatus = {
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED'
}

const getValue = (value?: number) => {
  return value ? moment.unix(value / 1000).format(StringUtils.DEFAULT_DATE_FORMAT) : null
}

const ConnectorStats: React.FC<ConnectorStatsProps> = props => {
  const { createdAt, lastUpdated, lastTested, lastConnected, className } = props
  const nameValue = [
    {
      name: i18n.connectorCreated,
      value: getValue(createdAt)
    },
    {
      name: i18n.lastTested,
      value: getValue(lastTested)
    },
    {
      name: i18n.lastUpdated,
      value: getValue(lastUpdated)
    },
    {
      name: i18n.lastConnectorSuccess,
      value: getValue(lastConnected)
    }
  ]
  return (
    <>
      <Layout.Vertical className={className || css.connectorStats} spacing="large">
        {nameValue.map((item, index) => {
          if (item.value) {
            return (
              <Layout.Horizontal key={index} spacing="large" className={css.nameValueItem}>
                <span className={css.name}>{item.name}</span>
                <span className={css.value}>{item.value}</span>
                {item.name === i18n.lastTested && lastTested ? (
                  <Text
                    inline
                    icon={props.status === TestStatus.SUCCESS ? 'full-circle' : 'warning-sign'}
                    iconProps={{
                      size: props.status === TestStatus.SUCCESS ? 6 : 12,
                      color: props.status === TestStatus.SUCCESS ? Color.GREEN_500 : Color.RED_500
                    }}
                  >
                    {props.status === TestStatus.SUCCESS ? i18n.success : i18n.failed}
                  </Text>
                ) : null}
              </Layout.Horizontal>
            )
          }
        })}
      </Layout.Vertical>
    </>
  )
}
export default ConnectorStats
