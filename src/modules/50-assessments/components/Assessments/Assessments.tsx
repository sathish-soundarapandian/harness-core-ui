import {
  Button,
  ButtonVariation,
  Card,
  Container,
  Icon,
  Layout,
  PageError,
  PageSpinner,
  Text,
  useToaster
} from '@harness/uicore'
import { FontVariation, Color } from '@harness/design-system'
import { Formik } from 'formik'
import React, { useEffect, useMemo } from 'react'
import { get } from 'lodash-es'
import { useHistory, useParams } from 'react-router-dom'
import { useGetAssessmentForUser, UserAssessmentDTO, useSubmitAssessmentForUser } from 'services/assessments'
import { useStrings } from 'framework/strings'
import { getErrorMessage } from '@auth-settings/utils'
import type { AssessmentsForm } from '../../interfaces/Assessments'
import Questionnaire from '../Questionnaire/Questionnaire'
import { getInitialUserResponse, getQuestionsAnswered, validateAssessments } from './Assessments.utils'
import TopNav from '../TopNav/TopNav'
import css from './Assessments.module.scss'

export default function Assessments(): JSX.Element {
  const { getString } = useStrings()
  const { showError, showSuccess } = useToaster()
  const history = useHistory()
  const { inviteCode } = useParams<{ inviteCode: string }>() || {}

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
      history.push(`/assessment/results/${resultLink}`)
    }
  }, [data, history])

  const initialUserResponse = useMemo(() => {
    const { userResponse, questions = [] } = data || {}
    return getInitialUserResponse(userResponse, questions)
  }, [data])

  async function handleSubmit(formData: AssessmentsForm): Promise<void> {
    const submitAssessmentReqBody = { responses: formData?.userResponse }
    try {
      const submittedAssessment = await submitAssessment(submitAssessmentReqBody)
      const resultLink = submittedAssessment?.resultLink
      showSuccess(getString('common.dataSubmitSuccess'))
      history.push({ pathname: `/assessment/results/${resultLink}` })
    } catch (errorInfo) {
      showError(getErrorMessage(errorInfo))
    }
  }

  const loading = getAssessmentLoading || submitAssessmentLoading
  const error = getAssessmentError || submitAssessmentError

  return (
    <>
      <TopNav />
      <Layout.Vertical
        flex={{ justifyContent: 'center', alignItems: 'center' }}
        padding={{ top: 'large' }}
        margin={{ bottom: 'xlarge' }}
        className={css.questionnaireContainer}
      >
        {loading && <PageSpinner />}
        {!loading && error && (
          <PageError message={get(error?.data as Error, 'message') || error?.message} onClick={() => refetch()} />
        )}
        {!error && data ? (
          <Formik<AssessmentsForm>
            initialValues={{ userResponse: initialUserResponse }}
            onSubmit={handleSubmit}
            validate={values => validateAssessments(values, getString)}
          >
            {assessmentForm => {
              const questionsAnswered = getQuestionsAnswered(assessmentForm)
              return (
                <>
                  <Layout.Vertical flex={{ alignItems: 'center' }} padding={{ bottom: 'small' }}>
                    <Text
                      padding={{ bottom: 'medium' }}
                      className={css.heading}
                    >{`Questions 1-${data?.questions?.length}`}</Text>
                    <Layout.Horizontal>
                      <Text padding={{ right: 'medium' }}>{`${getString(
                        'assessments.questionsAnswered'
                      )} ${questionsAnswered} / ${data?.questions?.length || 0}`}</Text>
                      <Icon size={16} name={'stopwatch'} />
                      <Text padding={{ left: 'small' }}>{`Estimated time: ${
                        data?.expectedCompletionDuration || 0
                      } min`}</Text>
                    </Layout.Horizontal>
                  </Layout.Vertical>
                  <Card className={css.questionnaire}>
                    <Text font={{ variation: FontVariation.H3 }} color={Color.GREY_900} padding={{ bottom: 'large' }}>
                      {getString('assessments.questions')}
                    </Text>
                    <Questionnaire
                      questions={data?.questions as UserAssessmentDTO['questions']}
                      inviteCode={inviteCode}
                    />
                  </Card>
                  <Container flex className={css.modalFooter}>
                    <Button
                      text={getString('assessments.determineMaturity')}
                      variation={ButtonVariation.PRIMARY}
                      onClick={event => {
                        event.preventDefault()
                        if (assessmentForm) {
                          assessmentForm.submitForm()
                        }
                      }}
                    />
                  </Container>
                </>
              )
            }}
          </Formik>
        ) : null}
      </Layout.Vertical>
    </>
  )
}
