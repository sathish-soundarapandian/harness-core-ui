/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useState } from 'react'
import { useParams } from 'react-router-dom'
import { defaultTo, get, noop } from 'lodash-es'
import cx from 'classnames'
import { Dialog, IDialogProps, Classes } from '@blueprintjs/core'
import { AllowedTypes, Button, IconProps, StepProps, StepWizard } from '@harness/uicore'

import type { ConnectorConfigDTO, ManifestConfig, ManifestConfigWrapper, StoreConfigWrapper } from 'services/cd-ng'
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
import { Connectors, CONNECTOR_CREDENTIALS_STEP_IDENTIFIER } from '@connectors/constants'
import ConnectorTestConnection from '@connectors/common/ConnectorTestConnection/ConnectorTestConnection'
import { ManifestWizard } from '@pipeline/components/ManifestSelection/ManifestWizard/ManifestWizard'
import {
  getBuildPayload,
  ManifestDataType,
  ManifestStoreMap,
  ManifestToConnectorMap,
  manifestTypeIcons,
  manifestTypeLabels,
  ManifestTypetoStoreMap
} from '@pipeline/components/ManifestSelection/Manifesthelper'
import type { ConnectorRefLabelType } from '@pipeline/components/ArtifactsSelection/ArtifactInterface'
import HarnessFileStore from '@pipeline/components/ManifestSelection/ManifestWizardSteps/HarnessFileStore/HarnessFileStore'
import { CommonManifestDetails } from '@pipeline/components/ManifestSelection/ManifestWizardSteps/CommonManifestDetails/CommonManifestDetails'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import type {
  ManifestStepInitData,
  ManifestTypes,
  ManifestLastStepProps,
  ManifestStores
} from '@pipeline/components/ManifestSelection/ManifestInterface'
import css from './TaskDefinitionModal.module.scss'

const DIALOG_PROPS: IDialogProps = {
  isOpen: true,
  usePortal: true,
  autoFocus: true,
  canEscapeKeyClose: false,
  canOutsideClickClose: false,
  enforceFocus: false,
  style: { width: 1175, minHeight: 640, borderLeft: 0, paddingBottom: 0, position: 'relative', overflow: 'hidden' }
}

interface TaskDefinitionModalProps {
  initialValues?: StoreConfigWrapper
  selectedManifest: ManifestTypes
  allowableTypes: AllowedTypes
  readonly?: boolean
  onTaskDefinitionModalClose: () => void
  connectorView: boolean
  updateManifestList: (obj: ManifestConfigWrapper) => void
  setConnectorView: (connectorView: boolean) => void
  isOpen: boolean
  availableManifestTypes: ManifestTypes[]
}

export const TaskDefinitionModal = (props: TaskDefinitionModalProps): React.ReactElement => {
  const {
    selectedManifest,
    initialValues,
    allowableTypes,
    readonly = false,
    onTaskDefinitionModalClose,
    connectorView,
    updateManifestList,
    setConnectorView,
    isOpen,
    availableManifestTypes
  } = props

  const [store, setStore] = useState('')
  const [isEditMode, setIsEditMode] = useState(false)

  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()

  const getLabels = (): ConnectorRefLabelType => {
    return {
      firstStepName: getString('pipeline.manifestType.specifyManifestRepoType'),
      secondStepName: `${getString('common.specify')} ${getString(manifestTypeLabels[selectedManifest])} ${getString(
        'store'
      )}`
    }
  }

  const getIconProps = (): IconProps => {
    const iconProps: IconProps = {
      name: manifestTypeIcons[selectedManifest]
    }
    return iconProps
  }

  const getLastStepInitialData = useCallback((): ManifestConfig => {
    if (initialValues) {
      return {
        identifier: '',
        type: selectedManifest as ManifestTypes,
        spec: {
          store: {
            ...initialValues
          }
        }
      }
    }
    return { identifier: '', type: selectedManifest as ManifestTypes, spec: {} }
  }, [initialValues, selectedManifest])

  const handleSubmit = (manifestObj: ManifestConfigWrapper): void => {
    updateManifestList(manifestObj)
    setStore('')
  }

  const lastStepProps = useCallback((): ManifestLastStepProps => {
    return {
      key: getString('pipeline.manifestType.manifestDetails'),
      name: getString('pipeline.manifestType.manifestDetails'),
      expressions,
      allowableTypes,
      stepName: getString('pipeline.manifestType.manifestDetails'),
      initialValues: getLastStepInitialData(),
      handleSubmit: handleSubmit,
      selectedManifest: selectedManifest,
      manifestIdsList: [''],
      isReadonly: readonly,
      showIdentifierField: false
    }
  }, [getLastStepInitialData, readonly, allowableTypes, expressions, selectedManifest])

  const getLastSteps = useCallback((): Array<React.ReactElement<StepProps<ConnectorConfigDTO>>> => {
    const arr: Array<React.ReactElement<StepProps<ConnectorConfigDTO>>> = []
    let manifestDetailStep = null
    switch (true) {
      case store === ManifestStoreMap.Harness:
        manifestDetailStep = <HarnessFileStore {...lastStepProps()} />
        break
      default:
        manifestDetailStep = <CommonManifestDetails {...lastStepProps()} />
        break
    }
    arr.push(manifestDetailStep)
    return arr
  }, [store, lastStepProps])

  const handleConnectorViewChange = (isConnectorView: boolean): void => {
    setConnectorView(isConnectorView)
  }

  const handleStoreChange = (manifestStore?: ManifestStores): void => {
    setStore(defaultTo(manifestStore, ''))
  }

  const getInitialValues = (): ManifestStepInitData => {
    const initValues = get(initialValues, 'spec', null)
    if (initValues) {
      const values = {
        ...initValues,
        store: defaultTo(initialValues?.type, ''),
        connectorRef: initValues.connectorRef,
        selectedManifest: ManifestDataType.EcsTaskDefinition
      }
      return values
    }
    return {
      store,
      connectorRef: undefined,
      selectedManifest: ManifestDataType.EcsTaskDefinition
    }
  }

  const connectorDetailStepProps = {
    type: ManifestToConnectorMap[store],
    name: getString('overview'),
    isEditMode,
    gitDetails: { repoIdentifier, branch, getDefaultFromOtherRepo: true }
  }
  const delegateSelectorStepProps = {
    name: getString('delegate.DelegateselectionLabel'),
    isEditMode,
    setIsEditMode,
    connectorInfo: undefined
  }
  const ConnectorTestConnectionProps = {
    name: getString('connectors.stepThreeName'),
    connectorInfo: undefined,
    isStep: true,
    isLastStep: false,
    type: ManifestToConnectorMap[store]
  }
  const gitTypeStoreAuthenticationProps = {
    name: getString('credentials'),
    isEditMode,
    setIsEditMode,
    accountId,
    orgIdentifier,
    projectIdentifier,
    connectorInfo: undefined,
    onConnectorCreated: noop
  }
  const authenticationStepProps = {
    ...gitTypeStoreAuthenticationProps,
    identifier: CONNECTOR_CREDENTIALS_STEP_IDENTIFIER
  }

  const getNewConnectorSteps = useCallback((): JSX.Element => {
    const buildPayload = getBuildPayload(ManifestToConnectorMap[store])

    return (
      <StepWizard title={getString('connectors.createNewConnector')}>
        <ConnectorDetailsStep {...connectorDetailStepProps} />
        <GitDetailsStep
          type={ManifestToConnectorMap[store]}
          name={getString('details')}
          isEditMode={isEditMode}
          connectorInfo={undefined}
        />
        {ManifestToConnectorMap[store] === Connectors.GIT ? (
          <StepGitAuthentication {...gitTypeStoreAuthenticationProps} />
        ) : null}
        {ManifestToConnectorMap[store] === Connectors.GITHUB ? (
          <StepGithubAuthentication {...gitTypeStoreAuthenticationProps} />
        ) : null}
        {ManifestToConnectorMap[store] === Connectors.BITBUCKET ? (
          <StepBitbucketAuthentication {...gitTypeStoreAuthenticationProps} />
        ) : null}
        {ManifestToConnectorMap[store] === Connectors.GITLAB ? (
          <StepGitlabAuthentication {...authenticationStepProps} />
        ) : null}
        <DelegateSelectorStep {...delegateSelectorStepProps} buildPayload={buildPayload} />
        <ConnectorTestConnection {...ConnectorTestConnectionProps} />
      </StepWizard>
    )

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectorView, store, isEditMode])

  return (
    <Dialog
      onClose={onTaskDefinitionModalClose}
      {...DIALOG_PROPS}
      className={cx(css.modal, Classes.DIALOG)}
      isOpen={isOpen}
    >
      <div className={css.createConnectorWizard}>
        <ManifestWizard
          types={availableManifestTypes}
          manifestStoreTypes={ManifestTypetoStoreMap[selectedManifest]}
          labels={getLabels()}
          selectedManifest={selectedManifest}
          newConnectorView={connectorView}
          expressions={expressions}
          allowableTypes={allowableTypes}
          changeManifestType={noop}
          handleConnectorViewChange={handleConnectorViewChange}
          handleStoreChange={handleStoreChange}
          initialValues={getInitialValues()}
          newConnectorSteps={getNewConnectorSteps()}
          lastSteps={getLastSteps()}
          iconsProps={getIconProps()}
          isReadonly={readonly}
        />
      </div>
      <Button minimal icon="cross" onClick={onTaskDefinitionModalClose} className={css.crossIcon} />
    </Dialog>
  )
}
