/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Utils } from '@wings-software/uicore'
import { Color } from '@harness/design-system'
import {
  RiskValues,
  getRiskColorValue,
  getSecondaryRiskColorValue,
  isNumeric,
  getEventTypeColor,
  EVENT_TYPE,
  getEventTypeLightColor,
  getEventTypeChartColor
} from './CommonUtils'

describe('Test for getRiskColorValue', () => {
  test('getRiskColorValue should return correct realCSSColors', () => {
    expect(getRiskColorValue(RiskValues.NO_DATA)).toEqual(Utils.getRealCSSColor(Color.GREY_400))
    expect(getRiskColorValue(RiskValues.NO_DATA, true, false)).toEqual(Utils.getRealCSSColor(Color.GREY_100))
    expect(getRiskColorValue(RiskValues.HEALTHY)).toEqual(Utils.getRealCSSColor(Color.GREEN_500))
    expect(getRiskColorValue(RiskValues.OBSERVE)).toEqual(Utils.getRealCSSColor(Color.YELLOW_800))
    expect(getRiskColorValue(RiskValues.NEED_ATTENTION)).toEqual(Utils.getRealCSSColor(Color.ORANGE_600))
    expect(getRiskColorValue(RiskValues.UNHEALTHY)).toEqual(Utils.getRealCSSColor(Color.RED_600))
    expect(getRiskColorValue(RiskValues.NO_ANALYSIS)).toEqual(Utils.getRealCSSColor(Color.GREY_400))
    expect(getRiskColorValue()).toEqual(Utils.getRealCSSColor(Color.GREY_400))
  })
  test('getRiskColorValue should return correct non realCSSColors', () => {
    expect(getRiskColorValue(RiskValues.NO_DATA, false)).toEqual(Color.GREY_400)
    expect(getRiskColorValue(RiskValues.NO_DATA, false, false)).toEqual(Color.GREY_100)
    expect(getRiskColorValue(RiskValues.HEALTHY, false)).toEqual(Color.GREEN_500)
    expect(getRiskColorValue(RiskValues.OBSERVE, false)).toEqual(Color.YELLOW_800)
    expect(getRiskColorValue(RiskValues.NEED_ATTENTION, false)).toEqual(Color.ORANGE_600)
    expect(getRiskColorValue(RiskValues.UNHEALTHY, false)).toEqual(Color.RED_600)
    expect(getRiskColorValue(RiskValues.NO_ANALYSIS, false)).toEqual(Color.GREY_400)
    expect(getRiskColorValue()).toEqual(Utils.getRealCSSColor(Color.GREY_400))
  })
})

describe('Test for getSecondaryRiskColorValue', () => {
  test('getSecondaryRiskColorValue should return correct realCSSColors', () => {
    expect(getSecondaryRiskColorValue(RiskValues.NO_DATA)).toEqual(Utils.getRealCSSColor(Color.GREY_50))
    expect(getSecondaryRiskColorValue(RiskValues.HEALTHY)).toEqual(Utils.getRealCSSColor(Color.GREEN_50))
    expect(getSecondaryRiskColorValue(RiskValues.OBSERVE)).toEqual(Utils.getRealCSSColor(Color.YELLOW_50))
    expect(getSecondaryRiskColorValue(RiskValues.NEED_ATTENTION)).toEqual(Utils.getRealCSSColor(Color.ORANGE_50))
    expect(getSecondaryRiskColorValue(RiskValues.UNHEALTHY)).toEqual(Utils.getRealCSSColor(Color.RED_50))
    expect(getSecondaryRiskColorValue(RiskValues.NO_ANALYSIS)).toEqual(Utils.getRealCSSColor(Color.GREY_50))
    expect(getSecondaryRiskColorValue()).toEqual(Utils.getRealCSSColor(Color.GREY_50))
  })
  test('getSecondaryRiskColorValue should return correct non realCSSColors', () => {
    expect(getSecondaryRiskColorValue(RiskValues.NO_DATA, false)).toEqual(Color.GREY_50)
    expect(getSecondaryRiskColorValue(RiskValues.HEALTHY, false)).toEqual(Color.GREEN_50)
    expect(getSecondaryRiskColorValue(RiskValues.OBSERVE, false)).toEqual(Color.YELLOW_50)
    expect(getSecondaryRiskColorValue(RiskValues.NEED_ATTENTION, false)).toEqual(Color.ORANGE_50)
    expect(getSecondaryRiskColorValue(RiskValues.UNHEALTHY, false)).toEqual(Color.RED_50)
    expect(getSecondaryRiskColorValue(RiskValues.NO_ANALYSIS, false)).toEqual(Color.GREY_50)
    expect(getSecondaryRiskColorValue()).toEqual(Utils.getRealCSSColor(Color.GREY_50))
  })
})

describe('Test for isNumeric', () => {
  test('isNumeric method should return correct results', () => {
    expect(isNumeric('123')).toEqual(true)
    expect(isNumeric('abc')).toEqual(false)
    expect(isNumeric('-456')).toEqual(true)
  })
})

describe('test for logs screen utils', () => {
  test('getEventTypeLightColor should return correct color values', () => {
    expect(getEventTypeLightColor(EVENT_TYPE.UNKNOWN)).toEqual(Utils.getRealCSSColor(Color.RED_50))
    expect(getEventTypeLightColor(EVENT_TYPE.UNKNOWN, true)).toEqual('var(--red-50)')
    expect(getEventTypeLightColor(EVENT_TYPE.KNOWN)).toEqual(Utils.getRealCSSColor(Color.PRIMARY_2))
    expect(getEventTypeLightColor(EVENT_TYPE.KNOWN, true)).toEqual('var(--primary-2)')
    expect(getEventTypeLightColor(EVENT_TYPE.FREQUENCY)).toEqual(Utils.getRealCSSColor(Color.YELLOW_200))
    expect(getEventTypeLightColor(EVENT_TYPE.FREQUENCY, true)).toEqual('var(--yellow-200)')
    expect(getEventTypeLightColor('UNEXPECTED')).toEqual(Utils.getRealCSSColor(Color.YELLOW_200))
    expect(getEventTypeLightColor('UNEXPECTED', true)).toEqual('var(--yellow-200)')
    expect(getEventTypeLightColor(EVENT_TYPE.BASELINE)).toEqual(Utils.getRealCSSColor(Color.GREY_200))
    expect(getEventTypeLightColor(EVENT_TYPE.BASELINE, true)).toEqual('var(--grey-200)')
  })

  test('getEventTypeColor should return correct color values', () => {
    expect(getEventTypeColor(EVENT_TYPE.UNKNOWN)).toEqual(Utils.getRealCSSColor(Color.RED_800))
    expect(getEventTypeColor(EVENT_TYPE.UNKNOWN, true)).toEqual('var(--red-800)')
    expect(getEventTypeColor(EVENT_TYPE.KNOWN)).toEqual(Utils.getRealCSSColor(Color.PRIMARY_7))
    expect(getEventTypeColor(EVENT_TYPE.KNOWN, true)).toEqual('var(--primary-7)')
    expect(getEventTypeColor(EVENT_TYPE.FREQUENCY)).toEqual(Utils.getRealCSSColor(Color.YELLOW_800))
    expect(getEventTypeColor(EVENT_TYPE.FREQUENCY, true)).toEqual('var(--yellow-800)')
    expect(getEventTypeColor(EVENT_TYPE.BASELINE)).toEqual(Utils.getRealCSSColor(Color.GREY_700))
    expect(getEventTypeColor(EVENT_TYPE.BASELINE, true)).toEqual('var(--grey-700)')
  })

  test('getEventTypeChartColor should return correct color values', () => {
    expect(getEventTypeChartColor(EVENT_TYPE.UNKNOWN)).toEqual(Utils.getRealCSSColor(Color.RED_400))
    expect(getEventTypeChartColor(EVENT_TYPE.UNKNOWN, true)).toEqual('var(--red-400)')
    expect(getEventTypeChartColor(EVENT_TYPE.KNOWN)).toEqual(Utils.getRealCSSColor(Color.PRIMARY_4))
    expect(getEventTypeChartColor(EVENT_TYPE.KNOWN, true)).toEqual('var(--primary-4)')
    expect(getEventTypeChartColor(EVENT_TYPE.FREQUENCY)).toEqual(Utils.getRealCSSColor(Color.YELLOW_700))
    expect(getEventTypeChartColor(EVENT_TYPE.FREQUENCY, true)).toEqual('var(--yellow-700)')
    expect(getEventTypeChartColor(EVENT_TYPE.BASELINE)).toEqual(Utils.getRealCSSColor(Color.GREY_300))
    expect(getEventTypeChartColor(EVENT_TYPE.BASELINE, true)).toEqual('var(--grey-300)')
  })
})
