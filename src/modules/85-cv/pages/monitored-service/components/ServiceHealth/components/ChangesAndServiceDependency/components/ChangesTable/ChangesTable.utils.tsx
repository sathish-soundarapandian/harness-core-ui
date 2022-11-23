/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import moment from 'moment'
import { Text, Container } from '@harness/uicore'
import type { Renderer, CellProps } from 'react-table'
import { timeFormat, dateFormat } from './ChangesTable.constants'
import css from './ChangeTable.module.scss'

export const renderTime: Renderer<CellProps<any>> = ({ row }): JSX.Element => {
  const rowdata = row?.original
  const date = moment(rowdata.eventTime).format(dateFormat)
  const time = moment(rowdata.eventTime).format(timeFormat)
  return (
    <>
      <Text font={{ size: 'small' }}>{date}</Text>
      <Text font={{ size: 'xsmall' }}>{time}</Text>
    </>
  )
}

export const renderName: Renderer<CellProps<any>> = ({ row }): JSX.Element => {
  const rowdata = row?.original
  return (
    <Container className={css.changeSoureName}>
      <Text tooltip={rowdata.name} font={{ size: 'small' }}>
        {rowdata.name}
      </Text>
    </Container>
  )
}

export const renderImpact: Renderer<CellProps<any>> = ({ row }): JSX.Element => {
  const rowdata = row?.original
  return (
    <>
      <Text font={{ size: 'small' }}>{rowdata.serviceName}</Text>
      <Text font={{ size: 'xsmall' }}>{rowdata.environmentName}</Text>
    </>
  )
}

export const renderType: Renderer<CellProps<any>> = ({ row }): JSX.Element => {
  const rowdata = row?.original
  return (
    <Container className={css.changeSoureName}>
      <Text className={css.sourceName} font={{ size: 'small' }}>
        {rowdata.type}
      </Text>
    </Container>
  )
}

export const renderChangeType: Renderer<CellProps<any>> = ({ row }): JSX.Element => {
  const rowdata = row?.original
  return <Text font={{ size: 'small' }}>{rowdata.category === 'Alert' ? 'Incident' : rowdata.category}</Text>
}
