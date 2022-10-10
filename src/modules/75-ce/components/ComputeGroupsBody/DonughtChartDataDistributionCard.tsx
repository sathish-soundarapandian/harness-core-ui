/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Color, Container, FontVariation, Layout, Text, Utils } from '@harness/uicore'
import type { TitleOptions } from 'highcharts'
import CEChart from '@ce/components/CEChart/CEChart'
import { getRadialChartOptions } from '@ce/components/CEChart/CEChartOptions'
import { useStrings } from 'framework/strings'
import css from './ComputeGroupsBody.module.scss'

interface DonughtChartDataDistributionCardProps {
  header: string
  data: {
    name: string
    legendText: string
    legendSubText?: string
    color: Color
    value: string | number
    graphPercentage: number
  }[]
  efficiencyScore?: number
  title?: TitleOptions
}

const DonughtChartDataDistributionCard: React.FC<DonughtChartDataDistributionCardProps> = ({
  header,
  data,
  efficiencyScore,
  title
}) => {
  const { getString } = useStrings()
  return (
    <Container>
      <Text margin={{ bottom: 'medium' }} font={{ variation: FontVariation.H6 }}>
        {header}
      </Text>
      <Layout.Horizontal flex={{ justifyContent: 'flex-start' }}>
        <Layout.Horizontal flex style={{ flex: 1 }}>
          <CEChart
            options={{
              ...getRadialChartOptions(
                data.map(item => ({ name: item.name, value: item.graphPercentage })),
                data.map(item => Utils.getRealCSSColor(item.color)),
                {
                  chart: { height: 160, width: 160 },
                  tooltipDisabled: false
                },
                '70%'
              ),
              title: {
                text: '',
                align: 'center',
                verticalAlign: 'middle',
                style: { fontSize: '15px', fontWeight: '700' },
                ...title
              }
            }}
          />
        </Layout.Horizontal>
        <Container style={{ flex: 2 }}>
          <Legends
            data={data.map(item => ({
              color: item.color,
              text: item.legendText,
              subText: item.legendSubText,
              value: item.value
            }))}
          />
          {efficiencyScore !== undefined && (
            <Layout.Horizontal className={css.efficiencyScoreContainer} flex={{ justifyContent: 'space-between' }}>
              <Text>{getString('ce.computeGroups.efficiencyScore')}</Text>
              <Text color={Color.ORANGE_900}>{efficiencyScore}</Text>
            </Layout.Horizontal>
          )}
        </Container>
      </Layout.Horizontal>
    </Container>
  )
}

interface LegendsProps {
  data: { color: Color; text: string; value: string | number; subText?: string }[]
}

const Legends: React.FC<LegendsProps> = ({ data }) => {
  return (
    <Layout.Vertical spacing="medium">
      {data.map(item => {
        return (
          <Container key={item.text}>
            <Layout.Horizontal flex={{ justifyContent: 'space-between' }}>
              <Container>
                <Layout.Horizontal spacing="small">
                  <span className={css.legendMarker} style={{ backgroundColor: Utils.getRealCSSColor(item.color) }} />
                  <Text color={Color.GREY_800}>{item.text}</Text>
                </Layout.Horizontal>
                {item.subText && (
                  <Text font={{ variation: FontVariation.SMALL }} className={css.subText}>
                    {item.subText}
                  </Text>
                )}
              </Container>
              <Text color={Color.GREY_800}>{item.value}</Text>
            </Layout.Horizontal>
          </Container>
        )
      })}
    </Layout.Vertical>
  )
}

export default DonughtChartDataDistributionCard
