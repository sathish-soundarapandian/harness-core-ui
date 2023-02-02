import { getLogAnalysisData } from '../../LogAnalysis.utils'
import { expectedData, logsData } from './LogAnalysisUtils.mocks'

describe('LogAnalysisUtils', () => {
  test('getSingleLogData should return correct data', () => {
    const logAnalysisData = getLogAnalysisData(logsData)
    expect(logAnalysisData).toEqual(expectedData)
  })
})
