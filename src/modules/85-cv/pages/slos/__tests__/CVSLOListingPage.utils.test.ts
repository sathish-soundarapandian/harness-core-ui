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

  test('getServiceLevelObjectivesRiskCountParams should take filtered monitored service if default monitored service identifier not present', () => {
    const result = getServiceLevelObjectivesRiskCountParams(riskCountQueryParamsParametersWithoutDefaultMock)

    expect(result).toEqual(riskCountQueryParamsWithAllMonitoredServiceResult)
  })
})
