import { Container, TableV2 } from '@harness/uicore'
import { Color } from '@harness/design-system'
import React, { useCallback, useMemo } from 'react'
import type { QuestionMaturity } from 'services/assessments'
import FlatRecommendationTable from '../FlatRecommendationTable/FlatRecommendationTable'
import { getSections, RenderSection, ToggleAccordionCell } from './GroupRecommendationTable.utils'

const GroupRecommendationTable = ({
  questionMaturityList,
  onSelectionChange,
  groupSelection
}: {
  questionMaturityList: QuestionMaturity[]
  onSelectionChange: (questionId: string, sectionId: string, value: boolean) => void
  groupSelection: (value: boolean, sectionId?: string) => void
}): JSX.Element => {
  const renderRowSubComponent = useCallback(
    ({ row }) => {
      const { sectionId } = row.original
      const questions = questionMaturityList.filter((question: QuestionMaturity) => question.sectionId === sectionId)

      return (
        <Container background={Color.GREY_50}>
          <FlatRecommendationTable
            questionMaturityList={questions}
            onSelectionChange={onSelectionChange}
            groupSelection={groupSelection}
            sectionId={sectionId}
          />
        </Container>
      )
    },
    [groupSelection, onSelectionChange, questionMaturityList]
  )

  const data = useMemo(() => getSections(questionMaturityList), [])

  return (
    <TableV2
      data={data}
      columns={[
        {
          Header: '',
          id: 'rowSelect',
          Cell: ToggleAccordionCell,
          disableSortBy: true,
          width: '2%'
        },
        {
          Header: '',
          id: 'category',
          Cell: RenderSection,
          disableSortBy: true,
          width: '90%'
        }
      ]}
      renderRowSubComponent={renderRowSubComponent}
    />
  )
}

export default GroupRecommendationTable
