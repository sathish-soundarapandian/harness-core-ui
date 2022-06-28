import React from 'react'
import { Color, Container, FontVariation, Text } from '@harness/uicore'
import CEChart from '@ce/components/CEChart/CEChart'
import data from './data.json'

const BigQueryChart = ({ data }) => {
  const plotOptions = {
    series: {
      connectNulls: true,
      animation: {
        duration: 500
      },
      marker: {
        enabled: false
      }
    },
    area: {
      lineWidth: 1,
      marker: {
        enabled: false
      }
    },
    legend: {
      enabled: true,
      align: 'right',
      verticalAlign: 'middle',
      layout: 'vertical'
    }
  }

  return (
    <Container background={Color.WHITE} padding="small">
      <CEChart
        options={{
          series: [
            {
              yAxis: 0,
              name: 'Total Query Cost',
              data: data.map(item => [item.timestamp, item.cost])
            },
            {
              yAxis: 1,
              name: 'Number of queries',
              data: data.map(item => [item.timestamp, item.queries])
            }
          ],
          xAxis: {
            type: 'datetime'
          },
          yAxis: [
            {
              labels: {
                format: '${value}'
              },
              title: {
                text: 'Total Query Cost'
              }
            },
            {
              gridLineWidth: 0,
              title: {
                text: 'Number of queries'
              },
              labels: {
                format: '{value}'
              },
              opposite: true
            }
          ],
          chart: {
            height: 300,
            spacingTop: 20
          },
          plotOptions
        }}
      />
    </Container>
  )
}

export default BigQueryChart
