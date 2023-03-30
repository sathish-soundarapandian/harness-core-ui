/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export const SLOV2FormMock = {
  type: 'Simple',
  name: 'Ratio Based',
  identifier: 'Ratio_Based',
  tags: { serviceLevelIndicatorType: 'AVAILABILITY' },
  userJourneyRef: ['US_101'],
  periodType: 'Rolling',
  periodLength: '10d',
  SLOTargetPercentage: 99,
  notificationRuleRefs: [],
  monitoredServiceRef: 'datadoglogs_version1',
  healthSourceRef: 'AppD',
  serviceLevelIndicatorType: 'Availability',
  evaluationType: 'Window',
  SLIMetricType: 'Ratio',
  eventType: 'Good',
  validRequestMetric: 'Exceptions_per_Minute',
  goodRequestMetric: 'Errors_per_Minute',
  objectiveValue: 99.99,
  objectiveComparator: '>',
  SLIMissingDataType: 'Good'
}

export const valuesToDetermineReloadRatoBased = [
  'AppD',
  'Ratio',
  'Good',
  'Exceptions_per_Minute',
  'Errors_per_Minute',
  99.99,
  '>',
  'Good'
]
export const valuesToDetermineReloadThresholdBased = ['AppD', 'Threshold', 'Exceptions_per_Minute', 99.99, '>', 'Good']

export const mockDerivedProps = {
  isRatioBased: true,
  isWindow: true,
  shouldFetchSliGraph: true,
  showSLIMetricChart: true,
  sliAreaGraphData: undefined,
  valuesToDetermineReload: valuesToDetermineReloadRatoBased
}
