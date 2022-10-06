/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
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

const CGDataRow: React.FC = () => {
  const { getString } = useStrings()
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
                  text: '10',
                  align: 'center',
                  verticalAlign: 'middle',
                  style: { fontSize: '15px', fontWeight: '700' }
                }
              }}
            />
          </Layout.Horizontal>
          <Container className={css.flexSpace2}>
            <Legends data={MOCK_NODES_DATA} />
          </Container>
        </Layout.Horizontal>
      </Container> */}
      <Container className={cx(css.infoContainer, css.spacedContainer)}>
        <DonughtChartDataDistributionCard
          header={getString('ce.overview.cardtitles.clusterBreakdown')}
          data={MOCK_NODES_DATA}
        />
      </Container>
      <Container className={cx(css.infoContainer, css.spacedContainer)}>
        <DonughtChartDataDistributionCard
          header={getString('ce.overview.cardtitles.clusterBreakdown')}
          data={MOCK_NODES_DATA}
          efficiencyScore={44}
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
