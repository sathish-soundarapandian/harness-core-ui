import { Checkbox, Container, TableV2 } from '@harness/uicore'
import { Color } from '@harness/design-system'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import type { CellProps, Column, Renderer } from 'react-table'
import type { QuestionMaturity } from 'services/assessments'
import { useDeepCompareEffect } from '@common/hooks'
import { killEvent } from '@common/utils/eventUtils'
import { getHarnessComponents, ModuleCount, RecommendationCell, ToggleAccordionCell } from './GroupByHarness.utils'
import FlatRecommendationTable from '../FlatRecommendationTable/FlatRecommendationTable'
import css from './GroupByHarness.module.scss'

interface GroupByHarnessProps {
  questionMaturityList: QuestionMaturity[]
  onModulesSelectionChange: (harnessModules: string[]) => void
}

const GroupByHarness = ({ questionMaturityList, onModulesSelectionChange }: GroupByHarnessProps): JSX.Element => {
  const [selectedModules, setSelectedModules] = useState<string[]>([])

  useEffect(() => {
    const moduleList = questionMaturityList
      .reduce((acc: string[], questionMaturity: QuestionMaturity) => {
        if (
          questionMaturity.recommendation?.harnessModule &&
          !acc.includes(questionMaturity.recommendation.harnessModule)
        ) {
          acc.push(questionMaturity.recommendation.harnessModule)
        }
        return acc
      }, [])
      .filter(item => !!item)
    setSelectedModules(moduleList)
  }, [])

  useDeepCompareEffect(() => {
    if (selectedModules.length) {
      onModulesSelectionChange(selectedModules)
    }
  }, [selectedModules])

  const renderRowSubComponent = useCallback(
    ({ row }) => {
      const { module } = row.original
      const questions = questionMaturityList.filter(
        (question: QuestionMaturity) => question.recommendation?.harnessModule === module
      )

      return (
        <Container background={Color.PRIMARY_BG} padding="large">
          <FlatRecommendationTable questionMaturityList={questions} harnessComponent={module} />
        </Container>
      )
    },
    [questionMaturityList]
  )
  const CheckboxCell: Renderer<CellProps<ModuleCount>> = useCallback(
    ({ row }) => {
      const isSelected = selectedModules.includes(row.original?.module)
      return (
        <Checkbox
          checked={isSelected}
          className={css.noPadding}
          data-testid="row-checkbox"
          onClick={e => {
            killEvent(e)
            if (isSelected) {
              setSelectedModules(selectedModules.filter(module => module !== row.original?.module))
            } else {
              setSelectedModules([...selectedModules, row.original?.module])
            }
          }}
        />
      )
    },
    [selectedModules]
  )

  const columns: Column<ModuleCount>[] = useMemo(
    () => [
      {
        Header: '',
        id: 'rowSelect',
        disableSortBy: true,
        width: '2%',
        Cell: CheckboxCell
      },
      {
        Header: '',
        id: 'rowExpandCollapse',
        disableSortBy: true,
        width: '35%',
        Cell: ToggleAccordionCell
      },
      {
        Header: '',
        id: 'rowRecommendation',
        width: '20%',
        Cell: RecommendationCell
      }
    ],
    [CheckboxCell]
  )

  const data = useMemo(() => getHarnessComponents(questionMaturityList), [questionMaturityList])

  const expanded = useMemo(
    () =>
      data.reduce((acc: Record<number, boolean>, currentValue: ModuleCount, currentIndex: number) => {
        if (selectedModules.includes(currentValue.module)) {
          acc = {
            ...acc,
            [currentIndex]: true
          }
        }
        return acc
      }, {}),
    [data, selectedModules]
  )

  return (
    <Container padding={{ left: 'large', right: 'large' }}>
      <TableV2
        columns={columns}
        initialState={{ expanded }}
        data={data}
        renderRowSubComponent={renderRowSubComponent}
      />
    </Container>
  )
}

export default GroupByHarness
