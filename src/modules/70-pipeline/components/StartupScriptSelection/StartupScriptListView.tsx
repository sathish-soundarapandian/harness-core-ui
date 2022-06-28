/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useState } from 'react'
import {
  Layout,
  Text,
  StepWizard,
  StepProps,
  Button,
  ButtonSize,
  ButtonVariation,
  MultiTypeInputType,
  Icon
} from '@harness/uicore'
import { useModalHook } from '@harness/use-modal'
import { FontVariation, Color } from '@harness/design-system'
import { useParams } from 'react-router-dom'
import cx from 'classnames'
import { Dialog, IDialogProps, Classes } from '@blueprintjs/core'
import { isEmpty, set } from 'lodash-es'

import produce from 'immer'
import { useStrings } from 'framework/strings'

import ConnectorDetailsStep from '@connectors/components/CreateConnector/commonSteps/ConnectorDetailsStep'
import GitDetailsStep from '@connectors/components/CreateConnector/commonSteps/GitDetailsStep'
import VerifyOutOfClusterDelegate from '@connectors/common/VerifyOutOfClusterDelegate/VerifyOutOfClusterDelegate'
import StepGitAuthentication from '@connectors/components/CreateConnector/GitConnector/StepAuth/StepGitAuthentication'
import type {
  ConnectorConfigDTO,
  ConnectorInfoDTO,
  PageConnectorResponse,
  PipelineInfoConfig,
  StageElementConfig
} from 'services/cd-ng'
import StepGithubAuthentication from '@connectors/components/CreateConnector/GithubConnector/StepAuth/StepGithubAuthentication'
import StepBitbucketAuthentication from '@connectors/components/CreateConnector/BitbucketConnector/StepAuth/StepBitbucketAuthentication'
import StepGitlabAuthentication from '@connectors/components/CreateConnector/GitlabConnector/StepAuth/StepGitlabAuthentication'
import { Connectors, CONNECTOR_CREDENTIALS_STEP_IDENTIFIER } from '@connectors/constants'
import {
  buildBitbucketPayload,
  buildGithubPayload,
  buildGitlabPayload,
  buildGitPayload
} from '@connectors/pages/connectors/utils/ConnectorUtils'
import DelegateSelectorStep from '@connectors/components/CreateConnector/commonSteps/DelegateSelectorStep/DelegateSelectorStep'

import type { GitQueryParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useQueryParams } from '@common/hooks'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { ManifestActions } from '@common/constants/TrackingConstants'

import type { StageElementWrapper } from '@pipeline/utils/pipelineTypes'
import { getStatus, getConnectorNameFromValue } from '../PipelineStudio/StageBuilder/StageBuilderUtil'
import { useVariablesExpression } from '../PipelineStudio/PiplineHooks/useVariablesExpression'
import ConnectorField from './StartupScriptConnectorField'
import StartupScriptWizardStepTwo from './StartupScriptWizardStepTwo'
import { ConnectorMap, AllowedTypes, ConnectorTypes, ConnectorIcons } from './StartupScriptInterface.types'
import { StartupScriptWizard } from './StartupScriptWizard'
import type { ConnectorSelectedValue } from '@connectors/components/ConnectorReferenceField/ConnectorReferenceField'

import css from '../ManifestSelection/ManifestSelection.module.scss'

interface StartupScriptListViewProps {
  pipeline: PipelineInfoConfig
  updateStage: (stage: StageElementConfig) => Promise<void>
  stage: StageElementWrapper | undefined
  isPropagating?: boolean
  connectors: PageConnectorResponse | undefined
  refetchConnectors: () => void
  isReadonly: boolean
  allowableTypes: MultiTypeInputType[]
  startupScript: any
}

export interface StartupScriptWizardInitData {
  connectorRef: string | undefined | ConnectorSelectedValue
  store: ConnectorTypes | string
}

interface StartupScriptLastStepProps {
  key: string
  name: string
  expressions: string[]
  allowableTypes: MultiTypeInputType[]
  stepName: string
  // todo: change type from any
  initialValues: any
  handleSubmit: (data: any) => void
  isReadonly?: boolean
  startupScript?: any
}

function StartupScriptListView({
  updateStage,
  stage,
  isPropagating,
  connectors,
  refetchConnectors,
  startupScript,
  isReadonly,
  allowableTypes
}: StartupScriptListViewProps): JSX.Element {
  const [connectorView, setConnectorView] = useState(false)
  const [connectorType, setConnectorType] = useState('')
  const [isEditMode, setIsEditMode] = useState(false)
  const { trackEvent } = useTelemetry()

  const DIALOG_PROPS: IDialogProps = {
    isOpen: true,
    usePortal: true,
    autoFocus: true,
    canEscapeKeyClose: false,
    canOutsideClickClose: false,
    enforceFocus: false,
    style: { width: 1175, minHeight: 640, borderLeft: 0, paddingBottom: 0, position: 'relative', overflow: 'hidden' }
  }

  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()

  const removeStartupScript = (): void => {
    if (stage) {
      const newStage = produce(stage, draft => {
        set(draft, 'stage.spec.serviceConfig.serviceDefinition.spec.startupScript', {})
      }).stage

      if (newStage) {
        updateStage(newStage)
      }
    }
  }

  const addStartupScript = (): void => {
    showConnectorModal()
  }

  const editStartupScript = (store: ConnectorTypes): void => {
    setConnectorType(store)
    setConnectorView(false)
    showConnectorModal()
  }

  const getInitialValues = (): StartupScriptWizardInitData => {
    if (startupScript) {
      const values = {
        ...startupScript,
        store: startupScript?.store?.type,
        connectorRef: startupScript?.store?.spec?.connectorRef
      }
      return values
    }
    return {
      store: '',
      connectorRef: undefined
    }
  }

  const updateStageData = (): void => {
    const path = isPropagating
      ? 'stage.spec.serviceConfig.stageOverrides.startupScript'
      : 'stage.spec.serviceConfig.serviceDefinition.spec.startupScript'

    if (stage) {
      updateStage(
        produce(stage, draft => {
          console.log(startupScript)
          set(draft, path, startupScript)
        }).stage as StageElementConfig
      )
    }
  }

  const handleSubmit = (script: any): void => {
    startupScript = script
    updateStageData()
    // todo: add tracking events
    trackEvent(true ? ManifestActions.SaveManifestOnPipelinePage : ManifestActions.UpdateManifestOnPipelinePage, {})

    hideConnectorModal()
    setConnectorView(false)
    setConnectorType('')
    refetchConnectors()
  }

  const handleConnectorViewChange = (isConnectorView: boolean): void => {
    setConnectorView(isConnectorView)
    setIsEditMode(false)
  }
  const handleStoreChange = (type?: ConnectorTypes): void => {
    setConnectorType(type || '')
  }

  const lastStepProps = useCallback((): StartupScriptLastStepProps => {
    const startupScriptDetailsProps: StartupScriptLastStepProps = {
      key: getString('pipeline.startupScript.fileDetails'),
      name: getString('pipeline.startupScript.fileDetails'),
      expressions,
      allowableTypes,
      stepName: getString('pipeline.startupScript.fileDetails'),
      initialValues: startupScript,
      handleSubmit: handleSubmit,
      isReadonly: isReadonly
    }

    return startupScriptDetailsProps
  }, [startupScript])

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

  const getLastSteps = useCallback((): Array<React.ReactElement<StepProps<ConnectorConfigDTO>>> => {
    const arr: Array<React.ReactElement<StepProps<ConnectorConfigDTO>>> = []
    const manifestDetailStep = <StartupScriptWizardStepTwo {...lastStepProps()} />

    arr.push(manifestDetailStep)
    return arr
  }, [startupScript, lastStepProps])

  const getNewConnectorSteps = useCallback((): JSX.Element => {
    const connectorType = startupScript?.store && ConnectorMap[startupScript?.store?.type]
    const buildPayload = getBuildPayload(connectorType)
    return (
      <StepWizard title={getString('connectors.createNewConnector')}>
        <ConnectorDetailsStep
          type={connectorType}
          name={getString('overview')}
          isEditMode={isEditMode}
          gitDetails={{ repoIdentifier, branch, getDefaultFromOtherRepo: true }}
        />
        {connectorType !== Connectors.ARTIFACTORY ? (
          <GitDetailsStep
            type={connectorType}
            name={getString('details')}
            isEditMode={isEditMode}
            connectorInfo={undefined}
          />
        ) : null}
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
        {connectorType === Connectors.GITLAB ? (
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
        <VerifyOutOfClusterDelegate
          name={getString('connectors.stepThreeName')}
          connectorInfo={undefined}
          isStep={true}
          isLastStep={false}
          type={connectorType}
        />
      </StepWizard>
    )
  }, [connectorView, connectorType, isEditMode])

  const renderStartupScriptList = (startupScript: any): any => {
    const { color } = getStatus(startupScript?.store?.spec?.connectorRef, connectors, accountId)
    const connectorName = getConnectorNameFromValue(startupScript?.store?.spec?.connectorRef, connectors)

    return (
      <div className={css.rowItem}>
        <section className={css.manifestList}>
          <div className={css.columnId}>
            <Icon inline name={ConnectorIcons[startupScript?.store?.type as ConnectorTypes]} size={20} />
            <Text inline width={150} className={css.type} lineClamp={1}>
              {startupScript?.store?.type}
            </Text>
          </div>
          {renderConnectorField(startupScript?.store?.spec?.connectorRef, connectorName, color)}
          <div>{startupScript?.store?.spec?.gitFetchType}</div>
          {!!startupScript?.store?.spec.paths?.length && (
            <div>
              <Text lineClamp={1} width={200}>
                <span className={css.noWrap}>
                  {typeof startupScript?.store?.spec.paths === 'string'
                    ? startupScript?.store?.spec.paths
                    : startupScript?.store?.spec.paths.join(', ')}
                </span>
              </Text>
            </div>
          )}
          {!isReadonly && (
            <span>
              <Layout.Horizontal>
                <Button
                  icon="Edit"
                  iconProps={{ size: 18 }}
                  onClick={() => editStartupScript(startupScript?.store?.type as ConnectorTypes)}
                  minimal
                />

                <Button iconProps={{ size: 18 }} icon="main-trash" onClick={() => removeStartupScript()} minimal />
              </Layout.Horizontal>
            </span>
          )}
        </section>
      </div>
    )
  }

  const [showConnectorModal, hideConnectorModal] = useModalHook(() => {
    const onClose = (): void => {
      setConnectorView(false)
      hideConnectorModal()
      setConnectorType('')
      setIsEditMode(false)
    }

    return (
      <Dialog onClose={onClose} {...DIALOG_PROPS} className={cx(css.modal, Classes.DIALOG)}>
        <div className={css.createConnectorWizard}>
          <StartupScriptWizard
            connectorTypes={AllowedTypes}
            iconProps={{
              name: 'audit-trail',
              color: Color.WHITE
            }}
            newConnectorView={connectorView}
            expressions={expressions}
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

  const renderConnectorField = useCallback(
    (connectorRef: string, connectorName: string | undefined, connectorColor: string): JSX.Element => {
      return (
        <ConnectorField connectorRef={connectorRef} connectorName={connectorName} connectorColor={connectorColor} />
      )
    },
    []
  )

  return (
    <Layout.Vertical style={{ width: '100%' }}>
      <Layout.Vertical spacing="small" style={{ flexShrink: 'initial' }}>
        {!isEmpty(startupScript) && (
          <div className={cx(css.manifestList, css.listHeader)}>
            <Text font={{ variation: FontVariation.TABLE_HEADERS }}>{getString('store')}</Text>
            <Text font={{ variation: FontVariation.TABLE_HEADERS }}>
              {`${getString('pipeline.manifestType.gitConnectorLabel')} ${getString('connector')}`}
            </Text>
            <Text font={{ variation: FontVariation.TABLE_HEADERS }}>
              {getString('pipeline.manifestType.gitFetchTypeLabel')}
            </Text>
            <Text font={{ variation: FontVariation.TABLE_HEADERS }}>{getString('location')}</Text>
            <span></span>
          </div>
        )}
        <Layout.Vertical style={{ flexShrink: 'initial' }}>
          <section>{!isEmpty(startupScript) && renderStartupScriptList(startupScript)}</section>
        </Layout.Vertical>
      </Layout.Vertical>
      <Layout.Vertical spacing={'medium'} flex={{ alignItems: 'flex-start' }}>
        {!isReadonly && isEmpty(startupScript) && (
          <Button
            className={css.addManifest}
            id="add-startup-script"
            size={ButtonSize.SMALL}
            variation={ButtonVariation.LINK}
            data-test-id="addStartupScript"
            onClick={addStartupScript}
            text={getString('common.plusAddName', { name: getString('pipeline.startupScript.name') })}
          />
        )}
      </Layout.Vertical>
    </Layout.Vertical>
  )
}

export default StartupScriptListView
