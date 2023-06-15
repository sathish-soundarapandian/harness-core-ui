import React, { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { Container, Tab, Tabs } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { PolicyEvaluationContent } from '@pipeline/components/execution/StepDetails/common/ExecutionContent/PolicyEvaluationContent/PolicyEvaluationContent'
import type { StepDetailProps } from '@pipeline/factories/ExecutionFactory/types'
import { useGetVerificationOverviewForVerifyStepExecutionId } from 'services/cv'
import { ExecutionVerificationSummary } from '../ExecutionVerificationSummary/ExecutionVerificationSummary'
import type { VerifyExecutionProps } from '../ExecutionVerificationSummary/ExecutionVerificationSummary.types'
import { getActivityId } from '../../ExecutionVerificationView.utils'
import style from './ExecutionVerificationStepShortView.module.scss'

enum StepDetailTab {
  STEP_DETAILS = 'STEP_DETAILS',
  POLICY_ENFORCEMENT = 'POLICY_ENFORCEMENT'
}

const ExecutionVerificationStepShortView = (props: VerifyExecutionProps & StepDetailProps): JSX.Element => {
  const { step, executionMetadata } = props
  const { getString } = useStrings()

  const { accountId: accountIdentifier, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()

  const activityId = useMemo(() => getActivityId(step), [step])

  const {
    data: overviewData,
    error: overviewError,
    refetch
  } = useGetVerificationOverviewForVerifyStepExecutionId({
    accountIdentifier,
    orgIdentifier,
    projectIdentifier,
    verifyStepExecutionId: activityId,
    lazy: true
  })

  const shouldShowPolicyEnforcement = !!step?.outcomes?.policyOutput?.policySetDetails

  return (
    <Container className={style.tabs}>
      <Tabs id="step-details" renderAllTabPanels={false}>
        {
          <Tab
            id={StepDetailTab.STEP_DETAILS}
            title={getString('details')}
            panel={
              <ExecutionVerificationSummary
                {...props}
                overviewData={overviewData}
                overviewError={overviewError}
                refetchOverview={refetch}
              />
            }
          />
        }

        {shouldShowPolicyEnforcement ? (
          <Tab
            id={StepDetailTab.POLICY_ENFORCEMENT}
            title={getString('pipeline.policyEnforcement.title')}
            panel={
              <Container margin={{ top: 'medium' }}>
                <PolicyEvaluationContent
                  step={step}
                  executionMetadata={executionMetadata}
                  policySetOutputPath={'outcomes.policyOutput'}
                />
              </Container>
            }
          />
        ) : null}
      </Tabs>
    </Container>
  )
}

export default ExecutionVerificationStepShortView
