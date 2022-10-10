/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
import cx from 'classnames'
import { useParams } from 'react-router-dom'
import type { Column } from 'react-table'
import { get } from 'lodash-es'
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
  TableV2,
  Text
} from '@harness/uicore'
import { useStrings } from 'framework/strings'
import formatCost from '@ce/utils/formatCost'
import { useGetClusterNodes, useGetClusterNodesSummary } from 'services/lw'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import css from './CGClusterDetailsBody.module.scss'

const NodepoolDetails: React.FC = () => {
  const { accountId, id, cloudId } = useParams<AccountPathProps & { id: string; cloudId: string }>()
  const { getString } = useStrings()
  const { data, loading, refetch } = useGetClusterNodesSummary({
    account_id: accountId,
    clusterId: id,
    queryParams: { accountIdentifier: accountId, cloud_account_id: cloudId }
  })

  if (loading) {
    return <PageSpinner />
  }

  return (
    <Container padding={'xlarge'}>
      <Layout.Horizontal flex={{ justifyContent: 'flex-end' }} padding={'large'}>
        <Text
          icon="refresh"
          iconProps={{ size: 12, color: Color.PRIMARY_7 }}
          color={Color.PRIMARY_7}
          style={{ cursor: 'pointer' }}
          onClick={() => refetch()}
        >
          {getString('common.refresh')}
        </Text>
      </Layout.Horizontal>
      <Layout.Vertical className={css.infoCard} spacing="huge">
        <Layout.Horizontal spacing={'large'}>
          <Layout.Vertical spacing={'large'} className={cx(css.infoCard, css.elongatedCard)}>
            <Text font={{ variation: FontVariation.LEAD }} color={Color.GREY_600}>
              {getString('ce.computeGroups.clusterSpend')}
            </Text>
            <Text font={{ variation: FontVariation.H3 }}>{formatCost(get(data, 'response.total_spend', 0))}</Text>
          </Layout.Vertical>
          <Layout.Vertical spacing={'large'} className={cx(css.infoCard, css.elongatedCard)}>
            <Text font={{ variation: FontVariation.LEAD }} color={Color.GREY_600}>
              {getString('ce.computeGroups.replicas')}
            </Text>
            <Text font={{ variation: FontVariation.H3 }}>{get(data, 'response.replicas', 0)}</Text>
          </Layout.Vertical>
          <Layout.Vertical spacing={'large'} className={css.infoCard}>
            <Text font={{ variation: FontVariation.LEAD }} color={Color.GREY_600}>
              {getString('ce.computeGroups.totalSpotSavings')}
            </Text>
            <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'flex-start' }} spacing="small">
              <Text font={{ variation: FontVariation.H3 }} color={Color.GREEN_700}>
                {formatCost(get(data, 'response.spot_savings', 0)) + '*'}
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
            <Text font={{ variation: FontVariation.H4 }}>{getString('pipeline.nodesLabel')}</Text>
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

const WorkloadDetailsTable: React.FC = () => {
  const { accountId, id, cloudId } = useParams<AccountPathProps & { id: string; cloudId: string }>()
  const { getString } = useStrings()

  const { data, loading } = useGetClusterNodes({
    account_id: accountId,
    clusterId: id,
    queryParams: {
      accountIdentifier: accountId,
      cloud_account_id: cloudId
    }
  })

  const columns: Column<any>[] = useMemo(
    () => [
      {
        accessor: 'name',
        Header: getString('name'),
        width: '16%',
        Cell: tableProps => (
          <Text lineClamp={1} style={{ width: '70%' }}>
            {tableProps.value}
          </Text>
        )
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
        width: '12%',
        Cell: tableProps => <Text>{tableProps.value}</Text>
      },
      {
        accessor: 'type',
        Header: getString('ce.co.gatewayReview.instanceType'),
        width: '12%',
        Cell: tableProps => <Text>{tableProps.value}</Text>
      },
      {
        accessor: 'fulfillment',
        Header: getString('ce.computeGroups.fulfillment'),
        width: '12%',
        Cell: tableProps => <Text>{tableProps.value}</Text>
      },
      {
        accessor: 'on_demand_spend',
        Header: getString('ce.computeGroups.onDemandSpend'),
        width: '12%',
        Cell: tableProps => <Text>{formatCost(tableProps.value, { decimalPoints: 2 })}</Text>
      },
      {
        accessor: 'spot_spend',
        Header: getString('ce.computeGroups.spotSpend'),
        width: '12%',
        Cell: tableProps => <Text>{formatCost(tableProps.value, { decimalPoints: 2 })}</Text>
      },
      {
        accessor: 'total_cost',
        Header: getString('ce.overview.totalCost'),
        width: '12%',
        Cell: tableProps => <Text>{formatCost(tableProps.value, { decimalPoints: 2 })}</Text>
      },
      {
        accessor: 'someother',
        Header: getString('ce.recommendation.sideNavText'),
        width: '12%',
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
        <TableV2 className={css.listTableContainer} columns={columns} data={get(data, 'response.nodes', [])} />
      )}
    </Layout.Vertical>
  )
}

export default NodepoolDetails
