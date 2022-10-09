/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { get } from 'lodash-es'
import { Color, Container, FontVariation, Layout, Text } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import formatCost from '@ce/utils/formatCost'
import DonughtChartDataDistributionCard from './DonughtChartDataDistributionCard'
import css from './ComputeGroupsBody.module.scss'

const DEFAULT_VALUE = 22135.13

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

interface CGDataRowProps {
  data: any // TODO: replace with actual type
}

const CGDataRow: React.FC<CGDataRowProps> = ({ data }) => {
  const { getString } = useStrings()
  const onDemandCost = get(data, 'nodes.on-demand_cost', 0)
  const spotCost = get(data, 'nodes.spot_cost', 0)
  const committedCost = get(data, 'nodes.committed_cost', 0)
  const fallbackCost = get(data, 'nodes.fallback_cost', 0)
  const totalNodesCost = get(data, 'nodes.total', 0)
  const nodesData = [
    {
      color: Color.GREY_200,
      legendText: `On-demand (${get(data, 'nodes.on_demand', 0)})`,
      name: 'On-demand',
      value: formatCost(onDemandCost),
      graphPercentage: (onDemandCost / totalNodesCost) * 100
    },
    {
      color: Color.PRIMARY_2,
      legendText: `Spot (${get(data, 'nodes.spot', 0)})`,
      name: 'Spot',
      value: formatCost(spotCost),
      graphPercentage: (spotCost / totalNodesCost) * 100
    },
    {
      color: Color.PRIMARY_4,
      legendText: `Fallback (${get(data, 'nodes.fallback', 0)})`,
      name: 'Fallback',
      value: formatCost(fallbackCost),
      graphPercentage: (fallbackCost / totalNodesCost) * 100
    },
    {
      color: Color.PRIMARY_7,
      legendText: `Commitments (${get(data, 'nodes.committed', 0)})`,
      name: 'Commitments',
      value: formatCost(committedCost),
      graphPercentage: (committedCost / totalNodesCost) * 100
    }
  ]
  return (
    <Container className={css.dataRowContainer}>
      <Container>
        <Layout.Vertical spacing={'small'} margin={{ bottom: 'small' }} className={css.infoContainer}>
          <Text font={{ variation: FontVariation.H6 }} color={Color.GREY_600}>
            {getString('ce.commitmentOrchestration.computeSpend')}
          </Text>
          <Text font={{ variation: FontVariation.H3 }}>
            {formatCost(DEFAULT_VALUE, {
              decimalPoints: 2
            })}
          </Text>
          <Text font={{ variation: FontVariation.SMALL }}>{getString('ce.commitmentOrchestration.monthToDate')}</Text>
        </Layout.Vertical>
        <Layout.Vertical spacing={'small'} className={css.infoContainer}>
          <Text font={{ variation: FontVariation.H6 }} color={Color.GREY_600}>
            {getString('ce.computeGroups.totalSpotSavings')}
          </Text>
          <Text font={{ variation: FontVariation.H3 }}>
            {formatCost(DEFAULT_VALUE, {
              decimalPoints: 2
            })}
          </Text>
          <Text font={{ variation: FontVariation.SMALL }}>{getString('ce.commitmentOrchestration.monthToDate')}</Text>
        </Layout.Vertical>
      </Container>
      <Container className={cx(css.infoContainer, css.spacedContainer)}>
        <DonughtChartDataDistributionCard
          header={getString('ce.overview.cardtitles.clusterBreakdown')}
          data={nodesData}
          title={{
            style: { fontSize: '20px', fontWeight: '700' },
            text: data.nodes.total.toString()
          }}
        />
      </Container>
      <Container className={cx(css.infoContainer, css.spacedContainer)}>
        <DonughtChartDataDistributionCard
          header={getString('ce.overview.cardtitles.clusterBreakdown')}
          data={MOCK_NODES_DATA}
          efficiencyScore={44}
          title={{
            text: formatCost(22135.13),
            style: { fontSize: '12px', fontWeight: '700' }
          }}
        />
      </Container>
      {/* <Container className={cx(css.infoContainer, css.spacedContainer)}>
        <Text margin={{ bottom: 'medium' }} font={{ variation: FontVariation.H6 }}>
          {getString('ce.overview.cardtitles.clusterBreakdown')}
        </Text>
        <Layout.Horizontal flex={{ justifyContent: 'flex-start' }}>
          <Layout.Horizontal flex className={css.flexSpace1}>
            <CEChart
              options={{
                ...getRadialChartOptions(
                  [
                    {
                      name: 'onDemand',
                      value: 20
                    },
                    { name: 'spot', value: 25 },
                    {
                      name: 'fallback',
                      value: 30
                    },
                    {
                      name: 'commitments',
                      value: 25
                    }
                  ],
                  ['#D9DAE5', '#CDF4FE', '#3DC7F6', '#0092E4'],
                  {
                    chart: { height: 160, width: 160 }
                  },
                  '70%'
                ),
                title: {
                  text: `${formatCost(2354.12, { decimalPoints: 2 })}`,
                  align: 'center',
                  verticalAlign: 'middle',
                  style: { fontSize: '15px', fontWeight: '700' }
                }
              }}
            />
          </Layout.Horizontal>
          <Container className={css.flexSpace2}>
            <Legends data={MOCK_NODES_DATA} />
            <Layout.Horizontal className={css.efficiencyScoreContainer} flex={{ justifyContent: 'space-between' }}>
              <Text>{getString('ce.computeGroups.efficiencyScore')}</Text>
              <Text color={Color.ORANGE_900}>44</Text>
            </Layout.Horizontal>
          </Container>
        </Layout.Horizontal>
      </Container> */}
    </Container>
  )
}

export default CGDataRow
