import { Icon, Layout, Text } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import Highcharts, { SeriesColumnOptions } from 'highcharts'
import React from 'react'
import HighchartsReact from 'highcharts-react-official'
import type { CountChangeAndCountChangeRateInfo } from 'services/dashboard-service'
import { numberFormatter } from '@common/utils/utils'
import css from './ModuleColumnChart.module.scss'

interface ModuleColumnChartProps {
  data: Omit<SeriesColumnOptions, 'type'>[]
  count: number
  countChangeInfo?: CountChangeAndCountChangeRateInfo
  type?: 'SMALL' | 'LARGE'
  detailedView?: boolean
}

interface DeltaProps {
  countChangeInfo: CountChangeAndCountChangeRateInfo
}

type DataType = Omit<SeriesColumnOptions, 'type'>[]

const getConfig = (data: DataType): Highcharts.Options => ({
  chart: {
    type: 'column',
    spacing: [1, 1, 1, 1],
    backgroundColor: 'transparent',
    animation: false
  },
  title: {
    text: ''
  },
  credits: {
    enabled: false
  },
  xAxis: {
    labels: {
      formatter: function () {
        return `${this.pos + 1}`
      },

      style: {
        fontSize: 'var(--font-size-xsmall)',
        color: 'var(--grey-400)'
      }
    },
    tickInterval: 1
  },
  plotOptions: {
    column: {
      pointPadding: 0,
      borderRadius: 2,
      stacking: 'normal',
      animation: false,
      events: {
        legendItemClick: function () {
          return false
        }
      }
    }
  },
  legend: {
    maxHeight: 80,
    itemStyle: {
      color: 'var(--grey-500)',
      fontSize: 'var(--font-size-small)',
      fontWeight: '500',
      textOverflow: 'ellipsis'
    }
  },
  series: data as SeriesColumnOptions[]
})

export const Delta: React.FC<DeltaProps> = ({ countChangeInfo }) => {
  const countChange = countChangeInfo?.countChange

  if (!countChange) {
    return null
  }

  const rateColor = countChange > 0 ? 'var(--green-800)' : 'var(--red-700)'
  const backgroundColor = countChange > 0 ? 'var(--green-50)' : 'var(--red-50)'

  return (
    <Layout.Horizontal className={css.deltaContainer} flex={{ justifyContent: 'center' }} style={{ backgroundColor }}>
      <Icon
        margin={{ right: 'tiny' }}
        size={12}
        color={Color.GREEN_700}
        name={countChange > 0 ? 'symbol-triangle-up' : 'symbol-triangle-down'}
      />
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
      style={{ height: detailedView ? '230px' : '70px', width: detailedView ? 'unset' : '100px' }}
      margin={{ top: 'large' }}
    >
      <Layout.Horizontal padding={{ bottom: 'tiny' }} className={css.countRow}>
        <Text font={{ variation: FontVariation.H3 }} color={Color.GREY_900} margin={{ right: 'small' }}>
          {numberFormatter(count)}
        </Text>
        {countChangeInfo ? <Delta countChangeInfo={countChangeInfo} /> : undefined}
      </Layout.Horizontal>
      <HighchartsReact
        highcharts={Highcharts}
        options={{
          ...getConfig(data),
          xAxis: {
            visible: true,
            minorTickLength: 0,
            tickLength: 0,
            labels: { enabled: detailedView }
          },
          chart: { type: 'column', spacing: [1, 1, 1, 1] },
          yAxis: {
            visible: detailedView,
            startOnTick: false,
            endOnTick: false
          },
          legend: { enabled: detailedView },
          tooltip: {
            enabled: detailedView
          },
          plotOptions: {
            column: {
              pointPadding: 0,
              borderRadius: 2,
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
        containerProps={{ style: { height: '90%', zIndex: 1, marginTop: 'var(--spacing-small)' } }}
      />
    </Layout.Vertical>
  )
}

export default ModuleColumnChart
