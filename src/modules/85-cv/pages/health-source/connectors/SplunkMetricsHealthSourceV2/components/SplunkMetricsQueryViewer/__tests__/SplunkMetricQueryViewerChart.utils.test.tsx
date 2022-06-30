import { transformSplunkMetricSampleData } from '../SplunkMetricQueryViewerChart.utils'

describe('SplunkMetricQueryViewerChart utils', () => {
  test('should check whether correct chart data is returned from transformSplunkMetricSampleData', () => {
    const transformSplunkMetricSampleDataResult = transformSplunkMetricSampleData([
      { txnName: 'default', metricName: 'sample', metricValue: 1282.0, timestamp: 1654798680000 },
      { txnName: 'default', metricName: 'sample', metricValue: 1654.1818181818182, timestamp: 1654798800000 }
    ])

    expect(transformSplunkMetricSampleDataResult).toEqual({
      chart: { backgroundColor: 'transparent', height: 200, spacing: [5, 2, 5, 2], type: 'line', zoomType: 'xy' },
      credits: undefined,
      legend: { enabled: false },
      plotOptions: {
        line: { marker: { enabled: false } },
        series: { lineWidth: 2, stickyTracking: false, turboThreshold: 50000 }
      },
      series: [
        {
          color: '#25A6F7',
          data: [
            [1654798680000, 1282],
            [1654798800000, 1654.1818181818182]
          ],
          name: '',
          type: 'line'
        },
        {
          color: '#25A6F7',
          data: [
            [1654798680000, 1282],
            [1654798800000, 1654.1818181818182]
          ],
          name: '',
          type: 'line'
        }
      ],
      subtitle: undefined,
      title: { text: '' },
      tooltip: { formatter: expect.any(Function), outside: true },
      xAxis: {
        gridLineDashStyle: 'Dash',
        gridLineWidth: 1,
        labels: { formatter: expect.any(Function) },
        lineWidth: 1,
        showFirstLabel: false,
        showLastLabel: false,
        tickAmount: 7,
        tickLength: 5,
        title: { text: '' }
      },
      yAxis: {
        gridLineDashStyle: 'Dash',
        gridLineWidth: 1,
        lineWidth: 1,
        showFirstLabel: false,
        showLastLabel: false,
        tickAmount: 5,
        tickLength: 5,
        title: { text: '' }
      }
    })
  })

  test('should check whether empty object is returned from transformSplunkMetricSampleData if there is no data', () => {
    const transformSplunkMetricSampleDataResult = transformSplunkMetricSampleData([])

    expect(transformSplunkMetricSampleDataResult).toEqual({})
  })
})
