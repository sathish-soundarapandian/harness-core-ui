/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
import type { Column } from 'react-table'
import { Color, Container, FontVariation, Layout, TableV2, Text } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import formatCost from '@ce/utils/formatCost'
import css from './CGClusterDetailsBody.module.scss'

const NodepoolDetails: React.FC = () => {
  const { getString } = useStrings()
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
            <Text>{getString('ce.perspectives.workloadDetails.workloadDetailsText')}</Text>
          </Layout.Horizontal>
          <WorkloadDetailsTable />
        </Layout.Vertical>
      </Layout.Vertical>
    </Container>
  )
}

const WorkloadDetailsTable: React.FC = () => {
  const { getString } = useStrings()
  const data = [
    {
      name: 'Workload 1',
      id: 'ID 1',
      replicas: 4,
      current: {
        spot: 2,
        onDemand: 2
      }
    },
    {
      name: 'Workload 2',
      id: 'ID 2',
      replicas: 3,
      current: {
        spot: 4,
        onDemand: 4
      }
    }
  ]
  const columns: Column<any>[] = useMemo(
    () => [
      {
        accessor: 'name',
        Header: getString('name'),
        width: '15%',
        Cell: tableProps => <Text>{tableProps.value}</Text>
        // serverSortProps: getServerSortProps({
        //   enableServerSort: true,
        //   accessor: 'name',
        //   sortByObj: sortObj,
        //   setSortByObj: handleSort
        // })
      },
      {
        accessor: 'type',
        Header: getString('typeLabel'),
        width: '15%',
        Cell: tableProps => <Text>{tableProps.value}</Text>
      },
      {
        accessor: 'namespace',
        Header: getString('common.namespace'),
        width: '15%',
        Cell: tableProps => <Text>{tableProps.value}</Text>
      },
      {
        accessor: 'replicas',
        Header: getString('delegates.replicaText'),
        width: '15%',
        Cell: tableProps => <Text>{tableProps.value}</Text>
      },
      {
        accessor: 'id',
        Header: getString('ce.nodeRecommendation.distribution'),
        width: '15%',
        Cell: tableProps => <Text>{tableProps.value}</Text>
      },
      {
        accessor: 'some',
        Header: getString('delegates.replicaText'),
        width: '15%',
        Cell: tableProps => <Text>{tableProps.value}</Text>
      },
      {
        accessor: 'someother',
        Header: getString('delegates.replicaText'),
        width: '15%',
        Cell: tableProps => <Text>{tableProps.value}</Text>
      }
    ],
    []
  )
  return (
    <Layout.Vertical spacing={'medium'}>
      <TableV2 columns={columns} data={data} />
    </Layout.Vertical>
  )
}

export default NodepoolDetails
