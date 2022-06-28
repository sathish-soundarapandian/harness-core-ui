import React from 'react'
import { useParams } from 'react-router-dom'
import { Card, Container, Text, FontVariation, Layout } from '@harness/uicore'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import formatCost from '@ce/utils/formatCost'
import { useGetFailedQueries, useGetScannedBytes, useGetSuccessfulQueries, useGetTotalCost } from 'services/ce'

const UsageInfo = ({ label, icon, usage, iconProps = {} }) => {
  return (
    <Container>
      <Text
        padding={{
          top: 'xsmall',
          bottom: 'xsmall'
        }}
        font={{ variation: FontVariation.H3 }}
      >
        {usage.toLocaleString('en-US')}
      </Text>
      <Text icon={icon} iconProps={iconProps} font={{ variation: FontVariation.SMALL }}>
        {label}
      </Text>
    </Container>
  )
}

const SummaryWidget = () => {
  const { accountId } = useParams<AccountPathProps>()

  const { data } = useGetFailedQueries({
    queryParams: {
      accountIdentifier: accountId
    }
  })

  const { data: successfulData } = useGetSuccessfulQueries({
    queryParams: {
      accountIdentifier: accountId
    }
  })

  const { data: scannedData } = useGetScannedBytes({
    queryParams: {
      accountIdentifier: accountId
    }
  })

  const { data: totalCostData } = useGetTotalCost({
    queryParams: {
      accountIdentifier: accountId
    }
  })

  const summaryData = {
    totalCost: {
      label: 'Total BigQuery Spend',
      cost: totalCostData?.data || 0,
      subLabel: 'month-to-date'
    },
    scannedData: {
      usage: scannedData?.data?.toFixed(2) || 0,
      label: 'scanned data (in TB)'
    },
    successfulQueries: {
      usage: successfulData?.data || 0,
      label: 'Successful Queries'
    },
    unSuccessfulQueries: {
      usage: data?.data || 0,
      label: 'Successful Queries'
    }
  }

  return (
    <Layout.Horizontal margin="large" spacing="large">
      <Card>
        <Container>
          <Text font={{ variation: FontVariation.SMALL }}>{summaryData.totalCost.label}</Text>
          <Text
            padding={{
              top: 'xsmall',
              bottom: 'xsmall'
            }}
            icon="gcp"
            iconProps={{
              size: 24
            }}
            font={{ variation: FontVariation.H3 }}
          >
            {formatCost(summaryData.totalCost.cost)}
          </Text>
          <Text font={{ variation: FontVariation.SMALL }}>{summaryData.totalCost.subLabel}</Text>
        </Container>
      </Card>
      <Card>
        <Container>
          <Text font={{ variation: FontVariation.SMALL }}>BigQuery Usage</Text>
          <Layout.Horizontal spacing="xlarge">
            <UsageInfo
              iconProps={{ size: 10 }}
              usage={summaryData.scannedData.usage}
              label={summaryData.scannedData.label}
              icon="doughnut-chart"
            />
            <UsageInfo
              usage={summaryData.successfulQueries.usage}
              label={summaryData.successfulQueries.label}
              icon="coverage-status-success"
            />
            <UsageInfo
              usage={summaryData.unSuccessfulQueries.usage}
              label={summaryData.unSuccessfulQueries.label}
              icon="coverage-status-error"
            />
          </Layout.Horizontal>
        </Container>
      </Card>
    </Layout.Horizontal>
  )
}

export default SummaryWidget
