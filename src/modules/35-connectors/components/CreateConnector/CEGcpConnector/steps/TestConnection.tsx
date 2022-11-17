/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import {
  Button,
  Layout,
  StepProps,
  StepsProgress,
  Heading,
  ModalErrorHandler,
  ModalErrorHandlerBinding
} from '@harness/uicore'
import { Intent } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import type { ConnectorInfoDTO } from 'services/cd-ng'
import { useGetTestConnectionResult } from 'services/cd-ng'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { CCM_CONNECTOR_SAVE_EVENT, CE_GCP_CONNECTOR_CREATION_EVENTS } from '@connectors/trackingConstants'
import { useStepLoadTelemetry } from '@connectors/common/useTrackStepLoad/useStepLoadTelemetry'
import { Connectors } from '@connectors/constants'
import css from '../CreateCeGcpConnector.module.scss'

enum Status {
  PROCESS = 'PROCESS',
  DONE = 'DONE',
  ERROR = 'ERROR'
}

interface TestConnectionProps extends StepProps<ConnectorInfoDTO> {
  onClose?: () => void
}

const TestConnection: React.FC<TestConnectionProps> = props => {
  const { getString } = useStrings()
  const { trackEvent } = useTelemetry()

  useStepLoadTelemetry(CE_GCP_CONNECTOR_CREATION_EVENTS.LOAD_CONNECTION_TEST)

  const { prevStepData } = props
  const { accountId } = useParams<{
    accountId: string
  }>()
  const [currentStatus, setCurrentStatus] = useState<Status>(Status.ERROR)
  const [currentIntent, setCurrentIntent] = useState<Intent>(Intent.NONE)
  const [currentStep, setCurrentStep] = useState<number>(1)
  const [modalErrorHandler, setModalErrorHandler] = useState<ModalErrorHandlerBinding | undefined>()

  const steps: string[] = [getString('connectors.ceGcp.testConnection.step1')]

  const { mutate: testConnection } = useGetTestConnectionResult({
    identifier: prevStepData?.identifier || '',
    queryParams: {
      accountIdentifier: accountId
    },
    requestOptions: {
      headers: {
        'content-type': 'application/json'
      }
    }
  })

  const verifyTestConnection = async (): Promise<void> => {
    try {
      setCurrentStatus(Status.PROCESS)
      const result = await testConnection()
      if (result.data?.status === 'SUCCESS') {
        setCurrentIntent(Intent.SUCCESS)
        setCurrentStatus(Status.DONE)
        setCurrentStep(3)
      } else {
        throw new Error('Could not verify connectivity')
      }
    } catch (e) {
      modalErrorHandler?.showDanger(e.data?.message)
      setCurrentStatus(Status.ERROR)
      setCurrentIntent(Intent.DANGER)
    }
  }
  useEffect(() => {
    verifyTestConnection()
  }, [])

  return (
    <Layout.Vertical className={css.stepContainer}>
      <ModalErrorHandler bind={setModalErrorHandler} />
      <Heading level={2} className={css.header}>
        {getString('connectors.ceGcp.testConnection.heading')}
      </Heading>
      <StepsProgress steps={steps} intent={currentIntent} current={currentStep} currentStatus={currentStatus} />
      <Button
        type="submit"
        intent="primary"
        text={getString('finish')}
        className={css.submitBtn}
        onClick={() => {
          trackEvent(CCM_CONNECTOR_SAVE_EVENT, { type: Connectors.CE_GCP })
          props.onClose?.()
        }}
      />
    </Layout.Vertical>
  )
}

export default TestConnection
