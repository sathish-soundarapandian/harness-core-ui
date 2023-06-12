import { PageError, PageSpinner, useToaster } from '@harness/uicore'
import { Formik } from 'formik'
import React, { useEffect, useMemo, useState } from 'react'
import { get } from 'lodash-es'
import { useHistory, useParams } from 'react-router-dom'
import { useGetAssessmentForUser, useSubmitAssessmentForUser } from 'services/assessments'
import { useStrings } from 'framework/strings'
import { getErrorMessage } from '@auth-settings/utils'
import type { AssessmentsForm } from '../../interfaces/Assessments'
import Questionnaire from './components/Questionnaire/Questionnaire'
import { getInitialUserResponse } from './Assessments.utils'
import QuizSideNav from './components/QuizSideNav/QuizSideNav'
import { buildResponse } from './components/Questionnaire/Questionnarie.utils'

export default function Assessments(): JSX.Element {
  const { getString } = useStrings()
  const { showError, showSuccess } = useToaster()
  const history = useHistory()
  const { inviteCode } = useParams<{ inviteCode: string }>()
  const [sectionId, setSectionId] = useState<string | undefined>()

  const {
    data,
    error: getAssessmentError,
    loading: getAssessmentLoading,
    refetch
  } = useGetAssessmentForUser({
    assessmentInviteId: inviteCode
  })

  const {
    loading: submitAssessmentLoading,
    error: submitAssessmentError,
    mutate: submitAssessment
  } = useSubmitAssessmentForUser({
    assessmentId: data?.assessmentId as string,
    requestOptions: {
      headers: {
        Authorization: inviteCode
      }
    }
  })

  useEffect(() => {
    const resultLink = data?.resultLink
    if (resultLink) {
      history.push(`/assessment/home/${resultLink}`)
    }
  }, [data, history])

  const initialUserResponse = useMemo(() => {
    const { userResponse, sectionQuestions } = data || {}
    return getInitialUserResponse(userResponse, sectionQuestions)
  }, [data])

  async function handleSubmit(formData: AssessmentsForm): Promise<void> {
    const submitAssessmentReqBody = { responses: buildResponse(formData?.userResponse) }
    try {
      const submittedAssessment = await submitAssessment(submitAssessmentReqBody)
      const resultLink = submittedAssessment?.resultLink
      showSuccess(getString('common.dataSubmitSuccess'))
      history.push({ pathname: `/assessment/home/${resultLink}` })
    } catch (errorInfo) {
      showError(getErrorMessage(errorInfo))
    }
  }

  const loading = getAssessmentLoading || submitAssessmentLoading
  const error = getAssessmentError || submitAssessmentError

  return (
    <>
      {loading && <PageSpinner />}
      {!loading && error && (
        <PageError message={get(error?.data as Error, 'message') || error?.message} onClick={() => refetch()} />
      )}
      {!loading && !error && data ? (
        <Formik<AssessmentsForm>
          initialValues={{ userResponse: initialUserResponse }}
          enableReinitialize
          onSubmit={handleSubmit}
        >
          <>
            <Questionnaire
              sectionQuestions={data.sectionQuestions}
              inviteCode={inviteCode}
              sectionId={sectionId}
              setSectionId={setSectionId}
            />
            <QuizSideNav
              expectedCompletionDuration={data?.expectedCompletionDuration || 10}
              sectionQuestions={data.sectionQuestions || {}}
              sectionId={sectionId || ''}
            />
          </>
        </Formik>
      ) : null}
    </>
  )
}
