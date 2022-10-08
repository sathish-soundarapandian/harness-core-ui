/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useMemo, useState } from 'react'
import { get } from 'lodash-es'
import type { Column } from 'react-table'
import { Color, Container, FontVariation, Icon, Layout, Select, TableV2, Text, TextInput } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import formatCost from '@ce/utils/formatCost'
import css from './CGClusterDetailsBody.module.scss'

const WorkloadDetails: React.FC = () => {
  const { getString } = useStrings()
  const [summaryData, setSummaryData] = useState({})
  // const [loading, setLoading] = useState(true)

  useEffect(() => {
    setSummaryData({
      account_id: 'accID',
      cloud_account_id: 'cloudAccID',
      cluster_id: 'cloudAccID',
      cost: {
        savings: 2352.23,
        spend: 130,
        spot_savings: 762.1
      },
      replicas: 3
    })
    // setLoading(false)
  }, [])

  return (
    <Container padding={'xlarge'}>
      <Layout.Vertical className={css.infoCard} spacing="large">
        <Layout.Horizontal spacing={'large'}>
          <Layout.Vertical spacing={'large'} className={css.infoCard}>
            <Text font={{ variation: FontVariation.LEAD }} color={Color.GREY_600}>
              {getString('ce.computeGroups.setup.schedulingTab.setupSchedulingSection.totalSpend')}
            </Text>
            <Text font={{ variation: FontVariation.H3 }}>{formatCost(get(summaryData, 'cost.spend', 0))}</Text>
          </Layout.Vertical>
          <Layout.Vertical spacing={'large'} className={css.infoCard}>
            <Text font={{ variation: FontVariation.LEAD }} color={Color.GREY_600}>
              {getString('ce.computeGroups.setup.clusterPermissionsTab.totalReplicas')}
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
              <Text font={{ variation: FontVariation.SMALL }} color={Color.GREEN_700}>
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
            <Text font={{ variation: FontVariation.H4 }}>
              {getString('ce.perspectives.workloadDetails.workloadDetailsText')}
            </Text>
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
    <Layout.Horizontal spacing={'small'} className={css.strategyCell}>
      <Select
        items={[
          { label: getString('ce.recommendation.detailsPage.costOptimized'), value: 'costOptimized' },
          { label: getString('ce.computeGroups.leastInterrupted'), value: 'leastInterrupted' }
        ]}
      />
      <TextInput placeholder={getString('ce.computeGroups.baseOnDemandCapacity')} />
    </Layout.Horizontal>
  )
}

const WorkloadDetailsTable: React.FC = () => {
  const { getString } = useStrings()
  const [data, setData] = useState<any[]>([]) // TODO: replace type here

  useEffect(() => {
    setData([
      {
        account_id: 'accID',
        cloud_account_id: 'cloudAccID',
        cluster_id: 'cloudAccID',
        name: 'kube-system',
        namespace: 'kube-system',
        replica: 1,
        total_cost: 0,
        type: 'Deployment'
      },
      {
        account_id: 'accID',
        cloud_account_id: 'cloudAccID',
        cluster_id: 'cloudAccID',
        name: 'kube-system',
        namespace: 'kube-system',
        replica: 2,
        total_cost: 0,
        type: 'StatefulSet'
      }
    ])
  }, [])

  const columns: Column<any>[] = useMemo(
    () => [
      {
        accessor: 'name',
        Header: getString('name'),
        width: '15%',
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
        width: '10%',
        Cell: tableProps => <Text>{tableProps.value}</Text>
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
        width: '25%',
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
        Cell: tableProps => <Text>{tableProps.value}</Text>
      }
    ],
    []
  )
  return (
    <Layout.Vertical spacing={'medium'} margin={{ top: 'huge' }}>
      <TableV2 columns={columns} data={data} />
    </Layout.Vertical>
  )
}

export default WorkloadDetails
