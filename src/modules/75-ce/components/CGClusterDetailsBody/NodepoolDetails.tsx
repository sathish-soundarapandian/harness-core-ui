/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useMemo, useState } from 'react'
import type { Column } from 'react-table'
import { Color, Container, FontVariation, Layout, TableV2, Text } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import formatCost from '@ce/utils/formatCost'
import css from './CGClusterDetailsBody.module.scss'

const NodepoolDetails: React.FC = () => {
  const { getString } = useStrings()
  const [, setSummaryData] = useState({})

  useEffect(() => {
    setSummaryData({
      committed: 0,
      committed_cost: 98.2,
      cpu: {
        total: 10,
        un_allocated: 4,
        utilized: 6
      },
      fallback: 0,
      fallback_cost: 45.3,
      harness_mgd: 0,
      memory: {
        total: 10,
        un_allocated: 4,
        utilized: 6
      },
      on_demand: 1,
      on_demand_cost: 23.53,
      spot: 0,
      spot_cost: 98.23,
      total: 1
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
            <Text font={{ variation: FontVariation.H3 }}>{formatCost(6843)}</Text>
          </Layout.Vertical>
          <Layout.Vertical spacing={'large'} className={css.infoCard}>
            <Text font={{ variation: FontVariation.LEAD }} color={Color.GREY_600}>
              {getString('ce.computeGroups.setup.clusterPermissionsTab.totalReplicas')}
            </Text>
            <Text font={{ variation: FontVariation.H3 }}>{68}</Text>
          </Layout.Vertical>
          <Layout.Vertical spacing={'large'} className={css.infoCard}>
            <Text font={{ variation: FontVariation.LEAD }} color={Color.GREY_600}>
              {getString('ce.computeGroups.totalSpotSavings')}
            </Text>
            <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'flex-start' }} spacing="small">
              <Text font={{ variation: FontVariation.H3 }} color={Color.GREEN_700}>
                {formatCost(68) + '*'}
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
              {getString('ce.perspectives.nodeDetails.nodeDetailsText')}
            </Text>
          </Layout.Horizontal>
          <WorkloadDetailsTable />
        </Layout.Vertical>
      </Layout.Vertical>
    </Container>
  )
}

const WorkloadDetailsTable: React.FC = () => {
  const { getString } = useStrings()
  const [data, setData] = useState<any[]>([]) // TODO: replace type here

  useEffect(() => {
    setData([
      {
        account_id: 'accID',
        allocatable_cpu: 0,
        allocatable_mem: 0,
        architecture: 'amd64',
        cloud_account_id: 'cloudAccID',
        cluster_id: 'cloudAccID',
        cluster_name: 'shalinlk-dashboard-RnD',
        created_at: '2022-10-08T09:38:38.663912Z',
        created_time: '2022-09-28T10:50:55Z',
        fulfillment: 'on_demand',
        id: 'nod-cd0ka7lvqc7kvv4u7p60',
        name: 'ip-192-168-45-149.us-west-2.compute.internal',
        node_group: 'shalinlk-dashboard-RnD-ng',
        on_demand_spend: 43.16236143192069,
        os: 'linux',
        region: 'us-west-2',
        resource_version: 2314770,
        spot_spend: 31.023693823021738,
        total_cost: 74.18605525494243,
        total_cpu: 0,
        total_mem: 0,
        type: 'm5.large',
        workloads: 6,
        zone: 'us-west-2d'
      }
    ])
  }, [])

  const columns: Column<any>[] = useMemo(
    () => [
      {
        accessor: 'name',
        Header: getString('name'),
        width: '15%',
        Cell: tableProps => <Text lineClamp={1}>{tableProps.value}</Text>
        // serverSortProps: getServerSortProps({
        //   enableServerSort: true,
        //   accessor: 'name',
        //   sortByObj: sortObj,
        //   setSortByObj: handleSort
        // })
      },
      {
        accessor: 'workloads',
        Header: getString('pipeline.dashboards.workloads'),
        width: '15%',
        Cell: tableProps => <Text>{tableProps.value}</Text>
      },
      {
        accessor: 'on_demand_spend',
        Header: getString('ce.computeGroups.onDemandSpend'),
        width: '15%',
        Cell: tableProps => <Text>{formatCost(tableProps.value, { decimalPoints: 2 })}</Text>
      },
      {
        accessor: 'spot_spend',
        Header: getString('ce.computeGroups.spotSpend'),
        width: '15%',
        Cell: tableProps => <Text>{formatCost(tableProps.value, { decimalPoints: 2 })}</Text>
      },
      {
        accessor: 'total_cost',
        Header: getString('ce.overview.totalCost'),
        width: '15%',
        Cell: tableProps => <Text>{formatCost(tableProps.value, { decimalPoints: 2 })}</Text>
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

export default NodepoolDetails
