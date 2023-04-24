/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { StringKeys } from 'framework/strings'
import {
  getDefaultAllOption,
  getServiceLevelObjectivesRiskCountParams,
  isSLOFilterApplied
} from '../CVSLOListingPage.utils'
import type { SLOFilterState } from '../CVSLOsListingPage.types'
import {
  riskCountQueryParamsExpectedResult,
  riskCountQueryParamsParametersMock,
  riskCountQueryParamsParametersWithoutDefaultMock,
  riskCountQueryParamsWithAllMonitoredServiceResult
} from './CVSLOsListingPage.mock'

function getString(key: StringKeys): StringKeys {
  return key
}

const filterState = {
  monitoredService: getDefaultAllOption(getString),
  userJourney: getDefaultAllOption(getString),
  targetTypes: getDefaultAllOption(getString),
  sliTypes: getDefaultAllOption(getString),
  evaluationType: getDefaultAllOption(getString),
  search: ''
} as SLOFilterState

describe('CVSLOListingPage utils', () => {
  test('getServiceLevelObjectivesRiskCountParams should take monitored service default identifier if it exists', () => {
    const result = getServiceLevelObjectivesRiskCountParams(riskCountQueryParamsParametersMock)

    expect(result).toEqual(riskCountQueryParamsExpectedResult)
  })

  test('getServiceLevelObjectivesRiskCountParams should return evaluationType in filter state', () => {
    const result = getServiceLevelObjectivesRiskCountParams({
      ...riskCountQueryParamsParametersMock,
      filterState: {
        ...riskCountQueryParamsParametersMock.filterState,
        evaluationType: {
          label: 'All',
          value: 'All'
        }
      }
    })

    expect(result).toEqual({
      ...riskCountQueryParamsExpectedResult,
      queryParams: {
        evaluationType: ['All'],
        ...riskCountQueryParamsExpectedResult.queryParams
      }
    })
  })

  test('getServiceLevelObjectivesRiskCountParams should take filtered monitored service if default monitored service identifier not present', () => {
    const result = getServiceLevelObjectivesRiskCountParams(riskCountQueryParamsParametersWithoutDefaultMock)

    expect(result).toEqual(riskCountQueryParamsWithAllMonitoredServiceResult)
  })

  test('isSLOFilterApplied should return correct value when no filter or at least one filter is applied', () => {
    // when no filter applied
    let result = isSLOFilterApplied(getString, filterState)
    expect(result).toBe(false)

    // when MS selected
    result = isSLOFilterApplied(getString, { ...filterState, monitoredService: { label: 'msdemo', value: 'msdemo' } })
    expect(result).toBe(true)

    // when trying to search
    result = isSLOFilterApplied(getString, { ...filterState, search: 'SLO1' })
    expect(result).toBe(true)

    // when user journey selected
    result = isSLOFilterApplied(getString, { ...filterState, userJourney: { label: 'uj1', value: 'uj1' } })
    expect(result).toBe(true)
  })
})
