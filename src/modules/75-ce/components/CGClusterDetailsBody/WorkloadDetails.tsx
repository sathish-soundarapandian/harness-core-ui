/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
import cx from 'classnames'
import { useParams } from 'react-router-dom'
import { get } from 'lodash-es'
import type { CellProps, Column } from 'react-table'
import {
  Button,
  ButtonVariation,
  Color,
  Container,
  ExpandingSearchInput,
  FontVariation,
  Icon,
  Layout,
  PageSpinner,
  Select,
  TableV2,
  Text,
  TextInput,
  Utils
} from '@harness/uicore'
import { useStrings } from 'framework/strings'
import formatCost from '@ce/utils/formatCost'
import { useGetClusterWorkloadsList, useGetClusterWorkloadsSummary } from 'services/lw'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import CEChart from '../CEChart/CEChart'
import css from './CGClusterDetailsBody.module.scss'

const WorkloadDetails: React.FC = () => {
  const { accountId, id, cloudId } = useParams<AccountPathProps & { id: string; cloudId: string }>()
  const { getString } = useStrings()

  const { data, loading } = useGetClusterWorkloadsSummary({
    account_id: accountId,
    clusterId: id,
    queryParams: { accountIdentifier: accountId, cloud_account_id: cloudId }
  })

  const summaryData = get(data, 'response', {})

  if (loading) {
    return <PageSpinner />
  }

  return (
    <Container padding={'xlarge'}>
      <Layout.Vertical className={css.infoCard} spacing="large">
        <Layout.Horizontal spacing={'large'}>
          <Layout.Vertical spacing={'large'} className={cx(css.infoCard, css.elongatedCard)}>
            <Text font={{ variation: FontVariation.LEAD }} color={Color.GREY_600}>
              {getString('ce.computeGroups.clusterSpend')}
            </Text>
            <Text font={{ variation: FontVariation.H3 }}>{formatCost(get(summaryData, 'cost.spend', 0))}</Text>
          </Layout.Vertical>
          <Layout.Vertical spacing={'large'} className={cx(css.infoCard, css.elongatedCard)}>
            <Text font={{ variation: FontVariation.LEAD }} color={Color.GREY_600}>
              {getString('ce.computeGroups.replicas')}
            </Text>
            <Text font={{ variation: FontVariation.H3 }}>{get(summaryData, 'replicas', 0)}</Text>
          </Layout.Vertical>
          <Layout.Vertical spacing={'large'} className={css.infoCard}>
            <Text font={{ variation: FontVariation.LEAD }} color={Color.GREY_600}>
              {getString('ce.computeGroups.totalSpotSavings')}
            </Text>
            <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'flex-start' }} spacing="small">
              <Text font={{ variation: FontVariation.H3 }} color={Color.GREEN_700}>
                {formatCost(get(summaryData, 'cost.spot_savings')) + '*'}
              </Text>
              <Text font={{ variation: FontVariation.H6 }} color={Color.GREEN_700}>
                (61%)
              </Text>
            </Layout.Horizontal>
            <Text font={{ variation: FontVariation.SMALL }} color={Color.GREY_600}>
              {getString('ce.computeGroups.clusterDetails.comparedText')}
            </Text>
          </Layout.Vertical>
        </Layout.Horizontal>
        <Layout.Vertical spacing={'large'}>
          <Layout.Horizontal flex>
            <Text font={{ variation: FontVariation.H4 }}>{getString('pipeline.dashboards.workloads')}</Text>
            <Layout.Horizontal spacing={'huge'}>
              <Layout.Horizontal
                spacing={'large'}
                flex
                padding={{ right: 'large' }}
                style={{ borderRight: '1px solid var(--grey-200)' }}
              >
                <ExpandingSearchInput alwaysExpanded />
                <Icon name="ng-filter" size={20} color={Color.PRIMARY_7} />
              </Layout.Horizontal>
              <Container>
                <Button
                  text={getString('viewDetails')}
                  rightIcon="main-share"
                  iconProps={{ size: 12, color: Color.PRIMARY_7 }}
                  variation={ButtonVariation.SECONDARY}
                  font={{ variation: FontVariation.SMALL }}
                />
              </Container>
            </Layout.Horizontal>
          </Layout.Horizontal>
          <WorkloadDetailsTable />
        </Layout.Vertical>
      </Layout.Vertical>
    </Container>
  )
}

const DistributionCell = () => {
  const { getString } = useStrings()
  return (
    <Layout.Horizontal spacing={'large'} className={css.distributionCell}>
      <Container>
        <Text className={css.head}>{getString('ce.nodeRecommendation.spot')}</Text>
        <Text className={css.value}>{`0 (0%)`}</Text>
      </Container>
      <Container>
        <Text className={css.head}>{getString('ce.nodeRecommendation.onDemand')}</Text>
        <Text className={css.value}>{`1 (100%)`}</Text>
      </Container>
      <Container flex={{ justifyContent: 'center' }}>
        <Icon name="Edit" />
      </Container>
    </Layout.Horizontal>
  )
}

const StrategyCell = () => {
  const { getString } = useStrings()
  return (
    <Layout.Vertical spacing={'small'} className={css.strategyCell}>
      <Select
        defaultSelectedItem={{
          label: getString('ce.recommendation.detailsPage.costOptimized'),
          value: 'costOptimized'
        }}
        items={[
          { label: getString('ce.recommendation.detailsPage.costOptimized'), value: 'costOptimized' },
          { label: getString('ce.computeGroups.leastInterrupted'), value: 'leastInterrupted' }
        ]}
      />
      <TextInput placeholder={getString('ce.computeGroups.baseOnDemandCapacity')} />
    </Layout.Vertical>
  )
}

const ReplicasCell = (tableProps: CellProps<any>) => {
  return (
    <Layout.Horizontal flex={{ justifyContent: 'flex-start' }} spacing={'small'}>
      <Text>{tableProps.value}</Text>
      <CEChart
        options={{
          chart: { height: 100, width: 100 },
          tooltip: {
            useHTML: true,
            enabled: true,
            headerFormat: '',
            pointFormatter: function (this: Record<string, string | any>) {
              return `<b>${this.name}</b>: ${this.y}`
            }
          },
          plotOptions: {
            pie: {
              allowPointSelect: true,
              cursor: 'pointer',
              dataLabels: {
                enabled: false
              }
            }
          },
          series: [
            {
              name: 'Cost',
              innerSize: 0,
              type: 'pie',
              data: [
                { name: 'Spot', id: 'spot', y: get(tableProps, 'row.original.spot_count', 0) as number },
                { name: 'On-demand', id: 'on-demand', y: get(tableProps, 'row.original.on_demand_count', 0) as number }
              ]
            }
          ],
          colors: [Utils.getRealCSSColor(Color.PRIMARY_2), Utils.getRealCSSColor(Color.PRIMARY_4)]
        }}
      />
    </Layout.Horizontal>
  )
}

const WorkloadDetailsTable: React.FC = () => {
  const { accountId, id, cloudId } = useParams<AccountPathProps & { id: string; cloudId: string }>()
  const { getString } = useStrings()
  const { data, loading } = useGetClusterWorkloadsList({
    account_id: accountId,
    clusterId: id,
    queryParams: { accountIdentifier: accountId, cloud_account_id: cloudId }
  })

  const columns: Column<any>[] = useMemo(
    // TODO: replace type here
    () => [
      {
        accessor: 'name',
        Header: getString('name'),
        width: '20%',
        Cell: tableProps => (
          <Layout.Vertical>
            <Text font={{ variation: FontVariation.LEAD }}>{tableProps.value}</Text>
            <Text>{`${getString('typeLabel')}: ${tableProps.row.original.type}`}</Text>
          </Layout.Vertical>
        )
        // serverSortProps: getServerSortProps({
        //   enableServerSort: true,
        //   accessor: 'name',
        //   sortByObj: sortObj,
        //   setSortByObj: handleSort
        // })
      },
      {
        accessor: 'namespace',
        Header: getString('common.namespace'),
        width: '10%',
        Cell: tableProps => <Text>{tableProps.value}</Text>
      },
      {
        accessor: 'replica',
        Header: getString('ce.computeGroups.replicas'),
        width: '15%',
        Cell: ReplicasCell
      },
      {
        accessor: 'id',
        Header: getString('ce.nodeRecommendation.distribution'),
        width: '20%',
        Cell: DistributionCell
      },
      {
        accessor: 'type',
        Header: getString('ce.computeGroups.strategy'),
        width: '20%',
        Cell: StrategyCell
      },
      {
        accessor: 'total_cost',
        Header: getString('ce.overview.totalCost'),
        width: '10%',
        Cell: tableProps => <Text>{formatCost(tableProps.value)}</Text>
      },
      {
        accessor: 'someother',
        Header: getString('ce.recommendation.sideNavText'),
        width: '15%',
        Cell: () => (
          <Text
            rightIcon="main-share"
            rightIconProps={{ size: 12, color: Color.PRIMARY_7 }}
            color={Color.PRIMARY_7}
          >{`Save upto $323`}</Text>
        )
      }
    ],
    []
  )
  return (
    <Layout.Vertical spacing={'medium'} margin={{ top: 'huge' }}>
      {loading ? (
        <Layout.Vertical flex>
          <Icon name="spinner" size={30} />
        </Layout.Vertical>
      ) : (
        <TableV2 className={css.listTableContainer} columns={columns} data={get(data, 'response.workloads', [])} />
      )}
    </Layout.Vertical>
  )
}

export default WorkloadDetails
