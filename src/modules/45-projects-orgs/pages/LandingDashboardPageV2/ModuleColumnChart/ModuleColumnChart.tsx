import { Icon, Layout, Text } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import Highcharts, { SeriesColumnOptions } from 'highcharts'
import React from 'react'
import HighchartsReact from 'highcharts-react-official'
import moment from 'moment'
import type { CountChangeAndCountChangeRateInfo } from 'services/dashboard-service'
import css from './ModuleColumnChart.module.scss'

interface ModuleColumnChartProps {
  data: Omit<SeriesColumnOptions, 'type'>[]
  count: string
  countChangeInfo?: CountChangeAndCountChangeRateInfo
  isExpanded?: boolean
  timeRangeLabel?: string
  timeRange?: number[]
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
  plotOptions: {
    column: {
      pointPadding: 0,
      borderRadius: 2,
      stacking: 'normal',
      animation: false,
      events: {
        legendItemClick: /* istanbul ignore next */ function () {
          return false
        }
      }
    },
    series: {
      animation: false
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
  const { count, countChangeInfo, data, isExpanded, timeRangeLabel } = props

  return (
    <>
      {isExpanded && (
        <Text margin={{ top: 'xsmall' }} color={Color.GREY_400} font={{ variation: FontVariation.TINY }}>
          {timeRangeLabel}
        </Text>
      )}
      <Layout.Vertical
        style={{ height: isExpanded ? '230px' : '70px', width: isExpanded ? 'unset' : '100px' }}
        margin={{ top: 'medium' }}
      >
        <Layout.Horizontal padding={{ bottom: 'tiny' }} className={css.countRow}>
          <Text font={{ variation: FontVariation.H3 }} color={Color.GREY_900} margin={{ right: 'small' }}>
            {count}
          </Text>
          {countChangeInfo ? <Delta countChangeInfo={countChangeInfo} /> : undefined}
        </Layout.Horizontal>
        <HighchartsReact
          highcharts={Highcharts}
          options={{
            ...getConfig(data),
            xAxis: {
              visible: true,
              tickInterval: 1,
              labels: {
                enabled: isExpanded && !!props.timeRange?.length,
                formatter: function (this) {
                  let time = new Date().getTime()
                  if (props.timeRange?.length) {
                    // eslint-disable-next-line
                    // @ts-ignore
                    const val = props.timeRange?.[this.pos]
                    time = val ? new Date(val).getTime() : time
                  }
                  return moment(time).utc().format('MMM D')
                },
                style: {
                  fontSize: '8px',
                  color: 'var(--grey-400)'
                }
              },
              tickLength: 0
            },
            chart: { type: 'column', spacing: [1, 1, 1, 1] },
            yAxis: {
              visible: isExpanded,
              startOnTick: false,
              endOnTick: false
            },
            legend: { enabled: isExpanded },
            tooltip: {
              enabled: isExpanded
            },
            plotOptions: {
              column: {
                pointPadding: 0,
                borderRadius: 2,
                stacking: 'normal',
                animation: false,
                events: {
                  legendItemClick: /* istanbul ignore next */ function () {
                    return false
                  }
                }
              }
            }
          }}
          containerProps={{ style: { height: '90%', zIndex: 1, marginTop: 'var(--spacing-small)' } }}
        />
      </Layout.Vertical>
      {!isExpanded && (
        <Text
          className={css.rangeLabel}
          margin={{ top: 'xsmall' }}
          color={Color.GREY_400}
          font={{ variation: FontVariation.TINY }}
        >
          {timeRangeLabel}
        </Text>
      )}
    </>
  )
}

export default ModuleColumnChart
