/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect } from 'react'
import { StepWizard, Container, StepProps } from '@wings-software/uicore'
import {
  CONNECTOR_CREDENTIALS_STEP_IDENTIFIER,
  CreateConnectorModalProps,
  TESTCONNECTION_STEP_INDEX
} from '@connectors/constants'
import { useStrings } from 'framework/strings'
import type { ConnectorInfoDTO, ConnectorConfigDTO } from 'services/cd-ng'
import ConnectorTestConnection from '@connectors/common/ConnectorTestConnection/ConnectorTestConnection'
import { getConnectorIconByType, getConnectorIconPropsByType } from '@connectors/pages/connectors/utils/ConnectorHelper'
import ConnectorDetailsStep from '../commonSteps/ConnectorDetailsStep'
import DelegateSelectorStep, { DelegateSelectorProps } from '../commonSteps/DelegateSelectorStep/DelegateSelectorStep'
import type { ConnectionConfigProps } from './constants'

export interface CVConnectorHOCInput {
  connectorType: ConnectorInfoDTO['type']
  ConnectorCredentialsStep?: (props: ConnectionConfigProps) => JSX.Element
  buildSubmissionPayload: DelegateSelectorProps['buildPayload']
  nestedStep?: (props: ConnectionConfigProps) => JSX.Element[]
}

function PlaceholderStepComponent(props: StepProps<ConnectorConfigDTO>): JSX.Element {
  const { nextStep, prevStepData } = props
  useEffect(() => {
    nextStep?.(prevStepData)
  }, [])
  return <Container />
}

export function cvConnectorHOC(hocInput: CVConnectorHOCInput): (props: CreateConnectorModalProps) => JSX.Element {
  const { ConnectorCredentialsStep, buildSubmissionPayload, connectorType, nestedStep } = hocInput
  const ConnectorComponent = (props: CreateConnectorModalProps): JSX.Element => {
    const {
      isEditMode,
      connectorInfo,
      onClose,
      onSuccess,
      setIsEditMode,
      accountId,
      orgIdentifier,
      projectIdentifier
    } = props
    const { getString } = useStrings()
    const els = nestedStep
      ? nestedStep({
          isEditMode,
          connectorInfo,
          accountId,
          orgIdentifier,
          projectIdentifier
        }).map(step => React.cloneElement(step))
      : null

    return (
      <StepWizard icon={getConnectorIconByType(connectorType)} iconProps={getConnectorIconPropsByType(connectorType)}>
        <ConnectorDetailsStep
          type={connectorType}
          name={getString('overview')}
          isEditMode={isEditMode}
          connectorInfo={connectorInfo}
          gitDetails={props.gitDetails}
        />
        {ConnectorCredentialsStep ? (
          <ConnectorCredentialsStep
            isEditMode={isEditMode}
            accountId={accountId}
            identifier={CONNECTOR_CREDENTIALS_STEP_IDENTIFIER}
            name={getString('credentials')}
            projectIdentifier={projectIdentifier}
            orgIdentifier={orgIdentifier}
            connectorInfo={connectorInfo}
          />
        ) : null}
        {els ? <PlaceholderStepComponent name={getString('details')} /> : null}
        {els ? <StepWizard>{els}</StepWizard> : null}
        <DelegateSelectorStep
          name={getString('delegate.DelegateselectionLabel')}
          hideModal={onClose}
          onConnectorCreated={onSuccess}
          connectorInfo={connectorInfo}
          isEditMode={isEditMode}
          setIsEditMode={setIsEditMode}
          buildPayload={buildSubmissionPayload}
        />
        <ConnectorTestConnection
          name={`${getString('verify')} ${getString('connection')}`}
          connectorInfo={props.connectorInfo}
          onClose={onClose}
          isStep
          isLastStep
          type={connectorType}
          stepIndex={TESTCONNECTION_STEP_INDEX}
        />
      </StepWizard>
    )
  }

  return ConnectorComponent
}
