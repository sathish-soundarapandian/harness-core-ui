/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { Layout, Button, Text, ButtonVariation, StepProps, StepsProgress } from '@wings-software/uicore'
import { Intent, FontVariation } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import { ResponseMessage, useGetTestConnectionResult } from 'services/cd-ng'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { ErrorHandler } from '@common/components/ErrorHandler/ErrorHandler'

import css from '../CreatePdcConnector.module.scss'

interface TestConnectionProps {
  name: string
  isStep: boolean
  isLastStep: boolean
  type: string
  previousStep: () => void
  stepIndex: number
  identifier: string
  sshKeyRef: string
  hosts: string
}

interface WizardProps {
  onClose: () => void
}

enum Status {
  PROCESS = 'PROCESS',
  DONE = 'DONE',
  ERROR = 'ERROR'
}

const TestConnection: React.FC<StepProps<TestConnectionProps> & WizardProps> = props => {
  const { getString } = useStrings()

  const { prevStepData, gotoStep } = props
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const [currentStatus, setCurrentStatus] = useState<Status>(Status.PROCESS)
  const [currentIntent, setCurrentIntent] = useState<Intent>(Intent.NONE)
  const [currentStep, setCurrentStep] = useState<number>(1)
  const [errors, setErrors] = useState<ResponseMessage[] | null>(null)

  const steps: string[] = useMemo(() => [getString('connectors.pdc.testConnection.step1')], [])

  const { mutate: testConnection } = useGetTestConnectionResult({
    identifier: prevStepData?.identifier || '',
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    },
    requestOptions: {
      headers: {
        'content-type': 'application/json'
      }
    }
  })

  const verifyTestConnection = useCallback(async (): Promise<void> => {
    try {
      setCurrentStatus(Status.PROCESS)
      const result = await testConnection()

      if (result.data?.status === 'SUCCESS') {
        setCurrentIntent(Intent.SUCCESS)
        setCurrentStatus(Status.DONE)
        setCurrentStep(2)
      } else {
        setCurrentStatus(Status.ERROR)
        setCurrentIntent(Intent.DANGER)
        setErrors(
          result?.data?.errors?.map(error => ({
            level: 'ERROR',
            message: `${error.reason}. ${error.message}`
          })) as ResponseMessage[]
        )
      }
    } catch (e) {
      setErrors(e.data?.responseMessages)
      setCurrentStatus(Status.ERROR)
      setCurrentIntent(Intent.DANGER)
    }
  }, [])

  useEffect(() => {
    verifyTestConnection()
  }, [verifyTestConnection])

  return (
    <Layout.Vertical spacing="medium" height="100%">
      <Layout.Vertical spacing="medium" className={css.testConnectionContentContainer}>
        <Text font={{ variation: FontVariation.H3 }} tooltipProps={{ dataTooltipId: 'pdcTextConnection' }}>
          {getString('common.smtp.testConnection')}
        </Text>
        <StepsProgress steps={steps} intent={currentIntent} current={currentStep} currentStatus={currentStatus} />
        {errors && (
          <div>
            <ErrorHandler responseMessages={errors} className={css.errorPanel} />
            <Button
              text={getString('connectors.pdc.editHosts')}
              variation={ButtonVariation.SECONDARY}
              className={css.gotoHostsBtn}
              onClick={() => {
                gotoStep?.({
                  stepNumber: 2,
                  prevStepData
                })
              }}
              withoutBoxShadow
            />
          </div>
        )}
      </Layout.Vertical>
      <Layout.Horizontal padding={{ top: 'small' }} spacing="medium">
        <Button type="submit" onClick={props.onClose} variation={ButtonVariation.PRIMARY} text={getString('finish')} />
      </Layout.Horizontal>
    </Layout.Vertical>
  )
}

export default TestConnection
