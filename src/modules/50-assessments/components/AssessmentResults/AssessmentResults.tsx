import {
  Button,
  ButtonVariation,
  Card,
  CircularPercentageChart,
  Container,
  Icon,
  Layout,
  MultiSelectOption,
  PageError,
  PageSpinner,
  Text,
  TextInput,
  useToaster,
  MultiSelect,
  ModalDialog
} from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { Link, useParams } from 'react-router-dom'
import HighchartsReact from 'highcharts-react-official'
import Highcharts from 'highcharts'
import { get, isEmpty } from 'lodash-es'
import React, { useCallback, useState } from 'react'
import copy from 'copy-to-clipboard'
import { useStrings } from 'framework/strings'
import { ScoreDTO, useGetAssessmentResults, useSendAssessmentInvite } from 'services/assessments'
import { getErrorMessage } from '@auth-settings/utils'
import { DialogProps, GRID_EFFICIENCY_SCORE, InviteAssessmentModalDialogProps } from './AssessmentResults.constants'
import PercentageCard from '../PercentageCard/PercentageCard'
import SideNav from '../SideNav/SideNav'
import { getScoreComparisonChartOptions } from './AssessmentResults.utils'
import HorizontalLineWithText from '../HorizontalLineWithText/HorizontalLineWithText'
import css from './AssessmentResults.module.scss'

export default function AssessmentResults(): JSX.Element {
  const { getString } = useStrings()
  const { showSuccess, showError } = useToaster()
  const { resultsCode } = useParams<{ resultsCode: string }>()
  const [isShareResultsModalOpen, setIsShareResultsModalOpen] = useState<boolean>(false)
  const [isInviteAssessmentModalOpen, setIsInviteAssessmentModalOpen] = useState<boolean>(false)
  const [invitedUsers, setInvitedUsers] = useState<MultiSelectOption[]>([])

  const {
    data: resultsData,
    error: resultsError,
    loading: resultsLoading,
    refetch
  } = useGetAssessmentResults({
    resultCode: resultsCode
  })
  const {
    best = [],
    worst = [],
    selfScore = {},
    organizationScore = {},
    benchmarkScore = {},
    percentageDiffOrg,
    percentageDiffBenchmark,
    numberOfResponses,
    benchmarkName
  } = resultsData?.scoreOverview || {}
  const { majorVersion, minorVersion, assessmentId } = resultsData || {}
  const { score, maxScore } = selfScore as ScoreDTO
  const { score: orgScore, maxScore: orgMaxScore } = organizationScore as ScoreDTO
  const { score: actualBenchmarkScore, maxScore: benchmarkMaxScore } = benchmarkScore as ScoreDTO
  const isBenchMarkPercentageDiffHigher = (percentageDiffBenchmark || 0) >= 0

  const { mutate: saveAssessment } = useSendAssessmentInvite({})

  const handleShareResultsModalClose = useCallback(() => setIsShareResultsModalOpen(false), [])
  const handleInviteAssessmentModalClose = useCallback(() => setIsInviteAssessmentModalOpen(false), [])

  const handleShareResultsBtnClick = useCallback(
    () => setIsShareResultsModalOpen(!isShareResultsModalOpen),
    [isShareResultsModalOpen]
  )

  const handleInviteAssessmentBtnClick = (): void => setIsInviteAssessmentModalOpen(!isInviteAssessmentModalOpen)
  const copy2Clipboard = (text: string): void => {
    copy(`${text}`) ? showSuccess(getString('clipboardCopySuccess')) : showError(getString('clipboardCopyFail'))
  }

  const handleSendInvite = useCallback(async () => {
    const emails = invitedUsers.map(invitedUser => invitedUser.value as string)
    const saveAssessmentPayload = {
      emails,
      assessmentId: assessmentId as string
    }
    try {
      await saveAssessment(saveAssessmentPayload)
      showSuccess(getString('assessments.invitationSent'))
      setIsInviteAssessmentModalOpen(false)
      setInvitedUsers([])
    } catch (errorInfo) {
      const errors = (errorInfo as any)?.data?.errors
      if (Array.isArray(errors) && errors.length) {
        for (const error of errors) {
          showError(error?.errorMessages[0])
        }
      } else {
        showError(getErrorMessage(errorInfo))
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assessmentId, invitedUsers])

  return (
    <>
      {resultsLoading && <PageSpinner />}
      {!resultsLoading && resultsError && (
        <PageError
          message={get(resultsError?.data as Error, 'message') || resultsError?.message}
          onClick={() => refetch()}
        />
      )}
      {!resultsError && resultsData ? (
        <Container className={css.resultsContainer}>
          <Container className={css.leftNavigation}>
            <SideNav resultCode={resultsCode} majorVersion={majorVersion} minorVersion={minorVersion} />
          </Container>
          <Container className={css.rightNavigation}>
            <Layout.Vertical>
              <Container height={64} className={css.topHeader} flex={{ justifyContent: 'space-between' }}>
                <Text padding={{ left: 'medium' }} className={css.welcomeText}>
                  {'Welcome'}
                </Text>
                <Container>
                  <Button
                    variation={ButtonVariation.SECONDARY}
                    text={getString('assessments.inviteToTakeAssessment')}
                    onClick={handleInviteAssessmentBtnClick}
                    icon={'email-step'}
                    margin={{ right: 'small' }}
                  />
                  <Button
                    variation={ButtonVariation.SECONDARY}
                    text={getString('assessments.shareResults')}
                    onClick={handleShareResultsBtnClick}
                    icon={'share'}
                    margin={{ right: 'small' }}
                  />
                </Container>
              </Container>
              <Layout.Vertical padding={'large'}>
                <Text font={{ weight: 'bold', size: 'medium' }} color={Color.BLACK} padding={{ bottom: 'medium' }}>
                  {'At a Glance'}
                </Text>
                <Layout.Horizontal margin={{ bottom: 'medium' }}>
                  <Card className={css.firstCard}>
                    <Layout.Horizontal>
                      <Layout.Vertical className={css.firstCardSection} padding={{ top: 'large' }}>
                        <Text font={{ size: 'medium', weight: 'semi-bold' }} color={Color.BLACK}>
                          {getString('assessments.maturityScore')}
                        </Text>
                        <Text font={{ size: 'normal' }} padding={{ top: 'small', bottom: 'huge' }}>
                          {getString('assessments.maturityLevelDefinition')}
                        </Text>
                        <Link to={''} target="_blank">
                          <Layout.Horizontal>
                            <Text
                              font={{ variation: FontVariation.SMALL }}
                              color={Color.PRIMARY_7}
                              padding={{ right: 'small' }}
                            >
                              {getString('assessments.learnMoreAboutMaturity')}
                            </Text>
                            <Icon name="main-share" color={Color.PRIMARY_7} height={10} width={10} />
                          </Layout.Horizontal>
                        </Link>
                      </Layout.Vertical>
                      <Layout.Vertical
                        className={css.firstCardSection}
                        flex={{ justifyContent: 'center', alignItems: 'center' }}
                      >
                        <Container margin={{ left: 'large' }}>
                          <CircularPercentageChart
                            size={GRID_EFFICIENCY_SCORE.CRICLE_SIZE}
                            value={score as number}
                            color={Color.BLUE_500}
                            font="large"
                          />
                        </Container>
                        <Text padding={{ left: 'medium', top: 'small' }}>{`out of ${maxScore}`}</Text>
                      </Layout.Vertical>
                    </Layout.Horizontal>
                  </Card>
                  <Card className={css.secondCard}>
                    <Layout.Horizontal flex={{ justifyContent: 'space-around' }}>
                      <Layout.Vertical className={css.secondCardLeftSection}>
                        <Text font={{ size: 'medium', weight: 'semi-bold' }} color={Color.BLACK}>
                          {'How does your score compare?'}
                        </Text>
                        <Text font={{ size: 'normal' }} padding={{ top: 'small', bottom: 'huge' }}>
                          {getString('assessments.typicalComparison')}
                        </Text>
                        <Link to={''} target="_blank">
                          <Layout.Horizontal>
                            <Text
                              font={{ variation: FontVariation.SMALL }}
                              color={Color.PRIMARY_7}
                              padding={{ right: 'small' }}
                            >
                              {getString('assessments.learnHowWeCompare')}
                            </Text>
                            <Icon name="main-share" color={Color.PRIMARY_7} height={10} width={10} />
                          </Layout.Horizontal>
                        </Link>
                      </Layout.Vertical>
                      <PercentageCard
                        title={getString('assessments.inYourCompany').toLocaleUpperCase()}
                        percentage={percentageDiffOrg}
                        textLineOne={getString('assessments.companyOverAllScore')}
                        textLineTwo={`Score ${orgScore}/${orgMaxScore} (Based on ${numberOfResponses} survey)`}
                      />
                      {percentageDiffBenchmark ? (
                        <PercentageCard
                          title={getString('assessments.benchmark').toLocaleUpperCase()}
                          percentage={Math.abs(percentageDiffBenchmark)}
                          percentageTitle={isBenchMarkPercentageDiffHigher ? 'Higher' : 'Lower'}
                          textLineOne={benchmarkName as string}
                          textLineTwo={`Score ${actualBenchmarkScore}/${benchmarkMaxScore}`}
                        />
                      ) : null}
                    </Layout.Horizontal>
                  </Card>
                </Layout.Horizontal>
                <Card className={css.firstContentCard}>
                  <Text className={css.detailsCardContentHeading}>{'Where you performed best'}</Text>
                  <Text className={css.detailsCardContentSubHeading} padding={{ bottom: 'small' }}>
                    {getString('assessments.basedOnResultsHarnessRecommendations')}
                  </Text>
                  <Container className={css.recommendationsContainer}>
                    {best.length
                      ? best.map(el => {
                          const {
                            userScore,
                            organizationScore: questionOrgScore,
                            benchmarkScore: questionBenchMarkScore,
                            maxScore: questionMaxScore
                          } = el
                          return (
                            <>
                              <Card className={css.recommendationsCardContainer}>
                                <Text className={css.detailsCardQuestionName}>{el?.questionText}</Text>
                                <Layout.Horizontal>
                                  <Layout.Vertical padding={{ top: 'xlarge' }} width={120}>
                                    <Text className={css.scoreLabels}>{getString('assessments.yourScore')}</Text>
                                    <Text className={css.scoreLabels}> {getString('assessments.companyScore')}</Text>
                                    <Text className={css.scoreLabels}>{getString('assessments.maxScore')}</Text>
                                    {!isEmpty(benchmarkScore) ? (
                                      <Text className={css.scoreLabels}>{getString('assessments.benchmark')}</Text>
                                    ) : null}
                                  </Layout.Vertical>
                                  <HighchartsReact
                                    highcharts={Highcharts}
                                    options={getScoreComparisonChartOptions({
                                      userScore,
                                      questionOrgScore,
                                      questionBenchMarkScore,
                                      questionMaxScore
                                    })}
                                  />
                                </Layout.Horizontal>
                              </Card>
                            </>
                          )
                        })
                      : null}
                  </Container>
                </Card>
                <Card className={css.secondContentCard}>
                  <Text className={css.detailsCardContentHeading}>{'Your Top Opportunities'}</Text>
                  <Text className={css.detailsCardContentSubHeading} padding={{ bottom: 'small' }}>
                    {getString('assessments.basedOnResultsHarnessRecommendations')}
                  </Text>
                  <Container className={css.recommendationsContainer}>
                    {worst.length
                      ? worst.map(
                          (el: {
                            questionText?: string
                            userScore?: number
                            organizationScore?: number
                            benchmarkScore?: number
                            maxScore?: number
                          }) => {
                            const {
                              userScore,
                              organizationScore: questionOrgScore,
                              benchmarkScore: questionBenchMarkScore,
                              maxScore: questionMaxScore
                            } = el
                            return (
                              <>
                                <Card className={css.recommendationsCardContainer}>
                                  <Text className={css.detailsCardQuestionName}>{el?.questionText}</Text>
                                  <Layout.Horizontal>
                                    <Layout.Vertical padding={{ top: 'xlarge' }} width={120}>
                                      <Text className={css.scoreLabels}>{getString('assessments.yourScore')}</Text>
                                      <Text className={css.scoreLabels}>{getString('assessments.companyScore')}</Text>
                                      <Text className={css.scoreLabels}>{getString('assessments.maxScore')}</Text>
                                      {!isEmpty(benchmarkScore) ? (
                                        <Text className={css.scoreLabels}>{getString('assessments.benchmark')}</Text>
                                      ) : null}
                                    </Layout.Vertical>
                                    <HighchartsReact
                                      highcharts={Highcharts}
                                      options={getScoreComparisonChartOptions({
                                        userScore,
                                        questionOrgScore,
                                        questionBenchMarkScore,
                                        questionMaxScore
                                      })}
                                    />
                                  </Layout.Horizontal>
                                </Card>
                              </>
                            )
                          }
                        )
                      : null}
                  </Container>
                </Card>
              </Layout.Vertical>
            </Layout.Vertical>
          </Container>
          <ModalDialog
            {...DialogProps}
            isOpen={isShareResultsModalOpen}
            onClose={handleShareResultsModalClose}
            title={getString('assessments.shareResults')}
          >
            <Layout.Horizontal flex={{ justifyContent: 'space-between' }}>
              <TextInput value={window.location.href} className={css.fieldInput} />
              <Button
                variation={ButtonVariation.SECONDARY}
                text={getString('assessments.copyLink')}
                onClick={() => copy2Clipboard(window.location.href)}
                margin={{ right: 'small' }}
              />
            </Layout.Horizontal>
            <Container padding={{ top: 'small' }}>
              <HorizontalLineWithText text={'OR'} />
            </Container>
            <Layout.Horizontal flex={{ justifyContent: 'space-between' }}>
              <Text padding={{ top: 'large', bottom: 'xxxlarge' }} margin={{ top: 'small' }}>
                {getString('assessments.downloadPDFReport')}
              </Text>
              <Button
                variation={ButtonVariation.SECONDARY}
                text={getString('assessments.downloadPDF')}
                margin={{ right: 'small' }}
                icon={'download'}
                disabled
              />
            </Layout.Horizontal>
          </ModalDialog>
          <ModalDialog
            {...InviteAssessmentModalDialogProps}
            isOpen={isInviteAssessmentModalOpen}
            onClose={handleInviteAssessmentModalClose}
            title={getString('assessments.inviteToTakeAssessment')}
          >
            <Layout.Horizontal flex={{ justifyContent: 'space-between' }} padding={{ bottom: 'xlarge' }}>
              <MultiSelect
                value={invitedUsers}
                items={invitedUsers}
                className={css.fieldInput}
                placeholder={getString('assessments.enterEmailAddress')}
                onChange={(item: React.SetStateAction<MultiSelectOption[]>) => {
                  setInvitedUsers(item)
                }}
              />
              <Button
                variation={ButtonVariation.SECONDARY}
                text={getString('assessments.sendInvite')}
                onClick={handleSendInvite}
                margin={{ right: 'small' }}
              />
            </Layout.Horizontal>
          </ModalDialog>
        </Container>
      ) : null}
    </>
  )
}
