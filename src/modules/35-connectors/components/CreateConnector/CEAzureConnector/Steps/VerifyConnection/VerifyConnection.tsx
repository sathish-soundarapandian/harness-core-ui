/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Button, Layout, StepProps, StepsProgress, Heading } from '@harness/uicore'
import { Intent } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import type { ConnectorConfigDTO } from 'services/cd-ng'
import { useGetTestConnectionResult } from 'services/cd-ng'
import { CCM_CONNECTOR_SAVE_EVENT, CE_AZURE_CONNECTOR_CREATION_EVENTS } from '@connectors/trackingConstants'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { useStepLoadTelemetry } from '@connectors/common/useTrackStepLoad/useStepLoadTelemetry'
import { Connectors } from '@connectors/constants'
import ShowConnectorError from '../ShowConnectorError'
import type { CEAzureDTO } from '../Overview/AzureConnectorOverview'
import css from '../../CreateCeAzureConnector_new.module.scss'

enum Status {
  PROCESS = 'PROCESS',
  DONE = 'DONE',
  ERROR = 'ERROR'
}

interface Error {
  title: string
  reason: string
}

export interface TestConnectionProps extends ConnectorConfigDTO {
  onClose?: () => void
}

const TestConnection: React.FC<StepProps<CEAzureDTO> & TestConnectionProps> = props => {
  const { prevStepData } = props
  const { accountId } = useParams<{ accountId: string }>()
  const { trackEvent } = useTelemetry()

  useStepLoadTelemetry(CE_AZURE_CONNECTOR_CREATION_EVENTS.LOAD_CONNECTION_TEST)

  const [error, setError] = useState<Error>()
  const [currentStatus, setCurrentStatus] = useState<Status>(Status.ERROR)
  const [currentIntent, setCurrentIntent] = useState<Intent>(Intent.NONE)
  const [currentStep, setCurrentStep] = useState<number>(1)

  const { getString } = useStrings()
  const steps: string[] = [
    getString('connectors.ceAzure.testConnection.validatePermission'),
    getString('connectors.ceAzure.testConnection.verifyExport')
  ]

  const { mutate: testConnection } = useGetTestConnectionResult({
    identifier: prevStepData?.identifier || '',
    queryParams: { accountIdentifier: accountId },
    requestOptions: {
      headers: { 'content-type': 'application/json' }
    }
  })

  const verifyOptimizationPermissions = async (): Promise<void> => {
    try {
      setCurrentStatus(Status.PROCESS)
      const { data } = await testConnection()
      if (data?.status !== 'SUCCESS') {
        const err: Error = {
          title: 'Connector authentication failed',
          reason: data?.errors?.[0].message || 'Something went wrong'
        }

        setError(err)
        throw new Error(err.title)
      }

      setCurrentIntent(Intent.SUCCESS)
      setCurrentStatus(Status.DONE)
      setCurrentStep(2)
    } catch (e) {
      setCurrentStatus(Status.ERROR)
      setCurrentIntent(Intent.DANGER)
    }
  }
  useEffect(() => {
    verifyOptimizationPermissions()
  }, [])

  return (
    <Layout.Vertical className={css.stepContainer} spacing="medium">
      <Heading level={2} className={css.header}>
        {getString('connectors.ceAzure.testConnection.heading')}
      </Heading>
      <StepsProgress steps={steps} intent={currentIntent} current={currentStep} currentStatus={currentStatus} />
      {error && <ShowConnectorError title={error.title} reason={error.reason} />}
      <Button
        intent="primary"
        text={getString('finish')}
        rightIcon="chevron-right"
        className={css.continueAndPreviousBtns}
        onClick={() => {
          trackEvent(CCM_CONNECTOR_SAVE_EVENT, { type: Connectors.CE_AZURE })
          props.onClose?.()
        }}
      />
    </Layout.Vertical>
  )
}

export default TestConnection
