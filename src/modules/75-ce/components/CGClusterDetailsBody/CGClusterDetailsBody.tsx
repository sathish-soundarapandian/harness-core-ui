/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { get } from 'lodash-es'
import { Color, Container, FontVariation, Layout, Text } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import type { ConnectorInfoDTO } from 'services/cd-ng'
import DonughtChartDataDistributionCard from '@ce/components/ComputeGroupsBody/DonughtChartDataDistributionCard'
import formatCost from '@ce/utils/formatCost'
import css from './CGClusterDetailsBody.module.scss'

interface ClusterDetailsItemProps {
  title: string
  value: string
}

interface CGClusterDetailsBodyProps {
  data: any // TODO: replace with correct type
  connectorDetails?: ConnectorInfoDTO
}

const CGClusterDetailsBody: React.FC<CGClusterDetailsBodyProps> = ({ data }) => {
  const { getString } = useStrings()
  const totalNodes = get(data, 'nodes.total', 0)
  const nodesData = [
    {
      color: Color.GREY_200,
      legendText: `On-demand (${get(data, 'nodes.on_demand', 0)})`,
      name: 'On-demand',
      value: formatCost(get(data, 'nodes.on-demand_cost', 0)),
      graphPercentage: (get(data, 'nodes.on_demand', 0) / totalNodes) * 100
    },
    {
      color: Color.PRIMARY_2,
      legendText: `Spot (${get(data, 'nodes.spot', 0)})`,
      name: 'Spot',
      value: formatCost(get(data, 'nodes.spot_cost', 0)),
      graphPercentage: (get(data, 'nodes.spot', 0) / totalNodes) * 100
    },
    {
      color: Color.PRIMARY_4,
      legendText: `Fallback (${get(data, 'nodes.fallback', 0)})`,
      name: 'Fallback',
      value: formatCost(get(data, 'nodes.fallback_cost', 0)),
      graphPercentage: (get(data, 'nodes.fallback', 0) / totalNodes) * 100
    },
    {
      color: Color.PRIMARY_7,
      legendText: `Commitments (${get(data, 'nodes.committed', 0)})`,
      name: 'Commitments',
      value: formatCost(get(data, 'nodes.committed_cost', 0)),
      graphPercentage: (get(data, 'nodes.committed', 0) / totalNodes) * 100
    }
  ]

  const cpuBreakdownData = [
    {
      color: Color.PRIMARY_2,
      legendText: `Utilized (${get(data, 'cpu.utilized', 0).toFixed(2)})`,
      name: 'Utilized',
      value: `${((get(data, 'cpu.utilized', 0) / get(data, 'cpu.total', 0)) * 100).toFixed(2)}%`,
      graphPercentage: (get(data, 'cpu.utilized', 0) / get(data, 'cpu.total', 0)) * 100
    },
    {
      color: Color.PRIMARY_4,
      legendText: `Idle (${get(data, 'cpu.idle', 0).toFixed(2)})`,
      name: 'Idle',
      value: `${((get(data, 'cpu.idle', 0) / get(data, 'cpu.total', 0)) * 100).toFixed(2)}%`,
      graphPercentage: (get(data, 'cpu.idle', 0) / get(data, 'cpu.total', 0)) * 100
    },
    {
      color: Color.PRIMARY_7,
      legendText: `Unallocated (${get(data, 'cpu.un_allocated', 0).toFixed(2)})`,
      name: 'Unallocated',
      value: `${((get(data, 'cpu.un_allocated', 0) / get(data, 'cpu.total', 0)) * 100).toFixed(2)}%`,
      graphPercentage: (get(data, 'cpu.un_allocated', 0) / get(data, 'cpu.total', 0)) * 100
    }
  ]

  const memoryBreakdownData = [
    {
      color: Color.PRIMARY_2,
      legendText: `Utilized (${get(data, 'memory.utilized', 0).toFixed(2)})`,
      name: 'Utilized',
      value: `${((get(data, 'memory.utilized', 0) / get(data, 'memory.total', 0)) * 100).toFixed(2)}%`,
      graphPercentage: (get(data, 'memory.utilized', 0) / get(data, 'memory.total', 0)) * 100
    },
    {
      color: Color.PRIMARY_4,
      legendText: `Idle (${get(data, 'memory.idle', 0).toFixed(2)})`,
      name: 'Idle',
      value: `${((get(data, 'memory.idle', 0) / get(data, 'memory.total', 0)) * 100).toFixed(2)}%`,
      graphPercentage: (get(data, 'memory.idle', 0) / get(data, 'memory.total', 0)) * 100
    },
    {
      color: Color.PRIMARY_7,
      legendText: `Unallocated (${get(data, 'memory.un_allocated', 0).toFixed(2)})`,
      name: 'Unallocated',
      value: `${((get(data, 'memory.un_allocated', 0) / get(data, 'memory.total', 0)) * 100).toFixed(2)}%`,
      graphPercentage: (get(data, 'memory.un_allocated', 0) / get(data, 'memory.total', 0)) * 100
    }
  ]
  return (
    <Container className={css.clusterDetailsBody}>
      <Layout.Vertical spacing={'large'}>
        <Container className={css.infoCard}>
          <Layout.Vertical spacing={'medium'}>
            <Text font={{ variation: FontVariation.LEAD }} color={Color.GREY_600}>
              {getString('ce.common.totalComputeSpend')}
            </Text>
            <Text font={{ variation: FontVariation.H3 }}>{formatCost(get(data, 'nodes.total_spend', 0))}</Text>
            <Text font={{ variation: FontVariation.SMALL }}>{getString('ce.commitmentOrchestration.monthToDate')}</Text>
          </Layout.Vertical>
        </Container>
        <Container className={css.infoCard}>
          <Layout.Vertical spacing={'large'}>
            <Text font={{ variation: FontVariation.H6 }}>
              {getString('ce.computeGroups.clusterDetails.k8sClusterDetailsHeader')}
            </Text>
            <ClusterDetailsItem title={getString('connectors.name')} value={get(data, 'id', '')} />
            <ClusterDetailsItem title={getString('regionLabel')} value={get(data, 'region', '')} />
            <ClusterDetailsItem
              title={getString('identifier')}
              value={get(data, 'cloud_account_id', 'My Kubernetes Connector 1')}
            />
            {/* <Layout.Vertical spacing={'medium'}>
              <Text inline>Tag1</Text>
              <Text inline>Tag2</Text>
              <Text inline>Tag3</Text>
            </Layout.Vertical> */}
          </Layout.Vertical>
        </Container>
      </Layout.Vertical>
      <Layout.Vertical spacing={'large'}>
        <Container className={css.infoCard}>
          <DonughtChartDataDistributionCard
            header={getString('ce.computeGroups.clusterDetails.nodesBreakdown')}
            data={nodesData}
            title={{
              text: `<p>${get(data, 'nodes.total', 0)}</p><p><b>Nodes</b></p>`,
              useHTML: true,
              style: { fontWeight: '700', textAlign: 'center', fontSize: '14px' }
            }}
          />
        </Container>
        <Layout.Vertical className={css.infoCard} spacing="large">
          <Text font={{ variation: FontVariation.H6 }}>{getString('ce.perspectives.nodeDetails.header')}</Text>
          <Text font={{ variation: FontVariation.SMALL }} color={Color.GREY_600}>
            {getString('ce.computeGroups.totalNodes')}
          </Text>
          <Container>
            <Layout.Horizontal spacing={'huge'}>
              <Text>{get(data, 'nodes.total', 0)}</Text>
              <Text icon="elastic-kubernetes-service">
                {get(data, 'nodes.total', 0) - get(data, 'nodes.harness_mgd', 0)}
              </Text>
              <Text icon="harness">{get(data, 'nodes.harness_mgd', 0)}</Text>
            </Layout.Horizontal>
          </Container>
        </Layout.Vertical>
        <Layout.Vertical className={css.infoCard} spacing="large">
          <Layout.Horizontal spacing={'large'}>
            <Text font={{ variation: FontVariation.H6 }}>
              {getString('ce.computeGroups.clusterDetails.podDetails')}
            </Text>
            <Layout.Horizontal spacing={'small'}>
              <Container className={css.podSpotTag}>
                <Text>{`${getString('ce.nodeRecommendation.spot')} ${get(data, 'pods.spot', 0)}`}</Text>
              </Container>
              <Container className={css.podOnDemandTag}>
                <Text>{`${getString('ce.nodeRecommendation.onDemand')} ${get(data, 'pods.on_demand', 0)}`}</Text>
              </Container>
            </Layout.Horizontal>
          </Layout.Horizontal>
          <Text font={{ variation: FontVariation.SMALL }} color={Color.GREY_600}>
            {getString('ce.computeGroups.clusterDetails.totalPods')}
          </Text>
          <Layout.Horizontal spacing="large">
            <Text font={{ variation: FontVariation.LEAD }}>{get(data, 'pods.total', 0)}</Text>
            <Text icon="time" iconProps={{ size: 12, color: Color.PRIMARY_4 }} className={css.inlineBold}>
              {`${getString('triggers.scheduledLabel')} `} <b>{get(data, 'pods.scheduled', 0)}</b>
            </Text>
            <Text icon="time" iconProps={{ size: 12, color: Color.ORANGE_900 }} className={css.inlineBold}>
              {`${getString('ce.common.unScheduled')} `} <b>{get(data, 'pods.un_scheduled', 0)}</b>
            </Text>
          </Layout.Horizontal>
        </Layout.Vertical>
      </Layout.Vertical>
      <Layout.Vertical spacing={'large'}>
        <Container className={css.infoCard}>
          <DonughtChartDataDistributionCard
            header={getString('ce.computeGroups.clusterDetails.cpuBreakdown')}
            data={cpuBreakdownData}
            title={{
              text: `<p>${get(data, 'cpu.total', 0)}</p><p><b>CPU</b></p>`,
              useHTML: true,
              style: { fontWeight: '700', textAlign: 'center', fontSize: '14px' }
            }}
          />
        </Container>
        <Container className={css.infoCard}>
          <DonughtChartDataDistributionCard
            header={getString('ce.computeGroups.clusterDetails.memoryBreakdown')}
            data={memoryBreakdownData}
            title={{
              text: `<p>${get(data, 'cpu.total', 0)}</p><p><b>Gib</b></p>`,
              useHTML: true,
              style: { fontWeight: '700', textAlign: 'center', fontSize: '14px' }
            }}
          />
        </Container>
      </Layout.Vertical>
    </Container>
  )
}

const ClusterDetailsItem: React.FC<ClusterDetailsItemProps> = ({ title, value }) => {
  return (
    <Layout.Vertical spacing={'medium'}>
      <Text font={{ variation: FontVariation.SMALL }}>{title}</Text>
      <Text>{value}</Text>
    </Layout.Vertical>
  )
}

export default CGClusterDetailsBody
