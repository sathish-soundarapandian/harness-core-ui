/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { initialValuesSLO } from '../CVCreateSLO.constants'
import { PeriodLengthTypes, PeriodTypes, SLIMetricTypes, Days } from '../CVCreateSLO.types'
import {
  convertServiceLevelIndicatorToSLIFormData,
  convertSLOFormDataToServiceLevelIndicatorDTO,
  getSLOInitialFormData,
  createSLORequestPayload,
  getMetricValuesBySLIMetricType,
  getMetricFormValuesBySLIMetricType
} from '../CVCreateSLO.utils'
import { serviceLevelIndicator, SLIFormData, serviceLevelObjective, SLOResponse, pathParams } from './CVCreateSLO.mock'

const { orgIdentifier, projectIdentifier } = pathParams

describe('Utils', () => {
  test('convertServiceLevelIndicatorToSLIFormData', () => {
    expect(convertServiceLevelIndicatorToSLIFormData(serviceLevelIndicator)).toEqual(SLIFormData)
  })

  test('convertSLOFormDataToServiceLevelIndicatorDTO', () => {
    expect(convertSLOFormDataToServiceLevelIndicatorDTO(serviceLevelObjective)).toEqual(serviceLevelIndicator)
  })

  test('convertSLOFormDataToServiceLevelIndicatorDTO for Threshold based', () => {
    expect(
      convertSLOFormDataToServiceLevelIndicatorDTO({
        ...serviceLevelObjective,
        SLIMetricType: SLIMetricTypes.THRESHOLD
      })
    ).toEqual({
      ...serviceLevelIndicator,
      spec: {
        type: SLIMetricTypes.THRESHOLD,
        spec: {
          ...serviceLevelIndicator.spec.spec,
          eventType: undefined,
          metric1: 'metric2',
          metric2: undefined
        }
      }
    })
  })

  test('getSLOInitialFormData', () => {
    expect(getSLOInitialFormData()).toEqual(initialValuesSLO)
  })

  test('getSLOInitialFormData for edit flow', () => {
    expect(getSLOInitialFormData(SLOResponse.resource?.serviceLevelObjective)).toEqual(serviceLevelObjective)
  })

  test('createSLORequestPayload - Ratio based', () => {
    const SLORequestPayload = createSLORequestPayload(serviceLevelObjective, orgIdentifier, projectIdentifier)

    expect(SLORequestPayload.serviceLevelIndicators[0].spec.spec.eventType).toEqual(serviceLevelObjective.eventType)
    expect(SLORequestPayload.serviceLevelIndicators[0].spec.spec.metric2).toEqual(
      serviceLevelObjective.validRequestMetric
    )
  })

  test('createSLORequestPayload - Threshold based', () => {
    const SLORequestPayload = createSLORequestPayload(
      { ...serviceLevelObjective, SLIMetricType: SLIMetricTypes.THRESHOLD },
      orgIdentifier,
      projectIdentifier
    )

    expect(SLORequestPayload.serviceLevelIndicators[0].spec.spec.eventType).toBeUndefined()
    expect(SLORequestPayload.serviceLevelIndicators[0].spec.spec.metric2).toBeUndefined()
  })

  test('createSLORequestPayload - Rolling', () => {
    const SLORequestPayload = createSLORequestPayload(serviceLevelObjective, orgIdentifier, projectIdentifier)

    expect(SLORequestPayload.target.spec.periodLength).toEqual(serviceLevelObjective.periodLength)
    expect(SLORequestPayload.target.spec.spec.dayOfWeek).toBeUndefined()
    expect(SLORequestPayload.target.spec.spec.dayOfMonth).toBeUndefined()
  })

  test('createSLORequestPayload - Calendar - Weekly', () => {
    const SLORequestPayload = createSLORequestPayload(
      {
        ...serviceLevelObjective,
        periodType: PeriodTypes.CALENDAR,
        periodLengthType: PeriodLengthTypes.WEEKLY,
        dayOfWeek: Days.MONDAY
      },
      orgIdentifier,
      projectIdentifier
    )

    expect(SLORequestPayload.target.spec.periodLength).toBeUndefined()
    expect(SLORequestPayload.target.spec.spec.dayOfWeek).toEqual(Days.MONDAY)
    expect(SLORequestPayload.target.spec.spec.dayOfMonth).toBeUndefined()
  })

  test('createSLORequestPayload - Calendar - Monthly', () => {
    const SLORequestPayload = createSLORequestPayload(
      {
        ...serviceLevelObjective,
        periodType: PeriodTypes.CALENDAR,
        periodLengthType: PeriodLengthTypes.MONTHLY,
        dayOfMonth: '2d'
      },
      orgIdentifier,
      projectIdentifier
    )

    expect(SLORequestPayload.target.spec.periodLength).toBeUndefined()
    expect(SLORequestPayload.target.spec.spec.dayOfWeek).toBeUndefined()
    expect(SLORequestPayload.target.spec.spec.dayOfMonth).toEqual('2d')
  })

  test('createSLORequestPayload - Calendar - Quarterly', () => {
    const SLORequestPayload = createSLORequestPayload(
      {
        ...serviceLevelObjective,
        periodType: PeriodTypes.CALENDAR,
        periodLengthType: PeriodLengthTypes.QUARTERLY
      },
      orgIdentifier,
      projectIdentifier
    )

    expect(SLORequestPayload.target.spec.periodLength).toBeUndefined()
    expect(SLORequestPayload.target.spec.spec.dayOfWeek).toBeUndefined()
    expect(SLORequestPayload.target.spec.spec.dayOfMonth).toBeUndefined()
  })

  test('validate getMetricValuesBySLIMetricType', () => {
    const props = {
      sliMetricType: 'Ratio',
      goodRequestMetric: 'metric1',
      validRequestMetric: 'metric2'
    }
    expect(getMetricValuesBySLIMetricType({})).toEqual({ metric1: '', metric2: undefined })
    expect(getMetricValuesBySLIMetricType({ ...props })).toEqual({
      metric1: 'metric1',
      metric2: 'metric2'
    })
    expect(getMetricValuesBySLIMetricType({ ...props, sliMetricType: 'Threshold' })).toEqual({
      metric1: 'metric2',
      metric2: undefined
    })
  })

  test('validate getMetricFormValuesBySLIMetricType', () => {
    const props = {
      sliMetricType: 'Ratio',
      metric1: 'metric1',
      metric2: 'metric2'
    }
    expect(getMetricFormValuesBySLIMetricType({})).toEqual({
      goodRequestMetric: undefined,
      validRequestMetric: ''
    })
    expect(getMetricFormValuesBySLIMetricType({ ...props })).toEqual({
      goodRequestMetric: 'metric1',
      validRequestMetric: 'metric2'
    })
    expect(getMetricFormValuesBySLIMetricType({ ...props, sliMetricType: 'Threshold' })).toEqual({
      goodRequestMetric: undefined,
      validRequestMetric: 'metric1'
    })
  })
})
