import { Icon, Layout, Text } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import Highcharts, { SeriesColumnOptions } from 'highcharts'
import React from 'react'
import HighchartsReact from 'highcharts-react-official'
import type { CountChangeAndCountChangeRateInfo } from 'services/dashboard-service'
import css from './ModuleSemiCircleChart.module.scss'

interface ModuleSemiCircleChartProps {
  data: Array<[string, number]>
  colors: Array<string>
  isExpanded?: boolean
}

interface DeltaProps {
  countChangeInfo: CountChangeAndCountChangeRateInfo
}

const getConfig = (data: Array<[string, number]>, colors: string[]): Highcharts.Options => ({
  chart: {
    plotBackgroundColor: undefined,
    plotBorderWidth: 0,
    plotShadow: false,
    marginBottom: 0,
    marginTop: 14,
    marginLeft: 0,
    marginRight: 0
  },
  title: {
    text: ''
  },
  tooltip: {
    enabled: false
  },
  plotOptions: {
    pie: {
      dataLabels: {
        enabled: false,
        distance: -50,
        style: {
          fontWeight: 'bold',
          color: 'white'
        }
      },
      startAngle: -90,
      endAngle: 90,
      size: '300%'
    }
  },
  credits: {
    enabled: false
  },
  series: [
    {
      type: 'pie',
      name: 'Browser share',
      innerSize: '65%',
      colors,
      data
    }
  ]
})

export const Delta: React.FC<DeltaProps> = ({ countChangeInfo }) => {
  const countChange = countChangeInfo?.countChange

  if (!countChange) {
    return null
  }

  const rateColor = countChange > 0 ? 'var(--green-800)' : 'var(--red-700)'
  const backgroundColor = countChange > 0 ? 'var(--green-50)' : 'var(--red-50)'

  return (
    <Layout.Horizontal flex={{ justifyContent: 'center' }} style={{ backgroundColor }}>
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

const ModuleSemiCircleChart: React.FC<ModuleSemiCircleChartProps> = props => {
  const { data, isExpanded } = props
  return (
    <HighchartsReact
      highcharts={Highcharts}
      options={{
        ...getConfig(data, props.colors)
      }}
      containerProps={{ style: { height: '90%', zIndex: 1, marginTop: 'var(--spacing-small)' } }}
    />
  )
}

export default ModuleSemiCircleChart
