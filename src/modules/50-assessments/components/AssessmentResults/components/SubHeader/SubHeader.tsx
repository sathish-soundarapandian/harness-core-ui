import React, { useEffect } from 'react'
import { ExpandingSearchInput, Layout, MultiSelectDropDown, Select, SelectOption } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import useBenchmarks from '@assessments/hooks/useBenchmarks'
import { LEVEL_FILTER_OPTIONS } from './SubHeader.constants'
import css from './SubHeader.module.scss'

interface SubHeaderProps {
  resultCode: string
  level: SelectOption[]
  benchmark: SelectOption | undefined
  setLevel: (level: SelectOption[]) => void
  setBenchMark: (benchMark: SelectOption) => void
  search: string
  setSearch: (search: string) => void
}

const SubHeader = ({
  level,
  benchmark,
  setLevel,
  setBenchMark,
  search,
  setSearch,
  resultCode
}: SubHeaderProps): JSX.Element => {
  const { getString } = useStrings()
  const { data: benchmarkData, loading, benchmarkItems } = useBenchmarks(resultCode)

  useEffect(() => {
    if (Array.isArray(benchmarkData) && benchmarkData.length) {
      const selectedBenchmark = benchmarkData.find(item => item.isDefault)
      if (selectedBenchmark) {
        setBenchMark({
          value: selectedBenchmark.benchmarkId,
          label: selectedBenchmark.benchmarkName
        })
      }
    }
  }, [benchmarkData, setBenchMark])

  return (
    <Layout.Horizontal className={css.subHeader}>
      <Layout.Horizontal>
        <Select
          items={benchmarkItems}
          value={benchmark}
          disabled={loading}
          inputProps={{
            placeholder: loading ? getString('loading') : getString('assessments.benchmarkComparison')
          }}
          onChange={setBenchMark}
          className={css.benchmarkDropdown}
        />
        <MultiSelectDropDown
          items={LEVEL_FILTER_OPTIONS}
          value={level}
          placeholder={getString('assessments.level')}
          onChange={setLevel}
          className={css.scoreDropdown}
        />
      </Layout.Horizontal>
      <ExpandingSearchInput
        width={250}
        defaultValue={search as string}
        key={search}
        onChange={setSearch}
        autoFocus={false}
        placeholder={getString('assessments.searchForCategory')}
        className={css.searchInput}
      />
    </Layout.Horizontal>
  )
}

export default SubHeader
