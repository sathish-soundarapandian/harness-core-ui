import React from 'react'
import type { GetDataError } from 'restful-react'
import type { Column } from 'react-table'
import moment from 'moment'
import { Container, Layout, NoDataCard, PageError, TableV2, Text } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import Card from '@cv/components/Card/Card'
import { useDrawer } from '@cv/hooks/useDrawerHook/useDrawerHook'
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

  const { showDrawer: showLogMessageDrawer } = useDrawer({
    createHeader: () => {
      return (
        <Text font={{ variation: FontVariation.FORM_TITLE }}>
          {getString('cv.monitoringSources.commonHealthSource.logsTable.sampleLogMessageDrawerTitle')}
        </Text>
      )
    },
    createDrawerContent: ({ rowData }: { rowData: LogRecord }) => {
      if (!rowData) {
        return <></>
      }

      return (
        <Layout.Vertical padding="medium" height="100%">
          <Layout.Horizontal margin={{ bottom: 'medium' }}>
            <Layout.Vertical spacing="xsmall" margin={{ right: 'medium' }}>
              <Text font={{ variation: FontVariation.FORM_LABEL }}>{getString('cv.dateAndTimeLabel')}</Text>
              <Text font={{ variation: FontVariation.BODY }}>
                {moment(rowData.timestamp).format('MMM D, YYYY hh:mm:ss A')}
              </Text>
            </Layout.Vertical>
            <Layout.Vertical spacing="xsmall">
              <Text font={{ variation: FontVariation.FORM_LABEL }}>
                {getString('cv.monitoringSources.commonHealthSource.logsTable.ServiceInstance')}
              </Text>
              <Text font={{ variation: FontVariation.BODY }}>{rowData.serviceInstance}</Text>
            </Layout.Vertical>
          </Layout.Horizontal>
          <Card className={css.drawerLogMessage}>
            <Text font={{ variation: FontVariation.YAML }} color={Color.GREY_800}>
              {rowData.message}
            </Text>
          </Card>
        </Layout.Vertical>
      )
    },
    drawerOptions: { size: '40%', canOutsideClickClose: true },
    showConfirmationDuringClose: false
  })

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
      accessor: row => <Text color={Color.GREY_800}>{row.message}</Text>,
      width: '60%'
    }
  ]

  return (
    <TableV2
      onRowClick={rowData => {
        showLogMessageDrawer({ rowData })
      }}
      className={css.logsTable}
      columns={tableColumns}
      data={sampleData?.slice(0, 20)}
      sortable
    />
  )
}
