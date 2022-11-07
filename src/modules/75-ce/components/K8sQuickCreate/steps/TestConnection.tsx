/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import { Button, ButtonVariation, Container, Icon, IconName, Layout, StepProps, Text } from '@harness/uicore'
import { Color, FontVariation, Intent } from '@harness/design-system'
import { useParams } from 'react-router-dom'
import { ProgressBar } from '@blueprintjs/core'
import { get } from 'lodash-es'

import { useStrings } from 'framework/strings'
import { usePolling } from '@common/hooks/usePolling'
import { useDeepCompareEffect } from '@common/hooks'
import { useGetDelegatesHeartbeatDetailsV2 } from 'services/portal'
import {
  ConnectorConfigDTO,
  ResponseConnectorResponse,
  ResponseConnectorValidationResult,
  useCreateConnector,
  useGetTestConnectionResult,
  Error
} from 'services/cd-ng'
import { ErrorHandler } from '@common/components/ErrorHandler/ErrorHandler'
import { DelegateErrorHandler } from './DelegateErrorHandler'

import css from '../K8sQuickCreateModal.module.scss'

enum StepStatus {
  WAIT = 'WAIT',
  PROCESS = 'PROCESS',
  DONE = 'DONE',
  ERROR = 'ERROR'
}

interface StepDetails {
  intent: Intent
  progress: number
  steps: Record<number, StepStatus>
}

const stepIcons: Record<StepStatus, IconName> = {
  WAIT: 'blank',
  PROCESS: 'steps-spinner',
  DONE: 'command-artifact-check',
  ERROR: 'error'
}

const stepIconColor: Record<StepStatus, Color> = {
  PROCESS: Color.PRIMARY_7,
  DONE: Color.GREEN_700,
  ERROR: Color.RED_800,
  WAIT: Color.PRIMARY_7
}

interface TestConnectionProps {
  name: string
  closeModal: () => void
}

const POLL_INTERVAL = 2000

const TIME_OUT = 60

const REPLICAS = 2

const TestConnection: React.FC<TestConnectionProps & StepProps<ConnectorConfigDTO>> = ({
  previousStep,
  prevStepData,
  closeModal
}) => {
  const { getString } = useStrings()
  const { accountId } = useParams<{ accountId: string }>()
  const [counter, setCounter] = useState(0)
  const [error, setError] = useState<ResponseConnectorValidationResult>()
  const [connectorsCreated, setConnectorsCreated] = useState(Boolean(get(prevStepData, 'connectorsCreated')))
  const [connectorCreationError, setConnectorCreationError] = useState<ResponseConnectorResponse>()
  const [delegateError, setDelegateError] = useState(false)
  const [stepDetails, setStepDetails] = useState<StepDetails>({
    intent: Intent.SUCCESS,
    progress: 0,
    steps: {
      1: StepStatus.PROCESS,
      2: StepStatus.PROCESS,
      3: StepStatus.WAIT
    }
  })

  const name = get(prevStepData, 'name')
  const identifier = get(prevStepData, 'identifier')

  const { data: hearBeatData, refetch: verifyHeartBeat } = useGetDelegatesHeartbeatDetailsV2({
    queryParams: { accountId, delegateName: name },
    lazy: true
  })

  const { mutate: testCcmK8sConnector } = useGetTestConnectionResult({
    identifier: `${identifier}Costaccess`,
    queryParams: { accountIdentifier: accountId }
  })

  const updateStepDetails = (updatedStepDetails: Partial<StepDetails>): void =>
    setStepDetails(prevVal => ({
      ...prevVal,
      ...updatedStepDetails,
      steps: {
        ...prevVal.steps,
        ...updatedStepDetails.steps
      }
    }))

  const verifyDelegate = async (): Promise<void> => {
    await verifyHeartBeat()
    setCounter(prevVal => prevVal + 1)

    /* istanbul ignore if */ if (counter >= TIME_OUT) {
      setDelegateError(true)
      updateStepDetails({
        intent: Intent.DANGER,
        progress: 1,
        steps: { 1: StepStatus.ERROR }
      })
    } else if (hearBeatData?.resource?.numberOfConnectedDelegates === REPLICAS) {
      setCounter(0)
      updateStepDetails({
        intent: Intent.SUCCESS,
        progress: 1,
        steps: { 1: StepStatus.DONE, 3: StepStatus.PROCESS }
      })
    }
  }

  usePolling(verifyDelegate, {
    startPolling: counter > 0 && counter <= TIME_OUT,
    pollingInterval: POLL_INTERVAL,
    pollOnInactiveTab: true,
    inactiveTabPollingInterval: POLL_INTERVAL
  })

  const { mutate: createConnector } = useCreateConnector({
    queryParams: {
      accountIdentifier: accountId
    }
  })

  const createConnectors = async (): Promise<void> => {
    try {
      await createConnector({
        connector: {
          identifier: identifier,
          name: name,
          type: 'K8sCluster',
          spec: {
            delegateSelectors: [name],
            credential: {
              type: 'InheritFromDelegate',
              spec: null
            }
          }
        }
      })

      await createConnector({
        connector: {
          identifier: `${identifier}Costaccess`,
          name: name,
          type: 'CEK8sCluster',
          spec: {
            featuresEnabled: ['VISIBILITY'],
            connectorRef: identifier
          }
        }
      })

      setConnectorsCreated(true)

      updateStepDetails({
        progress: stepDetails.progress + 1,
        intent: Intent.SUCCESS,
        steps: { 2: StepStatus.DONE, 3: StepStatus.WAIT }
      })
    } catch (err) {
      setConnectorCreationError(err as ResponseConnectorResponse)
      updateStepDetails({
        progress: stepDetails.progress + 1,
        intent: Intent.DANGER,
        steps: { 2: StepStatus.ERROR, 3: StepStatus.WAIT }
      })
    }
  }

  const verifyCcmK8sConnector = async (): Promise<void> => {
    try {
      const res = await testCcmK8sConnector()

      if (res.data?.status === 'SUCCESS') {
        updateStepDetails({
          intent: Intent.SUCCESS,
          progress: 3,
          steps: { 3: StepStatus.DONE }
        })
      } /* istanbul ignore else */ else {
        setError(res)
        updateStepDetails({
          intent: Intent.DANGER,
          steps: { 3: StepStatus.ERROR }
        })
      }
    } catch (err) {
      setError(err as typeof error)
      updateStepDetails({
        intent: Intent.DANGER,
        steps: { 3: StepStatus.ERROR }
      })
    }
  }

  useEffect(() => {
    verifyDelegate()
    /* istanbul ignore if */ if (connectorsCreated) {
      updateStepDetails({ progress: 1, steps: { 2: StepStatus.DONE } })
    } else {
      createConnectors()
    }
  }, [])

  useDeepCompareEffect(() => {
    if (connectorsCreated && stepDetails.steps[1] === StepStatus.DONE) {
      verifyCcmK8sConnector()
    }
  }, [stepDetails.steps, connectorsCreated])

  const handleRetestConnection =
    /* istanbul ignore next */
    (): void => {
      if (delegateError) {
        setDelegateError(false)
        setCounter(1)
        updateStepDetails({
          intent: Intent.SUCCESS,
          progress: 0,
          steps: { 1: StepStatus.PROCESS, 3: StepStatus.WAIT }
        })
      } else if (connectorCreationError) {
        setConnectorCreationError(undefined)
        updateStepDetails({
          intent: Intent.SUCCESS,
          progress: 0,
          steps: { 2: StepStatus.PROCESS, 3: StepStatus.WAIT }
        })
      } else if (error) {
        setError(undefined)
        updateStepDetails({
          intent: Intent.SUCCESS,
          progress: 2,
          steps: { 3: StepStatus.PROCESS }
        })
      }
    }

  const isConnectorError = error || connectorCreationError
  const isError = delegateError || isConnectorError

  const isEveryStepSuccessful =
    stepDetails.progress === 3 && Object.values(stepDetails.steps).every(status => status === StepStatus.DONE)

  return (
    <>
      <Layout.Vertical height="100%" spacing="xlarge">
        <Text font={{ variation: FontVariation.H3 }}>{getString('ce.k8sQuickCreate.createAndTest')}</Text>
        <ProgressBar
          className={css.progressBar}
          intent={stepDetails.intent}
          stripes={false}
          animate={false}
          value={(stepDetails.progress + 1) / 4}
        />
        <Step
          status={StepStatus.DONE}
          text={getString('ce.k8sQuickCreate.testConnection.step0')}
          successText={getString('ce.k8sQuickCreate.testConnection.createdSuccessfully')}
        />
        <Step
          status={stepDetails.steps[1]}
          text={getString('ce.k8sQuickCreate.testConnection.step1')}
          progressText={getString('ce.k8sQuickCreate.testConnection.step1Desc')}
          successText={getString('ce.k8sQuickCreate.testConnection.installedSuccessfully')}
        />
        <Step
          status={stepDetails.steps[2]}
          text={getString('ce.k8sQuickCreate.testConnection.step2')}
          successText={getString('ce.k8sQuickCreate.testConnection.createdSuccessfully')}
        />
        <Step
          status={stepDetails.steps[3]}
          text={getString('ce.k8sQuickCreate.testConnection.step3')}
          successText={getString('ce.k8sQuickCreate.testConnection.verified')}
        />
        {isEveryStepSuccessful && (
          <Text margin={{ top: 'medium' }} font={{ variation: FontVariation.H6 }} color={Color.GREEN_600}>
            {getString('ce.k8sQuickCreate.testConnection.connectorSuccessful')}
          </Text>
        )}
        {delegateError ? <DelegateErrorHandler /> : null}
        {isConnectorError && (
          <ErrorHandler
            responseMessages={((connectorCreationError?.data || error?.data) as Error)?.responseMessages || []}
            className={css.errorHandler}
          />
        )}
        <Layout.Horizontal spacing="medium" className={css.buttonsCtn}>
          <Button
            icon="chevron-left"
            text={getString('back')}
            variation={ButtonVariation.SECONDARY}
            onClick={/* istanbul ignore next */ () => previousStep?.({ ...prevStepData, connectorsCreated })}
          />
          <Button
            disabled={stepDetails.progress !== 3}
            text={getString('finish')}
            variation={ButtonVariation.PRIMARY}
            onClick={closeModal}
          />
        </Layout.Horizontal>
      </Layout.Vertical>
      {isError ? (
        <Button
          icon="repeat"
          iconProps={{ padding: { right: 'tiny' }, size: 12 }}
          className={css.retestBtn}
          text={getString('ce.k8sQuickCreate.testConnection.retest')}
          variation={ButtonVariation.PRIMARY}
          onClick={handleRetestConnection}
        />
      ) : null}
    </>
  )
}

export default TestConnection

const Step: React.FC<{ status: StepStatus; text: string; progressText?: string; successText?: string }> = ({
  status,
  text,
  progressText,
  successText
}) => {
  const isSuccesfull = status === StepStatus.DONE
  const inProgress = status === StepStatus.PROCESS

  return (
    <div className={css.progressStepCtn}>
      <Icon name={stepIcons[status]} color={stepIconColor[status]} />
      <Container>
        <Text color={Color.GREY_600} font={{ variation: FontVariation.BODY2 }}>
          {`${text} ${isSuccesfull ? successText : ''}`}
        </Text>
        {inProgress && progressText && (
          <Text color={Color.GREY_600} font={{ variation: FontVariation.SMALL }} margin={{ top: 'xsmall' }}>
            {progressText}
          </Text>
        )}
      </Container>
    </div>
  )
}
