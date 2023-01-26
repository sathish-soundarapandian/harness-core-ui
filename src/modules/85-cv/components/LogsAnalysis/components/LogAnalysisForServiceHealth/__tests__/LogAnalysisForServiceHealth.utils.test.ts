import { getInitialNodeName } from '../LogAnalysisForServiceHealth.utils'

describe('LogAnalysisForServiceHealth utils', () => {
  test('getInitialNodeName should return empty array, if no node is selected', () => {
    const result = getInitialNodeName()

    expect(result).toEqual([])
  })
})
