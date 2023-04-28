/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'

import {
  Text,
  Layout,
  Card,
  Icon,
} from '@wings-software/uicore'
import { Color } from '@harness/design-system'

import { useStrings } from 'framework/strings'


import css from './HealthPage.module.scss'



const columnWidths = {
  icon: '80px',
  name: '25%',
  status: 'calc(15% - 40px)',
}

export const HealthListingHeader = () => {
  return (
    <Layout.Horizontal className={css.healthListHeader}>
      <div key="icon" style={{ width: columnWidths.icon }}></div>
      <div key="del-name" style={{ width: columnWidths.name }}>
        {"Service Name"}
      </div>
      <div key="status" style={{ width: columnWidths.status }}>
        {"Health Status"}
      </div>
    </Layout.Horizontal>
  )
}
export const HealthListingItem = ({ healthservice}) => {
  const isConnected = healthservice.status=="healthy"? true : false
  const text = isConnected ? "Healthy" : "Unhealthy"
  const color: Color = isConnected ? Color.GREEN_600 : Color.GREY_400
  return (
    <Card className={css.healthItemContainer}>
      <Layout.Horizontal className={css.healthItemSubcontainer}>
        <div style={{ width: columnWidths.icon }} className={css.healthItemIcon}>
          <Icon
            name={'chevron-right'}
            className={css.expandIcon}
            size={20}
            
          />
        </div>
        <Layout.Horizontal width={columnWidths.name}>
          <Layout.Vertical>
            <Layout.Horizontal spacing="small" data-testid={healthservice.serviceName}>
              <Text color={Color.BLACK}>{healthservice.serviceName}</Text>
            </Layout.Horizontal>
          </Layout.Vertical>
        </Layout.Horizontal>
        <Layout.Vertical width={columnWidths.status}>
          <Text icon="full-circle" iconProps={{ size: 6, color, padding: 'small' }}>
            {text}
          </Text>
          
        </Layout.Vertical>
      </Layout.Horizontal>
    </Card>
  )
}
export default HealthListingItem
