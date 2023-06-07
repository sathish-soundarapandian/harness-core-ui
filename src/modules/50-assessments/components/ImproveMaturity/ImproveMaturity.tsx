import React, { useEffect, useMemo, useState } from 'react'
import { Button, ButtonVariation, Container, PageError, PageSpinner, SelectOption, useToaster } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { useParams } from 'react-router-dom'
import { cloneDeep, get, isEqual } from 'lodash-es'
import { useStrings } from 'framework/strings'
import {
  ImprovedMaturityDTO,
  QuestionMaturity,
  useGetImproveMaturityState,
  useSaveImprovedMaturity
} from 'services/assessments'
import { useDeepCompareEffect } from '@common/hooks'
import { getErrorMessage } from '@auth-settings/utils'
import ContentContainer from '../ContentContainer/ContentContainer'
import MaturityScore from './components/MaturityScore/MaturityScore'
import CapabilitiesContainer from './components/CapabilitiesContainer/CapabilitiesContainer'
import { getImprovedScore, updateQuestionsOnQuestionID, updateQuestionsOnSectionId } from './ImproveMaturity.utils'
import GroupByHarness from './components/GroupByHarness/GroupByHarness'
import css from './ImproveMaturity.module.scss'

const ImproveMaturity = (): JSX.Element => {
  const [values, setValues] = useState<ImprovedMaturityDTO | null>()
  const [benchmark, setBenchmark] = useState<SelectOption>()
  const [groupByHarness, setGroupByHarness] = useState<boolean>(false)
  const { getString } = useStrings()
  const { resultsCode } = useParams<{ resultsCode: string }>()
  const [improvementScore, setImprovementScore] = useState<number>(0)
  const { showError } = useToaster()

  const { data, error, loading, refetch } = useGetImproveMaturityState({
    resultCode: resultsCode
  })
  const tableData = useMemo(() => {
    if (!values || !values.questionLevelMaturityList) return []
    return values.questionLevelMaturityList.filter(
      (questionMaturity: QuestionMaturity) => !!questionMaturity.recommendation
    )
  }, [values])

  const { mutate: saveImprovedMaturity } = useSaveImprovedMaturity({
    requestOptions: {
      headers: {
        Authorization: resultsCode
      }
    }
  })

  async function updateImprovedMaturity(updatedData: ImprovedMaturityDTO): Promise<void> {
    try {
      await saveImprovedMaturity(updatedData)
    } catch (errorInfo) {
      showError(getErrorMessage(errorInfo))
    }
  }

  useEffect(() => {
    if (!isEqual(data, values)) {
      setValues(data)
    }
  }, [data])

  useDeepCompareEffect(() => {
    if (values) {
      updateImprovedMaturity(values)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values])

  const onSelectionChange = (questionId: string, sectionId: string, selectedValue: boolean): void => {
    if (!values?.questionLevelMaturityList) return
    setValues({
      ...values,
      questionLevelMaturityList: updateQuestionsOnQuestionID(
        values.questionLevelMaturityList,
        questionId,
        sectionId,
        selectedValue
      )
    })
  }

  const groupSelection = (isSelected: boolean, sectionId?: string | undefined): void => {
    if (!values?.questionLevelMaturityList) return

    setValues({
      ...values,
      questionLevelMaturityList: updateQuestionsOnSectionId(values.questionLevelMaturityList, isSelected, sectionId)
    })
  }

  const selectOnHarnessModule = (harnessModules: string[]): void => {
    const clonedData: QuestionMaturity[] = cloneDeep(values?.questionLevelMaturityList || [])
    if (harnessModules?.length) {
      clonedData.forEach((question: QuestionMaturity) => {
        question.selected = harnessModules.includes(question.recommendation?.harnessModule || '')
      })
    } else {
      clonedData.forEach((question: QuestionMaturity) => (question.selected = false))
    }
    setValues({
      ...values,
      questionLevelMaturityList: clonedData
    })
  }

  useEffect(() => {
    const improvedValue = getImprovedScore(tableData)
    setImprovementScore(improvedValue)
  }, [tableData])

  const headerBackButton = useMemo(() => {
    if (groupByHarness) {
      return (
        <Button
          text={getString('assessments.backToImproveMaturity')}
          icon="chevron-left"
          variation={ButtonVariation.LINK}
          onClick={() => setGroupByHarness(false)}
        />
      )
    }
    return <></>
  }, [getString, groupByHarness])

  if (loading) return <PageSpinner />
  if (error)
    return <PageError message={get(error?.data as Error, 'message') || error?.message} onClick={() => refetch()} />
  return (
    <ContentContainer
      assessmentId={'DEVOPSTest15'}
      title={groupByHarness ? getString('assessments.howHarnessCanHelp') : getString('assessments.improveMaturity')}
      backButton={headerBackButton}
    >
      <Container className={css.improveMaturityContainer}>
        <MaturityScore improvementScore={improvementScore} benchmarkId={benchmark?.value?.toString() || ''} />
        <Container background={Color.PRIMARY_BG} className={css.container}>
          {data &&
            (groupByHarness ? (
              <GroupByHarness questionMaturityList={tableData} onModulesSelectionChange={selectOnHarnessModule} />
            ) : (
              <CapabilitiesContainer
                questionMaturityList={tableData}
                onSelectionChange={onSelectionChange}
                groupSelection={groupSelection}
                benchmark={benchmark}
                setBenchMark={setBenchmark}
                groupByHarness={() => setGroupByHarness(true)}
                resultCode={resultsCode}
              />
            ))}
        </Container>
      </Container>
    </ContentContainer>
  )
}

export default ImproveMaturity
