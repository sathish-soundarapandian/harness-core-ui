import {
  Button,
  ButtonVariation,
  Checkbox,
  Container,
  ExpandingSearchInput,
  Layout,
  Select,
  SelectOption
} from '@harness/uicore'
import { Color } from '@harness/design-system'
import React, { useEffect, useState } from 'react'
import { useStrings } from 'framework/strings'
import type { QuestionMaturity } from 'services/assessments'
import ImprovemenIdeaImage from '@assessments/assets/ImprovemenIdea.svg'
import useBenchmarks from '@assessments/hooks/useBenchmarks'
import FlatRecommendationTable from '../FlatRecommendationTable/FlatRecommendationTable'
import GroupRecommendationTable from '../GroupRecommendationTable/GroupRecommendationTable'
import css from './CapabilitiesContainer.module.scss'

interface CapabilitiesContainerProps {
  questionMaturityList: QuestionMaturity[]
  onSelectionChange: (questionId: string, sectionId: string, value: boolean) => void
  groupSelection: (value: boolean, sectionId?: string) => void
  benchmark: SelectOption | undefined
  setBenchMark: (benchMark: SelectOption) => void
  resultCode: string
}

const CapabilitiesContainer = ({
  questionMaturityList,
  onSelectionChange,
  groupSelection,
  benchmark,
  setBenchMark,
  resultCode
}: CapabilitiesContainerProps): JSX.Element => {
  const [search, setSearch] = useState<string>()
  const [groupByCategory, setGroupByCategory] = useState<boolean>(false)
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
    <Container className={css.capabilitiesContainer}>
      <Layout.Horizontal className={css.subHeader}>
        <Layout.Horizontal>
          <Select
            items={benchmarkItems}
            className={css.selectSdlc}
            value={benchmark}
            loadingItems={loading}
            inputProps={{
              placeholder: loading ? getString('loading') : getString('assessments.benchmark')
            }}
            onChange={setBenchMark}
          />
          <div className={css.groupByCheckbox}>
            <Checkbox
              checked={groupByCategory}
              onChange={() => setGroupByCategory(!groupByCategory)}
              data-testid="groupByCheckbox"
            >
              {getString('assessments.groupBySDLC')}
            </Checkbox>
          </div>
        </Layout.Horizontal>
        <ExpandingSearchInput
          width={250}
          defaultValue={search as string}
          key={search}
          onChange={setSearch}
          autoFocus={false}
        />
      </Layout.Horizontal>
      <Layout.Horizontal className={css.infoDisplay} margin="large" background={Color.PRIMARY_1}>
        <img src={ImprovemenIdeaImage} width="32" height="40" alt="" />
        <Button variation={ButtonVariation.LINK}>{getString('assessments.howHarnessCanHelp')}</Button>
      </Layout.Horizontal>
      <Container margin="large">
        {groupByCategory ? (
          <GroupRecommendationTable
            questionMaturityList={questionMaturityList}
            onSelectionChange={onSelectionChange}
            groupSelection={groupSelection}
          />
        ) : (
          <FlatRecommendationTable
            questionMaturityList={questionMaturityList}
            onSelectionChange={onSelectionChange}
            groupSelection={groupSelection}
          />
        )}
      </Container>
    </Container>
  )
}

export default CapabilitiesContainer
