import React from 'react'
import type { GetDataError } from 'restful-react'
import type { Column } from 'react-table'
import moment from 'moment'
import { Container, NoDataCard, PageError, TableV2, Text } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import noData from '@cv/assets/noData.svg'
import type { LogRecord } from 'services/cv'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import css from '../../LogsTable.module.scss'

interface LogsTableComponentProps {
  loading?: boolean
  error?: GetDataError<unknown> | null
  fetchSampleRecords: () => void
  sampleData?: LogRecord[] | null
}

export default function LogsTableComponent(props: LogsTableComponentProps): JSX.Element | null {
  const { loading, error, sampleData, fetchSampleRecords } = props

  const { getString } = useStrings()

  if (error) {
    return (
      <Container className={css.noRecords}>
        <PageError message={getErrorMessage(error)} onClick={fetchSampleRecords} />
      </Container>
    )
  }

  if (loading || !sampleData) {
    return null
  }

  if (Array.isArray(sampleData) && !sampleData.length) {
    return (
      <Container className={css.noRecords}>
        <NoDataCard
          message={getString('cv.monitoringSources.commonHealthSource.logsTable.noSampleAvailable')}
          image={noData}
          imageClassName={css.noDataImage}
          containerClassName={css.noData}
        />
      </Container>
    )
  }

  const tableColumns: Array<Column<LogRecord>> = [
    {
      Header: getString('cv.monitoringSources.commonHealthSource.logsTable.timestamp'),
      id: 'timestamp',
      accessor: row => {
        {
          const dateTime = moment(row.timestamp).format('MMM D, YYYY hh:mm:ss A')
          return <Text color={Color.GREY_800}>{dateTime}</Text>
        }
      },
      width: '24%'
    },
    {
      Header: getString('cv.monitoringSources.commonHealthSource.logsTable.ServiceInstance'),
      id: 'serviceInstance',
      accessor: row => (
        <Text color={Color.GREY_800} tooltip={row.serviceInstance}>
          {row.serviceInstance}
        </Text>
      ),
      width: '18%'
    },
    {
      Header: getString('message'),
      id: 'message',
      accessor: row => (
        <Text color={Color.GREY_800} tooltip={row.message}>
          {row.message}
        </Text>
      ),
      width: '60%'
    }
  ]

  return <TableV2 className={css.logsTable} columns={tableColumns} data={sampleData?.slice(0, 20)} sortable />
}
