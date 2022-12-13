/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { TimePeriodEnum } from '@cv/pages/monitored-service/components/ServiceHealth/ServiceHealth.constants'
import type { StringKeys } from 'framework/strings'
import {
  mockTimeData,
  changeTimelineResponse,
  datetimeMock,
  startTimeToEndTimeMock,
  mockDeploymentPayload,
  mockIncidentPayload,
  mockInfraPayload,
  infoCardDataMultipleValue,
  infoCardDataSingleValue
} from './ChangeTimeline.mock'
import {
  createTooltipLabel,
  createChangeInfoCardData,
  getStartAndEndTime,
  createTimelineSeriesData
} from '../ChangeTimeline.utils'
import { ChangeSourceTypes } from '../ChangeTimeline.constants'

function getString(key: StringKeys): StringKeys {
  return key
}
describe('Verify Util funcitons', () => {
  test('Should create Change InfoCard Data', () => {
    const singleValue = { startTime: 1632009431325, endTime: 1632021768825, count: 1 }
    const multipleValue = { startTime: 1632009431325, endTime: 1632157481325, count: 9 }
    const { Deployment, Infrastructure, Alert } = changeTimelineResponse.resource.categoryTimeline
    const changeInfoCardDataSingleValue = createChangeInfoCardData(
      singleValue.startTime,
      singleValue.endTime,
      Deployment,
      Infrastructure,
      Alert,
      getString
    )
    expect(changeInfoCardDataSingleValue).toEqual(infoCardDataSingleValue)
    const changeInfoCardDataMultipleValue = createChangeInfoCardData(
      multipleValue.startTime,
      multipleValue.endTime,
      Deployment,
      Infrastructure,
      Alert,
      getString
    )
    expect(changeInfoCardDataMultipleValue).toEqual(infoCardDataMultipleValue)
  })

  test('should return correct start and endtime for getStartAndEndTime', () => {
    Date.now = jest.fn(() => datetimeMock)
    expect(getStartAndEndTime(TimePeriodEnum.FOUR_HOURS)).toEqual({
      endTimeRoundedOffToNearest30min: datetimeMock,
      ...startTimeToEndTimeMock(TimePeriodEnum.FOUR_HOURS)
    })
    expect(getStartAndEndTime(TimePeriodEnum.TWENTY_FOUR_HOURS)).toEqual({
      endTimeRoundedOffToNearest30min: datetimeMock,
      ...startTimeToEndTimeMock(TimePeriodEnum.TWENTY_FOUR_HOURS)
    })
    expect(getStartAndEndTime(TimePeriodEnum.THREE_DAYS)).toEqual({
      endTimeRoundedOffToNearest30min: datetimeMock,
      ...startTimeToEndTimeMock(TimePeriodEnum.THREE_DAYS)
    })
    expect(getStartAndEndTime(TimePeriodEnum.SEVEN_DAYS)).toEqual({
      endTimeRoundedOffToNearest30min: datetimeMock,
      ...startTimeToEndTimeMock(TimePeriodEnum.SEVEN_DAYS)
    })
    expect(getStartAndEndTime(TimePeriodEnum.THIRTY_DAYS)).toEqual({
      endTimeRoundedOffToNearest30min: datetimeMock,
      ...startTimeToEndTimeMock(TimePeriodEnum.THIRTY_DAYS)
    })
  })

  test('should create correct payload for createTimelineSeriesData', () => {
    const categoryTimeline = {
      Alert: mockTimeData,
      Deployment: mockTimeData,
      Infrastructure: mockTimeData
    }
    expect(
      createTimelineSeriesData(ChangeSourceTypes.Deployments, (val: string) => val, categoryTimeline?.Deployment)
    ).toEqual(mockDeploymentPayload)
    expect(
      createTimelineSeriesData(ChangeSourceTypes.Incidents, (val: string) => val, categoryTimeline?.Alert)
    ).toEqual(mockIncidentPayload)
    expect(
      createTimelineSeriesData(ChangeSourceTypes.Infrastructure, (val: string) => val, categoryTimeline?.Infrastructure)
    ).toEqual(mockInfraPayload)
  })

  test('Shoudl valdiate createTooltipLabel', () => {
    expect(createTooltipLabel(1, ChangeSourceTypes.Deployments, getString)).toEqual('1 deploymentText')
    expect(createTooltipLabel(4, ChangeSourceTypes.Deployments, getString)).toEqual('4 Deployments')
    expect(createTooltipLabel(1, ChangeSourceTypes.Incidents, getString)).toEqual('1 cv.changeSource.incident')
    expect(createTooltipLabel(4, ChangeSourceTypes.Incidents, getString)).toEqual('4 cv.changeSource.tooltip.incidents')
    expect(createTooltipLabel(1, ChangeSourceTypes.Infrastructure, getString)).toEqual('1 infrastructureText change')
    expect(createTooltipLabel(4, ChangeSourceTypes.Infrastructure, getString)).toEqual('4 infrastructureText changes')
  })
})
