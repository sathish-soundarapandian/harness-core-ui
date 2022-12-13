export const consumptionTableData = {
  status: 'SUCCESS',
  data: {
    totalPages: 1,
    totalItems: 2,
    pageItemCount: 2,
    pageSize: 20,
    content: [
      {
        sloIdentifier: 'slo_1',
        sloName: 'SLO 1',
        monitoredServiceIdentifier: 'prommock_gcpl',
        serviceName: 'prommock',
        environmentIdentifier: 'gcpl',
        orgIdentifier: 'default',
        projectIdentifier: 'demokaran',
        sliType: 'Latency',
        weightagePercentage: 50.0,
        sloTargetPercentage: 75.0,
        sliStatusPercentage: 99.49381327334083,
        errorBudgetBurned: 36,
        contributedErrorBudgetBurned: 18
      },
      {
        sloIdentifier: 'slo_1',
        sloName: 'SLO 2',
        monitoredServiceIdentifier: 'prommock_env',
        serviceName: 'prommock',
        environmentIdentifier: 'env',
        orgIdentifier: 'default',
        projectIdentifier: 'demokaran',
        sliType: 'Latency',
        weightagePercentage: 50.0,
        sloTargetPercentage: 89.0,
        sliStatusPercentage: 95.40213723284589,
        errorBudgetBurned: 327,
        contributedErrorBudgetBurned: 163
      }
    ],
    pageIndex: 0,
    empty: false
  },
  correlationId: 'e8ac5983-a81a-4e61-962d-796cfbe25646'
}
