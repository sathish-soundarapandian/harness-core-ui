import { Layout, Text } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import type { SeriesColumnOptions } from 'highcharts'
import React from 'react'
import type { CountChangeAndCountChangeRateInfo } from 'services/dashboard-service'
import { StackedColumnChart } from '../StackedColumnChart/StackedColumnChart'
import css from './ModuleColumnChart.module.scss'

interface ModuleColumnChartProps {
  groupBy: 'DAY' | 'MONTH' | 'HOUR'
  data: Omit<SeriesColumnOptions, 'type'>[]
  count: number
  countChangeInfo?: CountChangeAndCountChangeRateInfo
  type?: 'SMALL' | 'LARGE'
  detailedView?: boolean
}

interface DeltaProps {
  countChangeInfo: CountChangeAndCountChangeRateInfo
}

export const Delta: React.FC<DeltaProps> = ({ countChangeInfo }) => {
  const countChange = countChangeInfo?.countChange

  if (!countChange) {
    return null
  }

  const rateColor = countChange > 0 ? 'var(--green-800)' : 'var(--red-700)'
  const backgroundColor = countChange > 0 ? 'var(--green-50)' : 'var(--red-50)'

  return (
    <Layout.Horizontal className={css.deltaContainer} flex={{ justifyContent: 'center' }} style={{ backgroundColor }}>
      <Text font={{ variation: FontVariation.TINY_SEMI }} style={{ color: rateColor }} margin={{ right: 'xsmall' }}>
        {countChange > 0 ? '+' : '-'}
      </Text>
      <Text font={{ variation: FontVariation.TINY_SEMI }} style={{ color: rateColor }}>
        {new Intl.NumberFormat('default', {
          notation: 'compact',
          compactDisplay: 'short',
          unitDisplay: 'long',
          minimumFractionDigits: 0,
          maximumFractionDigits: 2
        }).format(countChange)}
      </Text>
    </Layout.Horizontal>
  )
}

const ModuleColumnChart: React.FC<ModuleColumnChartProps> = props => {
  const { count, countChangeInfo, data, detailedView } = props

  return (
    <Layout.Vertical
      style={{ height: detailedView ? '230px' : '67px', width: detailedView ? 'unset' : '100px' }}
      margin={{ top: 'xlarge' }}
    >
      <Layout.Horizontal>
        <Text font={{ variation: FontVariation.H3 }} color={Color.GREY_900} margin={{ right: 'small' }}>
          {count}
        </Text>
        {countChangeInfo ? <Delta countChangeInfo={countChangeInfo} /> : undefined}
      </Layout.Horizontal>
      <StackedColumnChart
        data={data}
        containerProps={{ style: { height: '90%', zIndex: 1, marginTop: 'var(--spacing-small)' } }}
        options={{
          xAxis: { visible: detailedView, lineWidth: 0 },
          chart: { type: 'column', spacing: [1, 1, 1, 1] },
          yAxis: { visible: detailedView },
          legend: { enabled: detailedView },
          plotOptions: {
            column: {
              pointPadding: undefined,
              borderWidth: undefined,
              borderRadius: undefined,
              pointWidth: undefined,
              stacking: 'normal',
              animation: false,
              events: {
                legendItemClick: function () {
                  return false
                }
              }
            }
          }
        }}
      />
    </Layout.Vertical>
  )
}

export default ModuleColumnChart
