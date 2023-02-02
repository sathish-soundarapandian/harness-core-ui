/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { isEmpty } from 'lodash-es'
import type { SeriesColumnOptions } from 'highcharts'
import { MultiSelectOption, Utils } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { getEventTypeChartColor } from '@cv/utils/CommonUtils'
import type { SelectOption } from '@pipeline/components/PipelineSteps/Steps/StepsTypes'
import type { UseStringsReturn } from 'framework/strings'
import type {
  HostFrequencyData,
  LogAnalysisRadarChartListDTO,
  LogData,
  RestResponseAnalyzedRadarChartLogDataWithCountDTO,
  RestResponseLogAnalysisRadarChartListWithCountDTO,
  TimestampFrequencyCount
} from 'services/cv'
import type { LogAnalysisMessageFrequency, LogAnalysisRowData } from './LogAnalysis.types'
import { EventTypeFullName } from './LogAnalysis.constants'

export const mapClusterType = (type: string): LogData['tag'] => {
  switch (type) {
    case EventTypeFullName.KNOWN_EVENT:
      return 'KNOWN'
    case EventTypeFullName.UNKNOWN_EVENT:
      return 'UNKNOWN'
    case EventTypeFullName.UNEXPECTED_FREQUENCY:
      return 'UNEXPECTED'
    default:
      return 'KNOWN'
  }
}

export const getClusterTypes = (getString: UseStringsReturn['getString']): SelectOption[] => {
  return [
    { label: getString('cv.known'), value: EventTypeFullName.KNOWN_EVENT },
    { label: getString('cd.getStartedWithCD.healthStatus.unknown'), value: EventTypeFullName.UNKNOWN_EVENT },
    { label: getString('cv.unexpectedFrequency'), value: EventTypeFullName.UNEXPECTED_FREQUENCY }
  ]
}

function getFrequencyDataValues(frequencyData?: TimestampFrequencyCount[]): number[] {
  if (isEmpty(frequencyData)) {
    return []
  }

  return (frequencyData as TimestampFrequencyCount[]).map((datum: TimestampFrequencyCount) => datum.count) as number[]
}

function getTimestampValues(frequencyData?: TimestampFrequencyCount[]): number[] {
  if (isEmpty(frequencyData)) {
    return []
  }

  return (frequencyData as TimestampFrequencyCount[]).map(
    (datum: TimestampFrequencyCount) => datum.timeStamp
  ) as number[]
}

function getBaselineData({
  averageControlFrequencyData
}: {
  averageControlFrequencyData?: TimestampFrequencyCount[]
}): SeriesColumnOptions {
  if (!averageControlFrequencyData || isEmpty(averageControlFrequencyData)) {
    return {} as SeriesColumnOptions
  }
  return {
    color: Utils.getRealCSSColor(Color.GREY_300),
    data: getFrequencyDataValues(averageControlFrequencyData),
    type: 'column',
    custom: {
      timestamp: getTimestampValues(averageControlFrequencyData)
    }
  }
}

function getMessgeFrequencyChartValues({
  testFrequencies,
  averageControlFrequencyData,
  clusterType
}: {
  testFrequencies?: TimestampFrequencyCount[]
  averageControlFrequencyData?: TimestampFrequencyCount[]
  clusterType: LogAnalysisRadarChartListDTO['clusterType']
}): SeriesColumnOptions[] {
  if (!testFrequencies || isEmpty(testFrequencies)) {
    return []
  }

  const baselinedata: SeriesColumnOptions = getBaselineData({ averageControlFrequencyData })

  const barColorInChart = getEventTypeChartColor(clusterType)

  const testDataValues: SeriesColumnOptions[] = [
    {
      color: barColorInChart,
      data: getFrequencyDataValues(testFrequencies),
      type: 'column',
      custom: {
        timestamp: getTimestampValues(testFrequencies)
      }
    }
  ]

  if (clusterType !== EventTypeFullName.UNKNOWN_EVENT) {
    testDataValues.unshift(baselinedata)
  }

  return testDataValues
}

function getMessgeFrequencies(logData: LogAnalysisRadarChartListDTO): LogAnalysisMessageFrequency[] {
  if (isEmpty(logData) || isEmpty(logData.testHostFrequencyData)) {
    return []
  }

  return (logData.testHostFrequencyData as HostFrequencyData[]).map(datum => {
    return {
      hostName: datum.host as string,
      data: getMessgeFrequencyChartValues({
        clusterType: logData.clusterType,
        testFrequencies: datum?.frequencies,
        averageControlFrequencyData: logData.averageControlFrequencyData
      })
    }
  })
}

export const getSingleLogData = (logData: LogAnalysisRadarChartListDTO): LogAnalysisRowData => {
  if (!logData) {
    return {} as LogAnalysisRowData
  }
  return {
    clusterType: mapClusterType(logData?.clusterType as string),
    count: logData?.count as number,
    message: logData?.message as string,
    clusterId: logData?.clusterId,
    riskStatus: logData?.risk,
    messageFrequency: getMessgeFrequencies(logData)
  }
}

export function getLogAnalysisData(
  data: RestResponseLogAnalysisRadarChartListWithCountDTO | RestResponseAnalyzedRadarChartLogDataWithCountDTO | null
): LogAnalysisRowData[] {
  return (
    data?.resource?.logAnalysisRadarCharts?.content?.map((datum: LogAnalysisRadarChartListDTO) =>
      getSingleLogData(datum)
    ) ?? []
  )
}

export function getInitialNodeName(selectedHostName?: string): MultiSelectOption[] {
  if (!selectedHostName) {
    return []
  }

  return [
    {
      label: selectedHostName,
      value: selectedHostName
    }
  ]
}
