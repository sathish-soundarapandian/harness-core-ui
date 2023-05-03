import type { SelectOption } from '@harness/uicore'
import type { AssessmentResultsResponse, BenchmarkDTO, UserResponsesResponse } from 'services/assessments'

export function getBenchMarkItems(benchmarksData: BenchmarkDTO[] | null): SelectOption[] {
  let benchmarkResponses: SelectOption[] = []
  if (Array.isArray(benchmarksData) && benchmarksData.length) {
    benchmarkResponses = benchmarksData.map(el => {
      const { benchmarkName, benchmarkId } = el || {}
      return {
        label: benchmarkName,
        value: benchmarkId
      }
    })
  }
  return benchmarkResponses
}

export function getDefaultBenchMark(benchmarksData: BenchmarkDTO[]): SelectOption {
  const defaultSelectedBenchmark = benchmarksData.find(el => el.isDefault === true)
  const { benchmarkName = '', benchmarkId = '' } = defaultSelectedBenchmark || {}
  const defaultBenchMark = {
    label: benchmarkName,
    value: benchmarkId
  }
  return defaultBenchMark
}

export function getFilteredResponsesForRange(
  filteredResults: UserResponsesResponse[] | undefined,
  responses: UserResponsesResponse[] | undefined,
  range: number[]
): UserResponsesResponse[] {
  filteredResults =
    responses?.filter(currentResponse => {
      const { userScore } = currentResponse
      return (userScore || userScore === 0) && range[0] <= userScore && userScore <= range[1]
    }) || []
  return filteredResults
}

export function getFilteredResultsForScore(
  selectedScore: SelectOption | null,
  responses: UserResponsesResponse[]
): AssessmentResultsResponse['responses'] {
  let filteredResults: AssessmentResultsResponse['responses'] = []
  if (selectedScore?.value)
    switch (selectedScore.value) {
      case '0_3':
        filteredResults = getFilteredResponsesForRange(filteredResults, responses, [0, 3])
        break
      case '4_7':
        filteredResults = getFilteredResponsesForRange(filteredResults, responses, [4, 7])
        break
      case '8_10':
        filteredResults = getFilteredResponsesForRange(filteredResults, responses, [8, 10])
        break
      case 'all':
        filteredResults = getFilteredResponsesForRange(filteredResults, responses, [0, 10])
        break
    }
  return filteredResults
}

export function getFilteredResultsForSearch(
  responses: UserResponsesResponse[],
  search: string | null
): AssessmentResultsResponse['responses'] {
  let filteredResults: AssessmentResultsResponse['responses'] = []
  filteredResults = responses.filter(response =>
    response?.questionText?.toLocaleLowerCase()?.includes(search?.toLocaleLowerCase() as string)
  )
  return filteredResults
}
