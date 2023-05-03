import type { SelectOption } from '@harness/uicore'
import type { BenchmarkDTO, UserResponsesResponse } from 'services/assessments'
import {
  getBenchMarkItems,
  getDefaultBenchMark,
  getFilteredResponsesForRange,
  getFilteredResultsForScore,
  getFilteredResultsForSearch
} from '../AssessmentSurvey.utils'

describe('AssessmentSurvey', () => {
  test('returns an empty array when the benchmarksData parameter is null', () => {
    const result = getBenchMarkItems(null)
    expect(result).toEqual([])
  })

  test('returns an empty array when the benchmarksData parameter is an empty array', () => {
    const result = getBenchMarkItems([])
    expect(result).toEqual([])
  })

  test('returns an empty array when the benchmarksData parameter is null', () => {
    const result = getBenchMarkItems(null)
    expect(result).toEqual([])
  })

  test('returns an array of SelectOption objects when given valid input', () => {
    const mockData: BenchmarkDTO[] = [
      { benchmarkName: 'Benchmark 1', benchmarkId: '1' },
      { benchmarkName: 'Benchmark 2', benchmarkId: '2' }
    ]
    const expectedOutput: SelectOption[] = [
      { label: 'Benchmark 1', value: '1' },
      { label: 'Benchmark 2', value: '2' }
    ]
    const result = getBenchMarkItems(mockData)
    expect(result).toEqual(expectedOutput)
  })

  test('returns an empty SelectOption object when the benchmarksData parameter is an empty array', () => {
    const result = getDefaultBenchMark([])
    expect(result).toEqual({ label: '', value: '' })
  })

  test('returns an empty SelectOption object if no BenchmarkDTO object has isDefault set to true', () => {
    const mockData: BenchmarkDTO[] = [
      { benchmarkName: 'Benchmark 1', benchmarkId: '1', isDefault: false },
      { benchmarkName: 'Benchmark 2', benchmarkId: '2', isDefault: false }
    ]
    const result = getDefaultBenchMark(mockData)
    expect(result).toEqual({ label: '', value: '' })
  })

  test('returns a SelectOption object with the correct label and value properties', () => {
    const mockData: BenchmarkDTO[] = [
      { benchmarkName: 'Benchmark 1', benchmarkId: '1', isDefault: false },
      { benchmarkName: 'Benchmark 2', benchmarkId: '2', isDefault: true },
      { benchmarkName: 'Benchmark 3', benchmarkId: '3', isDefault: false }
    ]
    const expectedOutput: SelectOption = { label: 'Benchmark 2', value: '2' }
    const result = getDefaultBenchMark(mockData)
    expect(result).toEqual(expectedOutput)
  })

  test('filters out UserResponsesResponse objects with a userScore outside the specified range', () => {
    const mockData: UserResponsesResponse[] = [{ userScore: 5 }, { userScore: 10 }, { userScore: 15 }]
    const expectedOutput: UserResponsesResponse[] = [{ userScore: 10 }, { userScore: 15 }]
    const result = getFilteredResponsesForRange([], mockData, [8, 16])
    expect(result).toEqual(expectedOutput)
  })

  test('returns an empty array if both the filteredResults and responses parameters are undefined', () => {
    const result = getFilteredResponsesForRange(undefined, undefined, [0, 10])
    expect(result).toEqual([])
  })
})

describe('test getFilteredResultsForScore method', () => {
  const responses = [{ userScore: 3 }, { userScore: 7 }, { userScore: 10 }, { userScore: 2 }, { userScore: 5 }]

  test('should return an empty array when selectedScore is null', () => {
    const selectedScore = null
    const filteredResults = getFilteredResultsForScore(selectedScore, responses)
    expect(filteredResults).toEqual([])
  })

  test('should return an array of responses with scores between 0 and 3 when selectedScore is "0_3"', () => {
    const selectedScore = { value: '0_3', label: '0-3' }
    const filteredResults = getFilteredResultsForScore(selectedScore, responses)
    expect(filteredResults).toEqual([{ userScore: 3 }, { userScore: 2 }])
  })

  test('should return an array of responses with scores between 4 and 7 when selectedScore is "4_7"', () => {
    const selectedScore = { value: '4_7', label: '4-7' }
    const filteredResults = getFilteredResultsForScore(selectedScore, responses)
    expect(filteredResults).toEqual([{ userScore: 7 }, { userScore: 5 }])
  })

  test('should return an array of responses with scores between 8 and 10 when selectedScore is "8_10"', () => {
    const selectedScore = { value: '8_10', label: '8-10' }
    const filteredResults = getFilteredResultsForScore(selectedScore, responses)
    expect(filteredResults).toEqual([{ userScore: 10 }])
  })

  test('should return an array of all responses when selectedScore is "all"', () => {
    const selectedScore = { value: 'all', label: 'All' }
    const filteredResults = getFilteredResultsForScore(selectedScore, responses)
    expect(filteredResults).toEqual(responses)
  })
})

describe('test getFilteredResultsForSearch method', () => {
  const mockResponses = [
    {
      id: 1,
      questionText: 'What is your name?',
      userScore: 8
    },
    {
      id: 2,
      questionText: 'What is your favorite color?',
      userScore: 5
    },
    {
      id: 3,
      questionText: 'What is your favorite food?',
      userScore: 10
    }
  ]

  test('returns filtered results when search matches question text', () => {
    const filteredResults = getFilteredResultsForSearch(mockResponses, 'favorite')
    expect(filteredResults).toHaveLength(2)
    expect((filteredResults?.[0] as any)?.id).toEqual(2)
  })

  test('returns empty array when search does not match any question text', () => {
    const filteredResults = getFilteredResultsForSearch(mockResponses, 'unknown')
    expect(filteredResults).toHaveLength(0)
  })
})
