export const riskCategoryMock = {
  metaData: {},
  resource: [
    { identifier: 'Errors', displayName: 'Errors', timeSeriesMetricType: 'ERROR', cvMonitoringCategory: 'Errors' },
    {
      identifier: 'Infrastructure',
      displayName: 'Infrastructure',
      timeSeriesMetricType: 'INFRA',
      cvMonitoringCategory: 'Infrastructure'
    },
    {
      identifier: 'Performance_Throughput',
      displayName: 'Performance/Throughput',
      timeSeriesMetricType: 'THROUGHPUT',
      cvMonitoringCategory: 'Performance'
    },
    {
      identifier: 'Performance_Other',
      displayName: 'Performance/Other',
      timeSeriesMetricType: 'OTHER',
      cvMonitoringCategory: 'Performance'
    },
    {
      identifier: 'Performance_ResponseTime',
      displayName: 'Performance/Response Time',
      timeSeriesMetricType: 'RESP_TIME',
      cvMonitoringCategory: 'Performance'
    }
  ],
  responseMessages: []
}
