import { Container } from '@harness/uicore'
import Highcharts from 'highcharts'
import React from 'react'
import HighchartsReact from 'highcharts-react-official'

interface ModuleSemiCircleChartProps {
  data: Array<[string, number]>
  colors: Array<string>
  isExpanded?: boolean
  title?: string
}

const getConfig = (
  data: Array<[string, number]>,
  colors: string[],
  title: string,
  isExpanded = false
): Highcharts.Options => ({
  chart: {
    plotBackgroundColor: undefined,
    plotBorderWidth: 0,
    plotShadow: false,
    marginBottom: isExpanded ? 0 : 0,
    marginTop: isExpanded ? 28 : 14,
    marginLeft: 0,
    marginRight: 0,
    height: isExpanded ? 220 : 75
  },
  title: {
    text: title,
    verticalAlign: 'middle'
  },
  tooltip: {
    enabled: false
  },
  plotOptions: {
    pie: {
      dataLabels: {
        enabled: false
      },
      showInLegend: isExpanded,
      startAngle: -90,
      endAngle: 90,
      size: isExpanded ? '150%' : '300%'
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
  ],
  legend: {
    itemStyle: {
      fontWeight: 'normal'
    }
  }
})

const ModuleSemiCircleChart: React.FC<ModuleSemiCircleChartProps> = props => {
  const { data, isExpanded, title = '', colors } = props

  return (
    <Container style={{ marginTop: isExpanded ? 'var(--spacing-huge)' : 0 }}>
      <HighchartsReact
        highcharts={Highcharts}
        options={{
          ...getConfig(data, colors, title, isExpanded)
        }}
        containerProps={{ style: { height: '90%', zIndex: 1, marginTop: 'var(--spacing-small)' } }}
      />
    </Container>
  )
}

export default ModuleSemiCircleChart
