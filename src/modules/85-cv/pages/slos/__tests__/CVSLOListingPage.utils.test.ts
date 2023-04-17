/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { getServiceLevelObjectivesRiskCountParams } from '../CVSLOListingPage.utils'
import {
  riskCountQueryParamsExpectedResult,
  riskCountQueryParamsParametersMock,
  riskCountQueryParamsParametersWithoutDefaultMock,
  riskCountQueryParamsWithAllMonitoredServiceResult
} from './CVSLOsListingPage.mock'

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
})
