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
import CEChart from '@ce/components/CEChart/CEChart'
import { getRadialChartOptions } from '@ce/components/CEChart/CEChartOptions'
import css from './ComputeGroupsBody.module.scss'

const DEFAULT_VALUE = 22135.13

const MOCK_NODES_DATA = [
  {
    color: Color.GREY_200,
    text: 'On-demand (1)',
    amount: 645.75
  },
  {
    color: Color.PRIMARY_2,
    text: 'Spot (2)',
    amount: 64.93
  },
  {
    color: Color.PRIMARY_4,
    text: 'Fallback (4)',
    amount: 27.83
  },
  {
    color: Color.PRIMARY_7,
    text: 'Commitments (2)',
    amount: 119.27
  }
]

interface LegendsProps {
  data: { color: Color; text: string; amount: number }[]
}

const Legends: React.FC<LegendsProps> = ({ data }) => {
  return (
    <Layout.Vertical spacing="small">
      {data.map(item => {
        return (
          <Container key={item.text}>
            <Layout.Horizontal>
              <Layout.Horizontal>
                <span></span>
                <Text>{item.text}</Text>
              </Layout.Horizontal>
              <Text>{formatCost(item.amount, { decimalPoints: 2 })}</Text>
            </Layout.Horizontal>
          </Container>
        )
      })}
    </Layout.Vertical>
  )
}

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
      <Container className={cx(css.infoContainer, css.spacedContainer)}>
        <Text margin={{ bottom: 'medium' }}>{getString('ce.overview.cardtitles.clusterBreakdown')}</Text>
        <Layout.Horizontal flex={{ alignItems: 'flex-start', justifyContent: 'flex-start' }}>
          <Layout.Horizontal flex>
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
                    // plotOptions: {
                    //   pie: { size: '180%' }
                    // }
                  }
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
          <Legends data={MOCK_NODES_DATA} />
        </Layout.Horizontal>
      </Container>
      <Container className={cx(css.infoContainer, css.spacedContainer)}>
        <Text margin={{ bottom: 'medium' }}>{getString('ce.overview.cardtitles.clusterBreakdown')}</Text>
        <Layout.Horizontal flex={{ alignItems: 'flex-start', justifyContent: 'flex-start' }}>
          <Layout.Horizontal flex>
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
                    // plotOptions: {
                    //   pie: { size: '180%' }
                    // }
                  }
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
          <Legends data={MOCK_NODES_DATA} />
        </Layout.Horizontal>
      </Container>
    </Container>
  )
}

export default CGDataRow
