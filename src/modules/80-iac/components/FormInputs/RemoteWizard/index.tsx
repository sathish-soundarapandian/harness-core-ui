/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import cx from 'classnames'
import { useParams } from 'react-router-dom'
import { StepWizard, Dialog, AllowedTypes as MultiTypeAllowedTypes } from '@harness/uicore'
import { Classes } from '@blueprintjs/core'
import { useStrings } from 'framework/strings'
import { useQueryParams } from '@common/hooks'
import type { GitQueryParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'

import ConnectorDetailsStep from '@connectors/components/CreateConnector/commonSteps/ConnectorDetailsStep'
import GitDetailsStep from '@connectors/components/CreateConnector/commonSteps/GitDetailsStep'
import StepGitAuthentication from '@connectors/components/CreateConnector/GitConnector/StepAuth/StepGitAuthentication'
import StepGithubAuthentication from '@connectors/components/CreateConnector/GithubConnector/StepAuth/StepGithubAuthentication'
import StepBitbucketAuthentication from '@connectors/components/CreateConnector/BitbucketConnector/StepAuth/StepBitbucketAuthentication'
import StepGitlabAuthentication from '@connectors/components/CreateConnector/GitlabConnector/StepAuth/StepGitlabAuthentication'
import DelegateSelectorStep from '@connectors/components/CreateConnector/commonSteps/DelegateSelectorStep/DelegateSelectorStep'
import ConnectorTestConnection from '@connectors/common/ConnectorTestConnection/ConnectorTestConnection'
import {
  buildBitbucketPayload,
  buildGithubPayload,
  buildGitlabPayload,
  buildGitPayload
} from '@connectors/pages/connectors/utils/ConnectorUtils'
import { Connectors, CONNECTOR_CREDENTIALS_STEP_IDENTIFIER } from '@connectors/constants'

import WizardStepOne from './StepOne'
import WizardStepTwo from './StepTwo'

import { AllowedTypes, ConnectorMap } from './types'
import styles from './styles.module.scss'

interface WizardStepsProps {
  handleConnectorViewChange: (isConnectorView: boolean) => void
  initialValues: any
  expressions: string[]
  allowableTypes: MultiTypeAllowedTypes
  newConnectorView: boolean
  isReadonly: boolean
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: any) => void
  stepOneName: string
  stepTwoName: string
}

interface StepChangeData<SharedObject> {
  prevStep?: number
  nextStep?: number
  prevStepData: SharedObject
}

const Wizard = ({
  handleConnectorViewChange,
  initialValues,
  expressions,
  allowableTypes,
  newConnectorView,
  isReadonly,
  isOpen,
  onClose,
  onSubmit,
  stepOneName,
  stepTwoName
}: WizardStepsProps): JSX.Element => {
  const { getString } = useStrings()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const [isEditMode, setIsEditMode] = useState(false)
  const [connectorType, setConnectorType] = useState('')
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()

  const handleStoreChange = (type?: string): void => {
    setConnectorType(type || '')
  }

  const onStepChange = (arg: StepChangeData<any>): void => {
    if (arg?.prevStep && arg?.nextStep && arg.prevStep > arg.nextStep && arg.nextStep <= 2) {
      handleConnectorViewChange(false)
    }
  }

  const getBuildPayload = (type: string) => {
    if (type === Connectors.GIT) {
      return buildGitPayload
    }
    if (type === Connectors.GITHUB) {
      return buildGithubPayload
    }
    if (type === Connectors.BITBUCKET) {
      return buildBitbucketPayload
    }
    if (type === Connectors.GITLAB) {
      return buildGitlabPayload
    }
    return () => ({})
  }

  const getNewConnectorSteps = () => {
    const type = ConnectorMap[connectorType]
    if (type) {
      const buildPayload = getBuildPayload(type)
      return (
        <StepWizard title={getString('connectors.createNewConnector')}>
          <ConnectorDetailsStep
            type={type}
            name={getString('overview')}
            gitDetails={{ repoIdentifier, branch, getDefaultFromOtherRepo: true }}
          />
          <GitDetailsStep type={type} name={getString('details')} connectorInfo={undefined} />
          {connectorType === Connectors.GIT ? (
            <StepGitAuthentication
              name={getString('credentials')}
              onConnectorCreated={() => {
                // Handle on success
              }}
              isEditMode={isEditMode}
              setIsEditMode={setIsEditMode}
              connectorInfo={undefined}
              accountId={accountId}
              orgIdentifier={orgIdentifier}
              projectIdentifier={projectIdentifier}
            />
          ) : null}
          {connectorType === Connectors.GITHUB ? (
            <StepGithubAuthentication
              name={getString('credentials')}
              onConnectorCreated={() => {
                // Handle on success
              }}
              isEditMode={isEditMode}
              setIsEditMode={setIsEditMode}
              connectorInfo={undefined}
              accountId={accountId}
              orgIdentifier={orgIdentifier}
              projectIdentifier={projectIdentifier}
            />
          ) : null}
          {connectorType === Connectors.BITBUCKET ? (
            <StepBitbucketAuthentication
              name={getString('credentials')}
              onConnectorCreated={() => {
                // Handle on success
              }}
              isEditMode={isEditMode}
              setIsEditMode={setIsEditMode}
              connectorInfo={undefined}
              accountId={accountId}
              orgIdentifier={orgIdentifier}
              projectIdentifier={projectIdentifier}
            />
          ) : null}
          {connectorType === AllowedTypes[2] ? (
            <StepGitlabAuthentication
              name={getString('credentials')}
              identifier={CONNECTOR_CREDENTIALS_STEP_IDENTIFIER}
              onConnectorCreated={() => {
                // Handle on success
              }}
              isEditMode={isEditMode}
              setIsEditMode={setIsEditMode}
              connectorInfo={undefined}
              accountId={accountId}
              orgIdentifier={orgIdentifier}
              projectIdentifier={projectIdentifier}
            />
          ) : null}
          <DelegateSelectorStep
            name={getString('delegate.DelegateselectionLabel')}
            isEditMode={isEditMode}
            setIsEditMode={setIsEditMode}
            buildPayload={buildPayload}
            connectorInfo={undefined}
          />
          <ConnectorTestConnection
            name={getString('connectors.stepThreeName')}
            connectorInfo={undefined}
            isStep={true}
            isLastStep={false}
            type={type}
          />
        </StepWizard>
      )
    }

    return null
  }

  return (
    <Dialog
      onClose={() => {
        handleConnectorViewChange(false)
        handleStoreChange()
        onClose()
      }}
      isOpen={isOpen}
      className={cx(Classes.DIALOG, styles.closeBtn)}
      usePortal={true}
      enforceFocus={false}
      canEscapeKeyClose={false}
      canOutsideClickClose={false}
      style={{ width: 1175, borderLeft: 0, padding: 0, position: 'relative', overflow: 'hidden' }}
    >
      <StepWizard
        icon={'docs'}
        iconProps={{
          size: 37
        }}
        title={stepOneName}
        className={styles.scriptWizard}
        onStepChange={onStepChange}
      >
        <WizardStepOne
          name={stepOneName}
          stepName={stepOneName}
          key={stepOneName}
          expressions={expressions}
          allowableTypes={allowableTypes}
          isReadonly={isReadonly}
          connectorTypes={AllowedTypes}
          handleConnectorViewChange={() => handleConnectorViewChange(true)}
          handleStoreChange={handleStoreChange}
          initialValues={initialValues}
        />
        {newConnectorView ? getNewConnectorSteps() : null}
        <WizardStepTwo
          key={stepTwoName}
          expressions={expressions}
          allowableTypes={allowableTypes}
          stepName={stepTwoName}
          initialValues={initialValues}
          handleSubmit={onSubmit}
          isReadonly={isReadonly}
          name={stepTwoName}
        />
      </StepWizard>
    </Dialog>
  )
}

export default Wizard
