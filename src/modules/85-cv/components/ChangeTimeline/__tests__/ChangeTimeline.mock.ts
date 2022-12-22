/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { TimePeriodEnum } from '@cv/pages/monitored-service/components/ServiceHealth/ServiceHealth.constants'

export const datetimeMock = 1632742200646

export const startTimeToEndTimeMock = (key: string) => {
  switch (key) {
    case TimePeriodEnum.FOUR_HOURS:
      return { startTimeRoundedOffToNearest30min: 1632727800646 }
    case TimePeriodEnum.TWENTY_FOUR_HOURS:
      return { startTimeRoundedOffToNearest30min: 1632655800646 }
    case TimePeriodEnum.THREE_DAYS:
      return { startTimeRoundedOffToNearest30min: 1632483000646 }
    case TimePeriodEnum.SEVEN_DAYS:
      return { startTimeRoundedOffToNearest30min: 1632137400646 }
    case TimePeriodEnum.THIRTY_DAYS:
      return { startTimeRoundedOffToNearest30min: 1630150200646 }
    default:
      break
  }
}

export const mockTimeData = [
  { count: 1, startTime: 1632009431325, endTime: 1632021768825 }, // 1
  { count: 1, startTime: 1632058781325, endTime: 1632071118825 },
  { count: 2, startTime: 1632132806325, endTime: 1632145143825 },
  { count: 4, startTime: 1632145143825, endTime: 1632157481325 }, // 2
  { count: 1, startTime: 1632157481325, endTime: 1632169818825 },
  { count: 3, startTime: 1632169818825, endTime: 1632182156325 },
  { count: 1, startTime: 1632182156325, endTime: 1632194493825 },
  { count: 1, startTime: 1632194493825, endTime: 1632206831325 },
  { count: 1, startTime: 1632219168825, endTime: 1632231506325 },
  { count: 2, startTime: 1632231506325, endTime: 1632243843825 },
  { count: 1, startTime: 1632243843825, endTime: 1632256181325 },
  { count: 2, startTime: 1632256181325, endTime: 1632268518825 },
  { count: 3, startTime: 1632268518825, endTime: 1632280856325 },
  { count: 2, startTime: 1632280856325, endTime: 1632293193825 },
  { count: 2, startTime: 1632293193825, endTime: 1632305531325 }
]
export const changeTimelineResponse = {
  metaData: {},
  resource: {
    categoryTimeline: {
      Deployment: mockTimeData,
      Infrastructure: mockTimeData,
      FeatureFlag: mockTimeData,
      Alert: mockTimeData
    }
  },
  responseMessages: []
}

export const singleDeploymentMarker = {
  custom: {
    count: 1,
    endTime: 0,
    startTime: 0,
    color: 'var(--green-400)',
    toolTipLabel: '1 deploymentText'
  },
  fillColor: 'var(--green-400)',
  radius: 6,
  symbol: 'diamond'
}

export const twoDeploymentMarker = {
  custom: {
    count: 2,
    endTime: 0,
    startTime: 0,
    color: 'var(--green-400)',
    toolTipLabel: '2 Deployments'
  },
  height: 16,
  symbol: 'url(test-file-stub)',
  width: 16
}

export const multipleDeploymentMarker = {
  custom: {
    count: 4,
    endTime: 0,
    startTime: 0,
    color: 'var(--green-400)',
    toolTipLabel: '4 Deployments'
  },
  height: 18,
  symbol: 'url(test-file-stub)',
  width: 18
}

export const mockDeploymentPayload = [
  {
    endTime: 1632021768825,
    icon: { fillColor: 'var(--green-400)', height: 9, url: 'diamond', width: 9 },
    startTime: 1632009431325,
    tooltip: { message: '1 deploymentText', sideBorderColor: 'var(--green-400)' }
  },
  {
    endTime: 1632071118825,
    icon: { fillColor: 'var(--green-400)', height: 9, url: 'diamond', width: 9 },
    startTime: 1632058781325,
    tooltip: { message: '1 deploymentText', sideBorderColor: 'var(--green-400)' }
  },
  {
    endTime: 1632145143825,
    icon: { height: 16, url: 'test-file-stub', width: 16 },
    startTime: 1632132806325,
    tooltip: { message: '2 deploymentsText', sideBorderColor: 'var(--green-400)' }
  },
  {
    endTime: 1632157481325,
    icon: { height: 18, url: 'test-file-stub', width: 18 },
    startTime: 1632145143825,
    tooltip: { message: '4 deploymentsText', sideBorderColor: 'var(--green-400)' }
  },
  {
    endTime: 1632169818825,
    icon: { fillColor: 'var(--green-400)', height: 9, url: 'diamond', width: 9 },
    startTime: 1632157481325,
    tooltip: { message: '1 deploymentText', sideBorderColor: 'var(--green-400)' }
  },
  {
    endTime: 1632182156325,
    icon: { height: 18, url: 'test-file-stub', width: 18 },
    startTime: 1632169818825,
    tooltip: { message: '3 deploymentsText', sideBorderColor: 'var(--green-400)' }
  },
  {
    endTime: 1632194493825,
    icon: { fillColor: 'var(--green-400)', height: 9, url: 'diamond', width: 9 },
    startTime: 1632182156325,
    tooltip: { message: '1 deploymentText', sideBorderColor: 'var(--green-400)' }
  },
  {
    endTime: 1632206831325,
    icon: { fillColor: 'var(--green-400)', height: 9, url: 'diamond', width: 9 },
    startTime: 1632194493825,
    tooltip: { message: '1 deploymentText', sideBorderColor: 'var(--green-400)' }
  },
  {
    endTime: 1632231506325,
    icon: { fillColor: 'var(--green-400)', height: 9, url: 'diamond', width: 9 },
    startTime: 1632219168825,
    tooltip: { message: '1 deploymentText', sideBorderColor: 'var(--green-400)' }
  },
  {
    endTime: 1632243843825,
    icon: { height: 16, url: 'test-file-stub', width: 16 },
    startTime: 1632231506325,
    tooltip: { message: '2 deploymentsText', sideBorderColor: 'var(--green-400)' }
  },
  {
    endTime: 1632256181325,
    icon: { fillColor: 'var(--green-400)', height: 9, url: 'diamond', width: 9 },
    startTime: 1632243843825,
    tooltip: { message: '1 deploymentText', sideBorderColor: 'var(--green-400)' }
  },
  {
    endTime: 1632268518825,
    icon: { height: 16, url: 'test-file-stub', width: 16 },
    startTime: 1632256181325,
    tooltip: { message: '2 deploymentsText', sideBorderColor: 'var(--green-400)' }
  },
  {
    endTime: 1632280856325,
    icon: { height: 18, url: 'test-file-stub', width: 18 },
    startTime: 1632268518825,
    tooltip: { message: '3 deploymentsText', sideBorderColor: 'var(--green-400)' }
  },
  {
    endTime: 1632293193825,
    icon: { height: 16, url: 'test-file-stub', width: 16 },
    startTime: 1632280856325,
    tooltip: { message: '2 deploymentsText', sideBorderColor: 'var(--green-400)' }
  },
  {
    endTime: 1632305531325,
    icon: { height: 16, url: 'test-file-stub', width: 16 },
    startTime: 1632293193825,
    tooltip: { message: '2 deploymentsText', sideBorderColor: 'var(--green-400)' }
  }
]

export const mockIncidentPayload = [
  {
    endTime: 1632021768825,
    icon: { fillColor: 'var(--purple-400)', height: 9, url: 'diamond', width: 9 },
    startTime: 1632009431325,
    tooltip: { message: '1 cv.changeSource.incident', sideBorderColor: 'var(--purple-400)' }
  },
  {
    endTime: 1632071118825,
    icon: { fillColor: 'var(--purple-400)', height: 9, url: 'diamond', width: 9 },
    startTime: 1632058781325,
    tooltip: { message: '1 cv.changeSource.incident', sideBorderColor: 'var(--purple-400)' }
  },
  {
    endTime: 1632145143825,
    icon: { height: 16, url: 'test-file-stub', width: 16 },
    startTime: 1632132806325,
    tooltip: { message: '2 cv.changeSource.tooltip.incidents', sideBorderColor: 'var(--purple-400)' }
  },
  {
    endTime: 1632157481325,
    icon: { height: 18, url: 'test-file-stub', width: 18 },
    startTime: 1632145143825,
    tooltip: { message: '4 cv.changeSource.tooltip.incidents', sideBorderColor: 'var(--purple-400)' }
  },
  {
    endTime: 1632169818825,
    icon: { fillColor: 'var(--purple-400)', height: 9, url: 'diamond', width: 9 },
    startTime: 1632157481325,
    tooltip: { message: '1 cv.changeSource.incident', sideBorderColor: 'var(--purple-400)' }
  },
  {
    endTime: 1632182156325,
    icon: { height: 18, url: 'test-file-stub', width: 18 },
    startTime: 1632169818825,
    tooltip: { message: '3 cv.changeSource.tooltip.incidents', sideBorderColor: 'var(--purple-400)' }
  },
  {
    endTime: 1632194493825,
    icon: { fillColor: 'var(--purple-400)', height: 9, url: 'diamond', width: 9 },
    startTime: 1632182156325,
    tooltip: { message: '1 cv.changeSource.incident', sideBorderColor: 'var(--purple-400)' }
  },
  {
    endTime: 1632206831325,
    icon: { fillColor: 'var(--purple-400)', height: 9, url: 'diamond', width: 9 },
    startTime: 1632194493825,
    tooltip: { message: '1 cv.changeSource.incident', sideBorderColor: 'var(--purple-400)' }
  },
  {
    endTime: 1632231506325,
    icon: { fillColor: 'var(--purple-400)', height: 9, url: 'diamond', width: 9 },
    startTime: 1632219168825,
    tooltip: { message: '1 cv.changeSource.incident', sideBorderColor: 'var(--purple-400)' }
  },
  {
    endTime: 1632243843825,
    icon: { height: 16, url: 'test-file-stub', width: 16 },
    startTime: 1632231506325,
    tooltip: { message: '2 cv.changeSource.tooltip.incidents', sideBorderColor: 'var(--purple-400)' }
  },
  {
    endTime: 1632256181325,
    icon: { fillColor: 'var(--purple-400)', height: 9, url: 'diamond', width: 9 },
    startTime: 1632243843825,
    tooltip: { message: '1 cv.changeSource.incident', sideBorderColor: 'var(--purple-400)' }
  },
  {
    endTime: 1632268518825,
    icon: { height: 16, url: 'test-file-stub', width: 16 },
    startTime: 1632256181325,
    tooltip: { message: '2 cv.changeSource.tooltip.incidents', sideBorderColor: 'var(--purple-400)' }
  },
  {
    endTime: 1632280856325,
    icon: { height: 18, url: 'test-file-stub', width: 18 },
    startTime: 1632268518825,
    tooltip: { message: '3 cv.changeSource.tooltip.incidents', sideBorderColor: 'var(--purple-400)' }
  },
  {
    endTime: 1632293193825,
    icon: { height: 16, url: 'test-file-stub', width: 16 },
    startTime: 1632280856325,
    tooltip: { message: '2 cv.changeSource.tooltip.incidents', sideBorderColor: 'var(--purple-400)' }
  },
  {
    endTime: 1632305531325,
    icon: { height: 16, url: 'test-file-stub', width: 16 },
    startTime: 1632293193825,
    tooltip: { message: '2 cv.changeSource.tooltip.incidents', sideBorderColor: 'var(--purple-400)' }
  }
]

export const mockFeatureFlagPayload = [
  {
    endTime: 1632021768825,
    icon: { fillColor: '#EE8625', height: 9, url: 'diamond', width: 9 },
    startTime: 1632009431325,
    tooltip: { message: '1 common.moduleTitles.cf change', sideBorderColor: '#EE8625' }
  },
  {
    endTime: 1632071118825,
    icon: { fillColor: '#EE8625', height: 9, url: 'diamond', width: 9 },
    startTime: 1632058781325,
    tooltip: { message: '1 common.moduleTitles.cf change', sideBorderColor: '#EE8625' }
  },
  {
    endTime: 1632145143825,
    icon: { height: 16, url: 'test-file-stub', width: 16 },
    startTime: 1632132806325,
    tooltip: { message: '2 common.moduleTitles.cf changes', sideBorderColor: '#EE8625' }
  },
  {
    endTime: 1632157481325,
    icon: { height: 18, url: 'test-file-stub', width: 18 },
    startTime: 1632145143825,
    tooltip: { message: '4 common.moduleTitles.cf changes', sideBorderColor: '#EE8625' }
  },
  {
    endTime: 1632169818825,
    icon: { fillColor: '#EE8625', height: 9, url: 'diamond', width: 9 },
    startTime: 1632157481325,
    tooltip: { message: '1 common.moduleTitles.cf change', sideBorderColor: '#EE8625' }
  },
  {
    endTime: 1632182156325,
    icon: { height: 18, url: 'test-file-stub', width: 18 },
    startTime: 1632169818825,
    tooltip: { message: '3 common.moduleTitles.cf changes', sideBorderColor: '#EE8625' }
  },
  {
    endTime: 1632194493825,
    icon: { fillColor: '#EE8625', height: 9, url: 'diamond', width: 9 },
    startTime: 1632182156325,
    tooltip: { message: '1 common.moduleTitles.cf change', sideBorderColor: '#EE8625' }
  },
  {
    endTime: 1632206831325,
    icon: { fillColor: '#EE8625', height: 9, url: 'diamond', width: 9 },
    startTime: 1632194493825,
    tooltip: { message: '1 common.moduleTitles.cf change', sideBorderColor: '#EE8625' }
  },
  {
    endTime: 1632231506325,
    icon: { fillColor: '#EE8625', height: 9, url: 'diamond', width: 9 },
    startTime: 1632219168825,
    tooltip: { message: '1 common.moduleTitles.cf change', sideBorderColor: '#EE8625' }
  },
  {
    endTime: 1632243843825,
    icon: { height: 16, url: 'test-file-stub', width: 16 },
    startTime: 1632231506325,
    tooltip: { message: '2 common.moduleTitles.cf changes', sideBorderColor: '#EE8625' }
  },
  {
    endTime: 1632256181325,
    icon: { fillColor: '#EE8625', height: 9, url: 'diamond', width: 9 },
    startTime: 1632243843825,
    tooltip: { message: '1 common.moduleTitles.cf change', sideBorderColor: '#EE8625' }
  },
  {
    endTime: 1632268518825,
    icon: { height: 16, url: 'test-file-stub', width: 16 },
    startTime: 1632256181325,
    tooltip: { message: '2 common.moduleTitles.cf changes', sideBorderColor: '#EE8625' }
  },
  {
    endTime: 1632280856325,
    icon: { height: 18, url: 'test-file-stub', width: 18 },
    startTime: 1632268518825,
    tooltip: { message: '3 common.moduleTitles.cf changes', sideBorderColor: '#EE8625' }
  },
  {
    endTime: 1632293193825,
    icon: { height: 16, url: 'test-file-stub', width: 16 },
    startTime: 1632280856325,
    tooltip: { message: '2 common.moduleTitles.cf changes', sideBorderColor: '#EE8625' }
  },
  {
    endTime: 1632305531325,
    icon: { height: 16, url: 'test-file-stub', width: 16 },
    startTime: 1632293193825,
    tooltip: { message: '2 common.moduleTitles.cf changes', sideBorderColor: '#EE8625' }
  }
]

export const mockInfraPayload = [
  {
    endTime: 1632021768825,
    icon: { fillColor: 'var(--primary-4)', height: 9, url: 'diamond', width: 9 },
    startTime: 1632009431325,
    tooltip: { message: '1 infrastructureText change', sideBorderColor: 'var(--primary-4)' }
  },
  {
    endTime: 1632071118825,
    icon: { fillColor: 'var(--primary-4)', height: 9, url: 'diamond', width: 9 },
    startTime: 1632058781325,
    tooltip: { message: '1 infrastructureText change', sideBorderColor: 'var(--primary-4)' }
  },
  {
    endTime: 1632145143825,
    icon: { height: 16, url: 'test-file-stub', width: 16 },
    startTime: 1632132806325,
    tooltip: { message: '2 infrastructureText changes', sideBorderColor: 'var(--primary-4)' }
  },
  {
    endTime: 1632157481325,
    icon: { height: 18, url: 'test-file-stub', width: 18 },
    startTime: 1632145143825,
    tooltip: { message: '4 infrastructureText changes', sideBorderColor: 'var(--primary-4)' }
  },
  {
    endTime: 1632169818825,
    icon: { fillColor: 'var(--primary-4)', height: 9, url: 'diamond', width: 9 },
    startTime: 1632157481325,
    tooltip: { message: '1 infrastructureText change', sideBorderColor: 'var(--primary-4)' }
  },
  {
    endTime: 1632182156325,
    icon: { height: 18, url: 'test-file-stub', width: 18 },
    startTime: 1632169818825,
    tooltip: { message: '3 infrastructureText changes', sideBorderColor: 'var(--primary-4)' }
  },
  {
    endTime: 1632194493825,
    icon: { fillColor: 'var(--primary-4)', height: 9, url: 'diamond', width: 9 },
    startTime: 1632182156325,
    tooltip: { message: '1 infrastructureText change', sideBorderColor: 'var(--primary-4)' }
  },
  {
    endTime: 1632206831325,
    icon: { fillColor: 'var(--primary-4)', height: 9, url: 'diamond', width: 9 },
    startTime: 1632194493825,
    tooltip: { message: '1 infrastructureText change', sideBorderColor: 'var(--primary-4)' }
  },
  {
    endTime: 1632231506325,
    icon: { fillColor: 'var(--primary-4)', height: 9, url: 'diamond', width: 9 },
    startTime: 1632219168825,
    tooltip: { message: '1 infrastructureText change', sideBorderColor: 'var(--primary-4)' }
  },
  {
    endTime: 1632243843825,
    icon: { height: 16, url: 'test-file-stub', width: 16 },
    startTime: 1632231506325,
    tooltip: { message: '2 infrastructureText changes', sideBorderColor: 'var(--primary-4)' }
  },
  {
    endTime: 1632256181325,
    icon: { fillColor: 'var(--primary-4)', height: 9, url: 'diamond', width: 9 },
    startTime: 1632243843825,
    tooltip: { message: '1 infrastructureText change', sideBorderColor: 'var(--primary-4)' }
  },
  {
    endTime: 1632268518825,
    icon: { height: 16, url: 'test-file-stub', width: 16 },
    startTime: 1632256181325,
    tooltip: { message: '2 infrastructureText changes', sideBorderColor: 'var(--primary-4)' }
  },
  {
    endTime: 1632280856325,
    icon: { height: 18, url: 'test-file-stub', width: 18 },
    startTime: 1632268518825,
    tooltip: { message: '3 infrastructureText changes', sideBorderColor: 'var(--primary-4)' }
  },
  {
    endTime: 1632293193825,
    icon: { height: 16, url: 'test-file-stub', width: 16 },
    startTime: 1632280856325,
    tooltip: { message: '2 infrastructureText changes', sideBorderColor: 'var(--primary-4)' }
  },
  {
    endTime: 1632305531325,
    icon: { height: 16, url: 'test-file-stub', width: 16 },
    startTime: 1632293193825,
    tooltip: { message: '2 infrastructureText changes', sideBorderColor: 'var(--primary-4)' }
  }
]

export const infoCardDataSingleValue = [
  { count: 1, key: 'Deployment', message: '1 deploymentText' },
  { count: 1, key: 'Infrastructure', message: '1 infrastructureText change' },
  { count: 1, key: 'FeatureFlag', message: '1 common.moduleTitles.cf change' },
  { count: 1, key: 'Alert', message: '1 cv.changeSource.incident' }
]

export const infoCardDataMultipleValue = [
  { count: 9, key: 'Deployment', message: '9 deploymentsText' },
  { count: 9, key: 'Infrastructure', message: '9 infrastructureText changes' },
  { count: 9, key: 'FeatureFlag', message: '9 common.moduleTitles.cf changes' },
  { count: 9, key: 'Alert', message: '9 cv.changeSource.tooltip.incidents' }
]
