/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Utils } from '@harness/uicore'
import { Color } from '@harness/design-system'
import type { StringKeys } from 'framework/strings'
import {
  RiskValues,
  getRiskColorValue,
  getSecondaryRiskColorValue,
  isNumeric,
  getEventTypeColor,
  EVENT_TYPE,
  getEventTypeLightColor,
  getEventTypeChartColor,
  getRiskColorLogo,
  SLOErrorBudget,
  getDetailsLabel,
  getRiskLabelStringId,
  getMonitoredServiceIdentifiers
} from '../CommonUtils'
import {
  monitoredServiceDetails,
  projectLevelMonitoredServiceIdentifier,
  accountLevelMonitoredServiceIdentifier
} from './CommonUtils.mock'

function getString(key: StringKeys): StringKeys {
  return key
}

describe('Test for getRiskColorValue', () => {
  test('getRiskColorValue should return correct realCSSColors', () => {
    expect(getRiskColorValue(RiskValues.NO_DATA)).toEqual(Utils.getRealCSSColor(Color.GREY_400))
    expect(getRiskColorValue(RiskValues.NO_DATA, true, false)).toEqual(Utils.getRealCSSColor(Color.GREY_100))
    expect(getRiskColorValue(RiskValues.HEALTHY)).toEqual(Utils.getRealCSSColor(Color.GREEN_700))
    expect(getRiskColorValue(RiskValues.OBSERVE)).toEqual(Utils.getRealCSSColor(Color.YELLOW_900))
    expect(getRiskColorValue(RiskValues.NEED_ATTENTION)).toEqual(Utils.getRealCSSColor(Color.ORANGE_700))
    expect(getRiskColorValue(SLOErrorBudget.EXHAUSTED)).toEqual(Utils.getRealCSSColor(Color.RED_900))
    expect(getRiskColorValue(RiskValues.UNHEALTHY)).toEqual(Utils.getRealCSSColor(Color.RED_900))
    expect(getRiskColorValue(RiskValues.NO_ANALYSIS)).toEqual(Utils.getRealCSSColor(Color.GREY_400))
    expect(getRiskColorValue()).toEqual(Utils.getRealCSSColor(Color.GREY_400))
  })
  test('getRiskColorValue should return correct non realCSSColors', () => {
    expect(getRiskColorValue(RiskValues.NO_DATA, false)).toEqual(Color.GREY_400)
    expect(getRiskColorValue(RiskValues.NO_DATA, false, false)).toEqual(Color.GREY_100)
    expect(getRiskColorValue(RiskValues.HEALTHY, false)).toEqual(Color.GREEN_700)
    expect(getRiskColorValue(RiskValues.OBSERVE, false)).toEqual(Color.YELLOW_900)
    expect(getRiskColorValue(RiskValues.NEED_ATTENTION, false)).toEqual(Color.ORANGE_700)
    expect(getRiskColorValue(SLOErrorBudget.EXHAUSTED, false)).toEqual(Color.RED_900)
    expect(getRiskColorValue(RiskValues.UNHEALTHY, false)).toEqual(Color.RED_900)
    expect(getRiskColorValue(RiskValues.NO_ANALYSIS, false)).toEqual(Color.GREY_400)
    expect(getRiskColorValue()).toEqual(Utils.getRealCSSColor(Color.GREY_400))
  })
})

describe('Test for getSecondaryRiskColorValue', () => {
  test('getSecondaryRiskColorValue should return correct realCSSColors', () => {
    expect(getSecondaryRiskColorValue(RiskValues.NO_DATA)).toEqual(Utils.getRealCSSColor(Color.GREY_50))
    expect(getSecondaryRiskColorValue(RiskValues.HEALTHY)).toEqual(Utils.getRealCSSColor(Color.GREEN_50))
    expect(getSecondaryRiskColorValue(RiskValues.OBSERVE)).toEqual(Utils.getRealCSSColor(Color.YELLOW_100))
    expect(getSecondaryRiskColorValue(RiskValues.NEED_ATTENTION)).toEqual(Utils.getRealCSSColor(Color.ORANGE_100))
    expect(getSecondaryRiskColorValue(RiskValues.UNHEALTHY)).toEqual(Utils.getRealCSSColor(Color.RED_50))
    expect(getSecondaryRiskColorValue(SLOErrorBudget.EXHAUSTED)).toEqual(Utils.getRealCSSColor(Color.RED_50))
    expect(getSecondaryRiskColorValue(RiskValues.NO_ANALYSIS)).toEqual(Utils.getRealCSSColor(Color.GREY_50))
    expect(getSecondaryRiskColorValue()).toEqual(Utils.getRealCSSColor(Color.GREY_50))
  })
  test('getSecondaryRiskColorValue should return correct non realCSSColors', () => {
    expect(getSecondaryRiskColorValue(RiskValues.NO_DATA, false)).toEqual(Color.GREY_50)
    expect(getSecondaryRiskColorValue(RiskValues.HEALTHY, false)).toEqual(Color.GREEN_50)
    expect(getSecondaryRiskColorValue(RiskValues.OBSERVE, false)).toEqual(Color.YELLOW_100)
    expect(getSecondaryRiskColorValue(RiskValues.NEED_ATTENTION, false)).toEqual(Color.ORANGE_100)
    expect(getSecondaryRiskColorValue(RiskValues.UNHEALTHY, false)).toEqual(Color.RED_50)
    expect(getSecondaryRiskColorValue(SLOErrorBudget.EXHAUSTED, false)).toEqual(Color.RED_50)
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
  test('getEventTypeLightColor should return correct realCSSColor values', () => {
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

  test('getEventTypeLightColor should return correct non realCSSColor values', () => {
    expect(getEventTypeLightColor(EVENT_TYPE.UNKNOWN, false)).toEqual(Color.RED_50)
    expect(getEventTypeLightColor(EVENT_TYPE.KNOWN, false)).toEqual(Color.PRIMARY_2)
    expect(getEventTypeLightColor(EVENT_TYPE.FREQUENCY, false)).toEqual(Color.YELLOW_200)
    expect(getEventTypeLightColor('UNEXPECTED', false)).toEqual(Color.YELLOW_200)
    expect(getEventTypeLightColor(EVENT_TYPE.BASELINE, false)).toEqual(Color.GREY_200)
  })

  test('getEventTypeColor should return correct realCSSColor values', () => {
    expect(getEventTypeColor(EVENT_TYPE.UNKNOWN)).toEqual(Utils.getRealCSSColor(Color.RED_800))
    expect(getEventTypeColor(EVENT_TYPE.UNKNOWN, true)).toEqual('var(--red-800)')
    expect(getEventTypeColor(EVENT_TYPE.KNOWN)).toEqual(Utils.getRealCSSColor(Color.PRIMARY_7))
    expect(getEventTypeColor(EVENT_TYPE.KNOWN, true)).toEqual('var(--primary-7)')
    expect(getEventTypeColor(EVENT_TYPE.FREQUENCY)).toEqual(Utils.getRealCSSColor(Color.YELLOW_800))
    expect(getEventTypeColor(EVENT_TYPE.FREQUENCY, true)).toEqual('var(--yellow-800)')
    expect(getEventTypeColor(EVENT_TYPE.BASELINE)).toEqual(Utils.getRealCSSColor(Color.GREY_700))
    expect(getEventTypeColor(EVENT_TYPE.BASELINE, true)).toEqual('var(--grey-700)')
  })

  test('getEventTypeColor should return correct non realCSSColor values', () => {
    expect(getEventTypeColor(EVENT_TYPE.UNKNOWN, false)).toEqual(Color.RED_800)
    expect(getEventTypeColor(EVENT_TYPE.KNOWN, false)).toEqual(Color.PRIMARY_7)
    expect(getEventTypeColor(EVENT_TYPE.FREQUENCY, false)).toEqual(Color.YELLOW_800)
    expect(getEventTypeColor(EVENT_TYPE.BASELINE, false)).toEqual(Color.GREY_700)
  })

  test('getEventTypeChartColor should return correct realCSSColor values', () => {
    expect(getEventTypeChartColor(EVENT_TYPE.UNKNOWN)).toEqual(Utils.getRealCSSColor(Color.RED_400))
    expect(getEventTypeChartColor(EVENT_TYPE.UNKNOWN, true)).toEqual('var(--red-400)')
    expect(getEventTypeChartColor(EVENT_TYPE.KNOWN)).toEqual(Utils.getRealCSSColor(Color.PRIMARY_5))
    expect(getEventTypeChartColor(EVENT_TYPE.KNOWN, true)).toEqual('var(--primary-5)')
    expect(getEventTypeChartColor(EVENT_TYPE.FREQUENCY)).toEqual(Utils.getRealCSSColor(Color.YELLOW_700))
    expect(getEventTypeChartColor(EVENT_TYPE.FREQUENCY, true)).toEqual('var(--yellow-700)')
    expect(getEventTypeChartColor(EVENT_TYPE.BASELINE)).toEqual(Utils.getRealCSSColor(Color.GREY_300))
    expect(getEventTypeChartColor(EVENT_TYPE.BASELINE, true)).toEqual('var(--grey-300)')
  })

  test('getEventTypeChartColor should return correct non realCSSColor values', () => {
    expect(getEventTypeChartColor(EVENT_TYPE.UNKNOWN, false)).toEqual(Color.RED_400)
    expect(getEventTypeChartColor(EVENT_TYPE.KNOWN, false)).toEqual(Color.PRIMARY_5)
    expect(getEventTypeChartColor(EVENT_TYPE.FREQUENCY, false)).toEqual(Color.YELLOW_700)
    expect(getEventTypeChartColor(EVENT_TYPE.BASELINE, false)).toEqual(Color.GREY_300)
  })
})

describe('Test for getRiskColorLogo', () => {
  test('test for getting correct logo for particular risk color', () => {
    expect(getRiskColorLogo(RiskValues.HEALTHY)).toEqual('heart')
    expect(getRiskColorLogo(RiskValues.OBSERVE)).toEqual('warning-icon')
    expect(getRiskColorLogo(RiskValues.NEED_ATTENTION)).toEqual('warning-sign')
    expect(getRiskColorLogo(RiskValues.UNHEALTHY)).toEqual('heart-broken')
    expect(getRiskColorLogo(SLOErrorBudget.EXHAUSTED)).toEqual('remove-minus')
    expect(getRiskColorLogo(undefined)).toEqual('grid')
  })
})

describe('Test for getDetailsLabel', () => {
  test('test for getting correct details label', () => {
    expect(getDetailsLabel('artifactType', getString)).toEqual(getString('pipeline.artifactsSelection.artifactType'))
    expect(getDetailsLabel('artifactTag', getString)).toEqual(getString('connectors.cdng.artifactTag'))
    expect(getDetailsLabel('executedBy', getString)).toEqual(getString('common.executedBy'))
    expect(getDetailsLabel('updatedBy', getString)).toEqual(getString('common.updatedBy'))
    expect(getDetailsLabel('eventType', getString)).toEqual(getString('pipeline.verification.logs.eventType'))
    expect(getDetailsLabel('UNKNOWN', getString)).toEqual('UNKNOWN')
  })
})

describe('Test for getRiskLabelStringId', () => {
  test('test for getting correct risk label string id', () => {
    expect(getRiskLabelStringId(RiskValues.NO_DATA)).toEqual('noData')
    expect(getRiskLabelStringId(RiskValues.NO_ANALYSIS)).toEqual('cv.noAnalysis')
    expect(getRiskLabelStringId(RiskValues.HEALTHY)).toEqual('cd.getStartedWithCD.healthStatus.healthy')
    expect(getRiskLabelStringId(RiskValues.OBSERVE)).toEqual(
      'cv.monitoredServices.serviceHealth.serviceDependencies.states.observe'
    )
    expect(getRiskLabelStringId(RiskValues.NEED_ATTENTION)).toEqual(
      'cv.monitoredServices.serviceHealth.serviceDependencies.states.needsAttention'
    )
    expect(getRiskLabelStringId(RiskValues.UNHEALTHY)).toEqual(
      'cv.monitoredServices.serviceHealth.serviceDependencies.states.unhealthy'
    )
    expect(getRiskLabelStringId(SLOErrorBudget.EXHAUSTED)).toEqual(
      'cv.monitoredServices.serviceHealth.serviceDependencies.states.exhausted'
    )
    expect(getRiskLabelStringId(undefined)).toEqual('na')
  })
})

describe('Test for getMonitoredServiceIdentifiers', () => {
  test('test with empty undefined', () => {
    expect(getMonitoredServiceIdentifiers(false, undefined)).toEqual([])
    expect(getMonitoredServiceIdentifiers(true, undefined)).toEqual([])
    expect(getMonitoredServiceIdentifiers(true, [])).toEqual([])
    expect(getMonitoredServiceIdentifiers(false, [])).toEqual([])
  })
  test('test with values', () => {
    expect(getMonitoredServiceIdentifiers(false, monitoredServiceDetails)).toEqual(
      projectLevelMonitoredServiceIdentifier
    )
    expect(getMonitoredServiceIdentifiers(true, monitoredServiceDetails)).toEqual(
      accountLevelMonitoredServiceIdentifier
    )
  })
})
