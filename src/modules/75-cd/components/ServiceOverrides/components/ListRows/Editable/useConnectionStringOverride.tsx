/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Button, StepWizard, StepProps, AllowedTypes } from '@harness/uicore'
import cx from 'classnames'
import { useModalHook } from '@harness/use-modal'
import { Classes, Dialog, IDialogProps } from '@blueprintjs/core'
import { useStrings } from 'framework/strings'

import type { ConnectionStringsConfiguration, ConnectorConfigDTO, ConnectorInfoDTO } from 'services/cd-ng'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'

import ConnectorDetailsStep from '@connectors/components/CreateConnector/commonSteps/ConnectorDetailsStep'
import { useQueryParams } from '@common/hooks'
import type { GitQueryParams } from '@common/interfaces/RouteInterfaces'
import { Connectors } from '@connectors/constants'
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
import { ApplicationConfigWizard } from '@pipeline/components/ApplicationConfig/ApplicationConfigListView/ApplicationConfigWizard/ApplicationConfigWizard'
import GitDetailsStep from '@connectors/components/CreateConnector/commonSteps/GitDetailsStep'
import ApplicationConfigWizardStepTwo from '@pipeline/components/ApplicationConfig/ApplicationConfigListView/ApplicationConfigWizard/ApplicationConfigWizardStepTwo'
import {
  AllowedTypes as AllowedTypeas,
  ApplicationConfigWizardInitData,
  ConnectorMap,
  ConnectorTypes,
  LastStepProps,
  WizardStepNames
} from '@pipeline/components/ApplicationConfig/ApplicationConfig.types'
import css from '@pipeline/components/ApplicationConfig/ApplicationConfig.module.scss'

export const DIALOG_PROPS: IDialogProps = {
  isOpen: true,
  usePortal: true,
  autoFocus: true,
  canEscapeKeyClose: false,
  canOutsideClickClose: false,
  enforceFocus: false,
  style: { width: 1175, minHeight: 640, borderLeft: 0, paddingBottom: 0, position: 'relative', overflow: 'hidden' }
}

interface ApplicationConfigListViewProps {
  isReadonly: boolean
  allowableTypes: AllowedTypes
  connectionStrings?: ConnectionStringsConfiguration
  handleSubmitConfig?: (config: ConnectionStringsConfiguration) => void
}

export default function useConnectionStringOverride({
  connectionStrings,
  isReadonly,
  allowableTypes,
  handleSubmitConfig
}: ApplicationConfigListViewProps): { showConnectorModal2: any } {
  const { getString } = useStrings()

  const [connectorView, setConnectorView] = useState(false)
  const [connectorType, setConnectorType] = useState('')
  const [isEditMode, setIsEditMode] = useState(false)

  const { accountId, projectIdentifier, orgIdentifier } = useParams<{
    projectIdentifier: string
    orgIdentifier: string
    accountId: string
  }>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const { expressions } = useVariablesExpression()

  const handleSubmit = /* istanbul ignore next */ (item: ConnectionStringsConfiguration): void => {
    handleSubmitConfig?.(item)

    hideConnectorModal()
    setConnectorView(false)
    setConnectorType('')
  }

  const handleConnectorViewChange = /* istanbul ignore next */ (isConnectorView: boolean): void => {
    setConnectorView(isConnectorView)
    setIsEditMode(false)
  }
  const handleStoreChange = /* istanbul ignore next */ (type?: ConnectorTypes): void => {
    setConnectorType(type || '')
  }

  const getLabels = React.useCallback((): WizardStepNames => {
    return {
      wizardName: getString('pipeline.appServiceConfig.connectionStrings.name'),
      firstStepName: getString('pipeline.fileSource'),
      secondStepName: getString('pipeline.fileDetails'),
      firstStepTitle: getString('pipeline.appServiceConfig.connectionStrings.fileSource'),
      firstStepSubtitle: getString('pipeline.appServiceConfig.connectionStrings.subtitle'),
      secondStepTitle: getString('pipeline.appServiceConfig.connectionStrings.fileDetails'),
      pathPlaceholder: getString('pipeline.appServiceConfig.connectionStrings.filePath')
    }
  }, [])

  const getLastStepInitialData = React.useCallback((): ConnectionStringsConfiguration => {
    if (connectionStrings?.store?.type && connectionStrings?.store?.type === connectorType) {
      return { ...connectionStrings }
    }
    return null as unknown as ConnectionStringsConfiguration
  }, [connectionStrings, connectorType])

  const lastStepProps = React.useCallback((): LastStepProps => {
    const labelSecondStepName = getLabels()?.secondStepName
    return {
      key: labelSecondStepName,
      name: labelSecondStepName,
      expressions,
      allowableTypes,
      stepName: labelSecondStepName,
      title: getLabels()?.secondStepTitle,
      initialValues: getLastStepInitialData(),
      handleSubmit: handleSubmit,
      isReadonly: isReadonly,
      pathPlaceholder: getLabels()?.pathPlaceholder
    }
  }, [connectorType])

  /* istanbul ignore next */
  const getBuildPayload = (type: ConnectorInfoDTO['type']) => {
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

  const getLastSteps = React.useCallback((): React.ReactElement<StepProps<ConnectorConfigDTO>> => {
    return <ApplicationConfigWizardStepTwo {...lastStepProps()} />
  }, [connectorType, lastStepProps])

  const getNewConnectorSteps = React.useCallback((): JSX.Element | void => {
    const type = ConnectorMap[connectorType]
    if (type) {
      const buildPayload = getBuildPayload(type)
      return (
        <StepWizard title={getString('connectors.createNewConnector')}>
          <ConnectorDetailsStep
            type={type}
            name={getString('overview')}
            isEditMode={isEditMode}
            gitDetails={{ repoIdentifier, branch, getDefaultFromOtherRepo: true }}
          />
          <GitDetailsStep type={type} name={getString('details')} isEditMode={isEditMode} connectorInfo={undefined} />
          {type === Connectors.GIT ? (
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
          {type === Connectors.GITHUB ? (
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
          {type === Connectors.BITBUCKET ? (
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
          {type === Connectors.GITLAB ? (
            <StepGitlabAuthentication
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
  }, [connectorView, connectorType, isEditMode])

  const getInitialValues = React.useCallback((): ApplicationConfigWizardInitData => {
    /* istanbul ignore else */
    if (connectionStrings) {
      const values = {
        ...connectionStrings,
        selectedStore: connectionStrings?.store?.type,
        connectorRef: connectionStrings?.store?.spec?.connectorRef
      }
      return values
    }
    return {
      selectedStore: '',
      connectorRef: undefined
    }
  }, [])

  const [showConnectorModal2, hideConnectorModal] = useModalHook(() => {
    const onClose = (): void => {
      setConnectorView(false)
      hideConnectorModal()
      setConnectorType('')
      setIsEditMode(false)
    }
    return (
      <Dialog
        {...DIALOG_PROPS}
        isOpen={true}
        isCloseButtonShown
        onClose={onClose}
        className={cx(css.modal, Classes.DIALOG)}
      >
        <div className={css.createConnectorWizard}>
          <ApplicationConfigWizard
            connectorTypes={AllowedTypeas}
            newConnectorView={connectorView}
            expressions={expressions}
            labels={getLabels()}
            allowableTypes={allowableTypes}
            handleConnectorViewChange={handleConnectorViewChange}
            handleStoreChange={handleStoreChange}
            initialValues={getInitialValues()}
            newConnectorSteps={getNewConnectorSteps()}
            lastSteps={getLastSteps()}
            isReadonly={isReadonly}
          />
        </div>
        <Button minimal icon="cross" onClick={onClose} className={css.crossIcon} />
      </Dialog>
    )
  }, [connectorView, connectorType, expressions.length, expressions, allowableTypes, isEditMode])

  return { showConnectorModal2 }
}
