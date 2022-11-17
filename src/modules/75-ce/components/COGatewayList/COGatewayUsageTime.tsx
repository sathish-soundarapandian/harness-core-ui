/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import { Text, ModalErrorHandler, ModalErrorHandlerBinding, Page, TableV2 } from '@harness/uicore'
import moment from 'moment'
import { Color } from '@harness/design-system'
import { useParams } from 'react-router-dom'
import type { CellProps } from 'react-table'
import { useStrings } from 'framework/strings'
import { Service, SessionReportRow, useGatewaySessionReport } from 'services/lw'
import useRBACError from '@rbac/utils/useRBACError/useRBACError'
import { getTimestamp } from './Utils'
import css from './COGatewayList.module.scss'

interface COGatewayUsageTimeProps {
  service: Service | undefined
}
function convertToDuration(t: number): string {
  const durationMap = []
  const cd = 24 * 60 * 60 * 1000,
    ch = 60 * 60 * 1000
  let d = Math.floor(t / cd),
    h = Math.floor((t - d * cd) / ch),
    m = Math.round((t - d * cd - h * ch) / 60000)
  const pad = function (n: number) {
    return n < 10 ? '0' + n : n
  }
  if (m === 60) {
    h++
    m = 0
  }
  if (h === 24) {
    d++
    h = 0
  }
  if (d > 0) {
    durationMap.push(`${d} d`)
  }
  if (h > 0) {
    durationMap.push(`${pad(h)} h`)
  }
  if (m > 0) {
    durationMap.push(`${pad(m)} m`)
  }
  return durationMap.join(' ')
}
const DATE_FORMAT = 'YYYY-MM-DDTHH:mm:ssZ'
const today = () => moment()
const startOfDay = (time: moment.Moment) => time.startOf('day').toDate()
function TableCell(tableProps: CellProps<SessionReportRow>): JSX.Element {
  return (
    <Text lineClamp={3} color={Color.BLACK}>
      {getTimestamp(tableProps.value, 'DD-MM-YYYY HH:mm:ss')}
    </Text>
  )
}
function DurationCell(tableProps: CellProps<SessionReportRow>): JSX.Element {
  const milliseconds = tableProps.value * 60 * 60 * 1000
  return (
    <Text lineClamp={3} color={Color.BLACK}>
      {convertToDuration(milliseconds)}
    </Text>
  )
}
const COGatewayUsageTime: React.FC<COGatewayUsageTimeProps> = props => {
  const { accountId } = useParams<{
    orgIdentifier: string
    accountId: string
  }>()
  const { getRBACErrorMessage } = useRBACError()
  const { getString } = useStrings()
  const { mutate: getSessionReport } = useGatewaySessionReport({
    account_id: accountId,
    queryParams: {
      accountIdentifier: accountId
    }
  })
  const [sessionReportRows, setSessionReportRows] = useState<SessionReportRow[]>([])
  const [modalErrorHandler, setModalErrorHandler] = useState<ModalErrorHandlerBinding | undefined>()

  useEffect(() => {
    if (!props.service) return
    loadSessionReport()
  }, [props.service])
  const loadSessionReport = async (): Promise<void> => {
    try {
      const result = await getSessionReport({
        from: moment(startOfDay(today().subtract(7, 'days'))).format(DATE_FORMAT),
        to: today().format(DATE_FORMAT),
        report_name: 'GATEWAY-SESSION-WISE', // eslint-disable-line
        service_ids: [props.service?.id as number], // eslint-disable-line
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      })
      if (result && result.response && result.response.rows) {
        setSessionReportRows(result.response.rows)
      }
    } catch (e) {
      modalErrorHandler?.showDanger(getRBACErrorMessage(e))
    }
  }
  return (
    <Page.Body className={css.pageContainer}>
      <ModalErrorHandler bind={setModalErrorHandler} />
      {sessionReportRows.length ? (
        <TableV2<SessionReportRow>
          data={sessionReportRows}
          columns={[
            {
              accessor: 'start',
              Header: 'Started At',
              width: '35%',
              Cell: TableCell
            },
            {
              accessor: 'end',
              Header: 'Ended At',
              width: '35%',
              Cell: TableCell
            },
            {
              accessor: 'hours',
              Header: 'Duration',
              width: '30%',
              Cell: DurationCell
            }
          ]}
        />
      ) : (
        <Text style={{ alignSelf: 'center', fontSize: 'var(--font-size-medium)', padding: 'var(--spacing-large)' }}>
          {getString('ce.co.noData')}
        </Text>
      )}
    </Page.Body>
  )
}

export default COGatewayUsageTime
