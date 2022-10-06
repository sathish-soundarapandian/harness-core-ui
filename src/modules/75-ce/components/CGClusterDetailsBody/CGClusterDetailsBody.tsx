/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Color, Container, FontVariation, Layout, Text } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import DonughtChartDataDistributionCard from '@ce/ComputeGroupsBody/DonughtChartDataDistributionCard'
import formatCost from '@ce/utils/formatCost'
import css from './CGClusterDetailsBody.module.scss'

interface ClusterDetailsItemProps {
  title: string
  value: string
}

const MOCK_NODES_DATA = [
  {
    color: Color.GREY_200,
    legendText: 'On-demand (1)',
    name: 'On-demand',
    value: formatCost(645.75),
    graphPercentage: 20
  },
  {
    color: Color.PRIMARY_2,
    legendText: 'Spot (2)',
    name: 'Spot',
    value: formatCost(64.93),
    graphPercentage: 25
  },
  {
    color: Color.PRIMARY_4,
    legendText: 'Fallback (4)',
    name: 'Fallback',
    value: formatCost(27.83),
    graphPercentage: 30
  },
  {
    color: Color.PRIMARY_7,
    legendText: 'Commitments (2)',
    name: 'Commitments',
    value: formatCost(119.27),
    graphPercentage: 25
  }
]

const CGClusterDetailsBody: React.FC = () => {
  const { getString } = useStrings()
  return (
    <Container className={css.clusterDetailsBody}>
      <Layout.Vertical spacing={'large'}>
        <Container className={css.infoCard}>
          <Layout.Vertical spacing={'medium'}>
            <Text font={{ variation: FontVariation.LEAD }} color={Color.GREY_600}>
              {getString('ce.common.totalComputeSpend')}
            </Text>
            <Text font={{ variation: FontVariation.H3 }}>$23,154</Text>
            <Text font={{ variation: FontVariation.SMALL }}>{getString('ce.commitmentOrchestration.monthToDate')}</Text>
          </Layout.Vertical>
        </Container>
        <Container className={css.infoCard}>
          <Layout.Vertical spacing={'large'}>
            <Text font={{ variation: FontVariation.H6 }}>
              {getString('ce.computeGroups.clusterDetails.k8sClusterDetailsHeader')}
            </Text>
            <ClusterDetailsItem title={getString('connectors.name')} value="My Kubernetes Connector 1" />
            <ClusterDetailsItem title={getString('regionLabel')} value="us-east-1" />
            <ClusterDetailsItem title={getString('identifier')} value="mykubernetes_connector1" />
            <Layout.Vertical spacing={'medium'}>
              <Text inline>Tag1</Text>
              <Text inline>Tag2</Text>
              <Text inline>Tag3</Text>
            </Layout.Vertical>
          </Layout.Vertical>
        </Container>
      </Layout.Vertical>
      <Layout.Vertical spacing={'large'}>
        <Container className={css.infoCard}>
          <DonughtChartDataDistributionCard
            header={getString('ce.computeGroups.clusterDetails.nodesBreakdown')}
            data={MOCK_NODES_DATA}
          />
        </Container>
        <Layout.Vertical className={css.infoCard} spacing="large">
          <Text font={{ variation: FontVariation.H6 }}>{getString('ce.perspectives.nodeDetails.header')}</Text>
          <Text font={{ variation: FontVariation.SMALL }} color={Color.GREY_600}>
            {getString('ce.computeGroups.totalNodes')}
          </Text>
          <Layout.Horizontal spacing={'large'}>
            <Text>10</Text>
            <Text>2</Text>
            <Text icon="harness">8</Text>
          </Layout.Horizontal>
        </Layout.Vertical>
        <Layout.Vertical className={css.infoCard} spacing="large">
          <Layout.Horizontal spacing={'large'}>
            <Text font={{ variation: FontVariation.H6 }}>
              {getString('ce.computeGroups.clusterDetails.podDetails')}
            </Text>
            <Layout.Horizontal spacing={'small'}>
              <Container>
                <Text>{`${getString('ce.nodeRecommendation.spot')} 2`}</Text>
              </Container>
              <Container>
                <Text>{`${getString('ce.nodeRecommendation.onDemand')} 2`}</Text>
              </Container>
            </Layout.Horizontal>
          </Layout.Horizontal>
          <Text font={{ variation: FontVariation.SMALL }} color={Color.GREY_600}>
            {getString('ce.computeGroups.clusterDetails.totalPods')}
          </Text>
          <Layout.Horizontal spacing="large">
            <Text>10</Text>
            <Text icon="time">{`${getString('triggers.scheduledLabel')} 2`}</Text>
            <Text icon="time">{`${getString('ce.common.unScheduled')} 8`}</Text>
          </Layout.Horizontal>
        </Layout.Vertical>
      </Layout.Vertical>
      <Layout.Vertical spacing={'large'}>
        <Container className={css.infoCard}>
          <DonughtChartDataDistributionCard
            header={getString('ce.computeGroups.clusterDetails.cpuBreakdown')}
            data={MOCK_NODES_DATA}
          />
        </Container>
        <Container className={css.infoCard}>
          <DonughtChartDataDistributionCard
            header={getString('ce.computeGroups.clusterDetails.memoryBreakdown')}
            data={MOCK_NODES_DATA}
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
