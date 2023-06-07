import { Container, Layout, PageSpinner, useToaster } from '@harness/uicore'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useFormikContext } from 'formik'
import { QuestionResponse, UserAssessmentDTO, useSaveAssessmentResponse } from 'services/assessments'
import { useDeepCompareEffect } from '@common/hooks'
import { getErrorMessage } from '@auth-settings/utils'
import type { AssessmentsForm, SectionDetails } from '@assessments/interfaces/Assessments'
import Question from '../Question/Question'
import QuestionTopNav from '../QuestionTopNav/QuestionTopNav'
import FooterNav from '../FooterNav/FooterNav'
import { buildResponse, getFirstUnansweredQn, getNextQuestion, getPreviousQn } from './Questionnarie.utils'

interface QuestionnaireProps {
  sectionQuestions: UserAssessmentDTO['sectionQuestions'] | undefined
  inviteCode: string
  sectionId?: string
  setSectionId: (sectionId: string) => void
}

export default function Questionnaire(props: QuestionnaireProps): JSX.Element {
  const { sectionQuestions, inviteCode, sectionId, setSectionId } = props
  const { setFieldValue, values } = useFormikContext<AssessmentsForm>()
  const [questionId, setQuestionId] = useState<string>('')
  const [sectionDetails, setsectionDetails] = useState<SectionDetails | undefined>()
  const [question, setQuestion] = useState<QuestionResponse | undefined>()
  const [prevQn, setPrevQn] = useState<{ sectionId: string; questionId: string }>({
    sectionId: '',
    questionId: ''
  })
  const [nextQn, setNextQn] = useState<{ sectionId: string; questionId: string }>({
    sectionId: '',
    questionId: ''
  })
  const { showError } = useToaster()

  useEffect(() => {
    if (!questionId) {
      const sectQuest = getFirstUnansweredQn(sectionQuestions, values)
      setQuestionId(sectQuest.questionId)
      setSectionId(sectQuest.sectionId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const { mutate: saveAssessment } = useSaveAssessmentResponse({
    requestOptions: {
      headers: {
        Authorization: inviteCode
      }
    }
  })

  async function handleSubmit(formData: AssessmentsForm): Promise<void> {
    const saveAssessmentReqBody = { responses: buildResponse(formData?.userResponse) }
    try {
      await saveAssessment(saveAssessmentReqBody)
    } catch (errorInfo) {
      showError(getErrorMessage(errorInfo))
    }
  }

  useDeepCompareEffect(() => {
    if (values) {
      handleSubmit(values)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values])

  useEffect(() => {
    if (!sectionQuestions || !sectionId) return
    const section = sectionQuestions[sectionId]
    const quest = section[0]
    setsectionDetails({
      id: sectionId,
      name: quest.sectionName || '',
      questionIds: section.map(q => q.questionId || '')
    })
  }, [sectionQuestions, sectionId])

  useEffect(() => {
    if (!sectionQuestions || !sectionId) return
    const section = sectionQuestions[sectionId]
    const quest = section.find(q => q.questionId === questionId)
    setQuestion(quest)
  }, [questionId, sectionId, sectionQuestions])

  const onAnswerSelected = useCallback(
    (optionId: string | undefined) => {
      optionId && setFieldValue(`userResponse.${sectionId}.${questionId}.0`, optionId)
      const nextQuestion = getNextQuestion(sectionQuestions, sectionId, questionId)
      if (nextQuestion.questionId !== questionId) {
        setQuestionId(nextQuestion.questionId)
      }
      if (nextQuestion.sectionId !== sectionId) {
        setSectionId(nextQuestion.sectionId)
      }
    },
    [setFieldValue, sectionId, questionId, sectionQuestions, setSectionId]
  )

  const sectionValues = useMemo(() => (sectionId ? values.userResponse[sectionId] : {}), [values, sectionId])
  const selectedValues = useMemo(
    () => (sectionValues && questionId ? sectionValues[questionId] || [] : []),
    [sectionValues, questionId]
  )

  useEffect(() => {
    const prev = getPreviousQn(sectionQuestions, sectionId, questionId)
    const next = getNextQuestion(sectionQuestions, sectionId, questionId)
    setPrevQn(prev)
    setNextQn(next)
  }, [questionId, sectionId, sectionQuestions])

  const previousClick = useCallback(() => {
    if (prevQn.sectionId !== sectionId) {
      setSectionId(prevQn.sectionId)
    }
    setQuestionId(prevQn.questionId)
  }, [prevQn, sectionId, setSectionId])

  const forwardClick = useCallback(() => {
    if (nextQn.sectionId !== sectionId) {
      setSectionId(nextQn.sectionId)
    }
    setQuestionId(nextQn.questionId)
  }, [nextQn, sectionId, setSectionId])

  if (!sectionQuestions || !question) return <PageSpinner />
  const { questionNumber, questionText, possibleResponses } = question

  return (
    <Layout.Vertical>
      <QuestionTopNav section={sectionDetails} currentId={questionId} />
      <Container padding={{ bottom: 'xxxlarge' }} key={questionNumber} margin="xxlarge">
        <Question
          questionNumber={questionNumber}
          questionText={questionText}
          possibleResponses={possibleResponses}
          questionId={questionId}
          onAnswerSelected={onAnswerSelected}
          selectedValues={selectedValues}
        />
      </Container>
      <FooterNav
        disablePrevious={!prevQn.questionId}
        disableForward={selectedValues.length === 0}
        previousClick={previousClick}
        forwardClick={forwardClick}
      />
    </Layout.Vertical>
  )
}
