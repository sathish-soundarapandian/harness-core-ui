/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useCallback } from 'react'
import { useParams } from 'react-router-dom'

import { Layout, Button, ButtonSize, ButtonVariation, IconProps, StepWizard, StepProps } from '@harness/uicore'
import type { IDialogProps } from '@blueprintjs/core'
import { Dialog, Classes } from '@blueprintjs/core'

import cx from 'classnames'

import { useModalHook } from '@harness/use-modal'
import type { ConnectorInfoDTO } from 'services/cd-ng'

import { useQueryParams } from '@common/hooks'
import type { GitQueryParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'

import { useStrings } from 'framework/strings'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { Connectors, CONNECTOR_CREDENTIALS_STEP_IDENTIFIER } from '@connectors/constants'
import ConnectorDetailsStep from '@connectors/components/CreateConnector/commonSteps/ConnectorDetailsStep'
import GitDetailsStep from '@connectors/components/CreateConnector/commonSteps/GitDetailsStep'
import VerifyOutOfClusterDelegate from '@connectors/common/VerifyOutOfClusterDelegate/VerifyOutOfClusterDelegate'
import StepGitAuthentication from '@connectors/components/CreateConnector/GitConnector/StepAuth/StepGitAuthentication'

import StepGithubAuthentication from '@connectors/components/CreateConnector/GithubConnector/StepAuth/StepGithubAuthentication'
import StepBitbucketAuthentication from '@connectors/components/CreateConnector/BitbucketConnector/StepAuth/StepBitbucketAuthentication'
import StepGitlabAuthentication from '@connectors/components/CreateConnector/GitlabConnector/StepAuth/StepGitlabAuthentication'
// import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'

import DelegateSelectorStep from '@connectors/components/CreateConnector/commonSteps/DelegateSelectorStep/DelegateSelectorStep'
// import type { DeploymentStageElementConfig } from '@pipeline/utils/pipelineTypes'

import {
  buildBitbucketPayload,
  buildGithubPayload,
  buildGitlabPayload,
  buildGitPayload
} from '@connectors/pages/connectors/utils/ConnectorUtils'

import { ConfigFilesWizard } from '../ConfigFilesWizard/ConfigFilesWizard'
import type { ConfigFilesListViewProps, ConfigFileType } from '../ConfigFilesInterface'
import {
  allowedConfigFilesTypes,
  ConfigFileTypeTitle,
  ConfigFileIconByType,
  ConfigFilesToConnectorMap
} from '../ConfigFilesHelper'
import { HarnessConfigStep } from '../ConfigFilesWizard/ConfigFilesSteps/HarnessConfigStep'
import css from '../ConfigFilesSelection.module.scss'

function ConfigFilesListView({
  //   updateStage,
  //   stage,
  //   isPropagating,
  //   connectors,
  //   refetchConnectors,
  listOfConfigFiles,
  deploymentType,
  isReadonly,
  allowableTypes,
  selectedConfig,
  setSelectedConfig
}: //   allowOnlyOne = false
ConfigFilesListViewProps): JSX.Element {
  const DIALOG_PROPS: IDialogProps = {
    isOpen: true,
    usePortal: true,
    autoFocus: true,
    canEscapeKeyClose: false,
    canOutsideClickClose: false,
    enforceFocus: false,
    style: { width: 1175, minHeight: 640, borderLeft: 0, paddingBottom: 0, position: 'relative', overflow: 'hidden' }
  }

  //   const context = usePipelineContext()
  //   const {
  //     state: {
  //       pipeline,
  //       selectionState: { selectedStageId }
  //     },
  //     getStageFromPipeline,
  //     updateStage,
  //     isReadonly,
  //     allowableTypes
  //   } = context

  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const { getString } = useStrings()
  const [newConnectorView, setNewConnectorView] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [configStore, setConfigStore] = useState('')

  const { expressions } = useVariablesExpression()

  const commonProps = {
    name: getString('credentials'),
    onConnectorCreated: () => {
      //
    },
    isEditMode,
    setIsEditMode,
    accountId,
    orgIdentifier,
    projectIdentifier,
    connectorInfo: undefined
  }

  const getLastSteps = useCallback((): Array<React.ReactElement<StepProps<any>>> => {
    const arr: Array<React.ReactElement<StepProps<any>>> = []
    let configDetailStep = null

    switch (true) {
      case configDetailStep === ConfigFilesToConnectorMap.Harness:
        configDetailStep = <HarnessConfigStep stepName="Config Files Details" />
        break
      default:
        configDetailStep = <HarnessConfigStep stepName="Config Files Details" />
        break
    }

    arr.push(configDetailStep)
    return arr
  }, [configStore])

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

  const getNewConnectorSteps = useCallback((): JSX.Element => {
    const buildPayload = getBuildPayload(ConfigFilesToConnectorMap[configStore])
    switch (configStore) {
      case ConfigFilesToConnectorMap.Harness:
        return <HarnessConfigStep stepName="Config Files Details" />
      case ConfigFilesToConnectorMap.Git:
        return (
          <StepWizard title={getString('connectors.createNewConnector')}>
            <ConnectorDetailsStep
              type={ConfigFilesToConnectorMap[configStore]}
              name={getString('overview')}
              isEditMode={isEditMode}
              gitDetails={{ repoIdentifier, branch, getDefaultFromOtherRepo: true }}
            />
            <GitDetailsStep
              type={ConfigFilesToConnectorMap[configStore]}
              name={getString('details')}
              isEditMode={isEditMode}
              connectorInfo={undefined}
            />
            {ConfigFilesToConnectorMap[configStore] === Connectors.GIT ? (
              <StepGitAuthentication {...commonProps} />
            ) : null}
            {ConfigFilesToConnectorMap[configStore] === Connectors.GITHUB ? (
              <StepGithubAuthentication {...commonProps} />
            ) : null}
            {ConfigFilesToConnectorMap[configStore] === Connectors.BITBUCKET ? (
              <StepBitbucketAuthentication {...commonProps} />
            ) : null}
            {ConfigFilesToConnectorMap[configStore] === Connectors.GITLAB ? (
              <StepGitlabAuthentication {...commonProps} identifier={CONNECTOR_CREDENTIALS_STEP_IDENTIFIER} />
            ) : null}
            <DelegateSelectorStep
              name={getString('delegate.DelegateselectionLabel')}
              isEditMode={isEditMode}
              setIsEditMode={setIsEditMode}
              buildPayload={buildPayload}
              connectorInfo={undefined}
            />
            <VerifyOutOfClusterDelegate
              name={getString('connectors.stepThreeName')}
              connectorInfo={undefined}
              isStep={true}
              isLastStep={false}
              type={ConfigFilesToConnectorMap[configStore]}
            />
          </StepWizard>
        )
      default:
        return <></>
    }
  }, [newConnectorView, configStore, isEditMode])

  const handleConnectorViewChange = (isConnectorView: boolean): void => {
    setNewConnectorView(isConnectorView)
    setIsEditMode(false)
  }

  const handleChangeStore = (store: ConfigFileType) => {
    setConfigStore(store || '')
  }

  const getLabels = (): any => {
    return {
      firstStepName: getString('pipeline.manifestType.specifyManifestRepoType'),
      secondStepName: `${getString('common.specify')} ${
        selectedConfig && getString(ConfigFileTypeTitle[selectedConfig])
      } ${getString('store')}`
    }
  }

  const getIconProps = (): IconProps => {
    const iconProps: IconProps = {
      name: ConfigFileIconByType[selectedConfig as ConfigFileType]
    }
    return iconProps
  }

  const [showConnectorModal, hideConnectorModal] = useModalHook(() => {
    const onClose = (): void => {
      setNewConnectorView(false)
      hideConnectorModal()
      setConfigStore('')
      setIsEditMode(false)
      setSelectedConfig('' as ConfigFileType)
    }

    return (
      <Dialog onClose={onClose} {...DIALOG_PROPS} className={cx(css.modal, Classes.DIALOG)}>
        <div className={css.createConnectorWizard}>
          <ConfigFilesWizard
            types={allowedConfigFilesTypes[deploymentType]}
            // types={allowedManifestTypes[deploymentType]}
            // manifestStoreTypes={ManifestTypetoStoreMap[selectedManifest as ManifestTypes]}
            labels={getLabels()}
            newConnectorView={newConnectorView}
            expressions={expressions}
            allowableTypes={allowableTypes}
            handleConnectorViewChange={() => handleConnectorViewChange(true)}
            handleStoreChange={handleChangeStore}
            // initialValues={getInitialValues()}
            newConnectorSteps={getNewConnectorSteps()}
            lastSteps={getLastSteps()}
            deploymentType={deploymentType}
            iconsProps={getIconProps()}
            selectedConfig={selectedConfig}
            changeConfigFileType={setSelectedConfig}
            isReadonly={isReadonly}
          />
        </div>
        <Button minimal icon="cross" onClick={onClose} className={css.crossIcon} />
      </Dialog>
    )
  }, [
    selectedConfig,
    newConnectorView,
    // manifestIndex,
    // manifestStore,
    expressions.length,
    expressions,
    allowableTypes,
    isEditMode
  ])

  const addNewConfigFile = (): void => {
    showConnectorModal()
  }

  return (
    <Layout.Vertical style={{ width: '100%' }}>
      {listOfConfigFiles &&
        listOfConfigFiles.map(configFile => {
          return <div key={configFile}>{configFile}</div>
        })}
      <Layout.Vertical spacing={'medium'} flex={{ alignItems: 'flex-start' }}>
        <Button
          //   className={css.addManifest}
          id="add-config-file"
          size={ButtonSize.SMALL}
          variation={ButtonVariation.LINK}
          data-test-id="addConfigFile"
          onClick={addNewConfigFile}
          //   text={getString('pipelineSteps.serviceTab.configFileList.addConfigFile')}
          text={'+ Add config files'}
        />
      </Layout.Vertical>
    </Layout.Vertical>
  )
}

export default ConfigFilesListView
