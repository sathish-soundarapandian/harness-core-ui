/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import { Service, ServiceLog, useLogsOfService } from 'services/lw'
import { SimpleLogViewer } from '@common/components/LogViewer/SimpleLogViewer'
import css from './COGatewayList.module.scss'

interface COGatewayLogsProps {
  service: Service | undefined
}

const logColorMap = {
  errored: '\u001b[31;1m', // red
  active: '\u001b[32m', // green
  normal: '\u001b[30m' // black
}

function getLogs(logs: ServiceLog[] | undefined): string {
  if (!logs) {
    return ''
  }
  let logLine = ''

  logs.map(l => {
    if (l.error) {
      logLine += `${logColorMap.errored}${l.created_at}  Rule state changed to: ${l.state} ${l.error ? l.error : ''} ${
        l.message ? l.message : ''
      }\n`
    } else if (l.state == 'active') {
      logLine += `${logColorMap.active}${l.created_at}  Rule state changed to: ${l.state} ${
        l.message ? l.message : ''
      }\n`
    } else {
      logLine += `${logColorMap.normal}${l.created_at}  Rule state changed to: ${l.state} ${l.error ? l.error : ''} ${
        l.message ? l.message : ''
      }\n`
    }
  })

  return logLine
}

const COGatewayLogs: React.FC<COGatewayLogsProps> = props => {
  const { accountId } = useParams<{
    accountId: string
    orgIdentifier: string
    projectIdentifier: string
  }>()
  const { data, loading } = useLogsOfService({
    account_id: accountId,
    rule_id: props.service?.id as number,
    queryParams: {
      accountIdentifier: accountId
    }
  })

  return <SimpleLogViewer className={css.gatewayLogView} data={getLogs(data?.response)} loading={loading} />
}

export default COGatewayLogs
