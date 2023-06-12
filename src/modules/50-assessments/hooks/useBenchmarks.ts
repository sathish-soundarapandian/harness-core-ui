import type { SelectOption } from '@harness/uicore'
import { BenchmarkDTO, useGetBenchmarksForResultCode } from 'services/assessments'

interface useBenchmarksPayload {
  data: BenchmarkDTO[] | null
  loading: boolean
  benchmarkItems: SelectOption[]
}

const useBenchmarks = (resultCode: string): useBenchmarksPayload => {
  const getBenchmarkItems = (benchmarksData: BenchmarkDTO[] | null): SelectOption[] => {
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

  const { data, loading } = useGetBenchmarksForResultCode({
    resultCode
  })

  const benchmarkItems = getBenchmarkItems(data)

  return { data, loading, benchmarkItems }
}

export default useBenchmarks
