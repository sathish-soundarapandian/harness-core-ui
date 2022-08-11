/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useState } from 'react'
import { Layout, Text, StepWizard, StepProps, Button, ButtonSize, ButtonVariation, Icon } from '@harness/uicore'
import { useModalHook } from '@harness/use-modal'
import { FontVariation } from '@harness/design-system'
import { useParams } from 'react-router-dom'
import cx from 'classnames'
import { Dialog, IDialogProps, Classes } from '@blueprintjs/core'
import { get, isEmpty, set } from 'lodash-es'

import produce from 'immer'
import { useStrings } from 'framework/strings'

import ConnectorDetailsStep from '@connectors/components/CreateConnector/commonSteps/ConnectorDetailsStep'
import GitDetailsStep from '@connectors/components/CreateConnector/commonSteps/GitDetailsStep'
import VerifyOutOfClusterDelegate from '@connectors/common/VerifyOutOfClusterDelegate/VerifyOutOfClusterDelegate'
import StepGitAuthentication from '@connectors/components/CreateConnector/GitConnector/StepAuth/StepGitAuthentication'
import type {
  ConnectorConfigDTO,
  ConnectorInfoDTO,
  StageElementConfig,
  StartupCommandConfiguration
} from 'services/cd-ng'
import StepGithubAuthentication from '@connectors/components/CreateConnector/GithubConnector/StepAuth/StepGithubAuthentication'
import StepBitbucketAuthentication from '@connectors/components/CreateConnector/BitbucketConnector/StepAuth/StepBitbucketAuthentication'
import StepGitlabAuthentication from '@connectors/components/CreateConnector/GitlabConnector/StepAuth/StepGitlabAuthentication'
import { Connectors } from '@connectors/constants'
import {
  buildBitbucketPayload,
  buildGithubPayload,
  buildGitlabPayload,
  buildGitPayload
} from '@connectors/pages/connectors/utils/ConnectorUtils'
import DelegateSelectorStep from '@connectors/components/CreateConnector/commonSteps/DelegateSelectorStep/DelegateSelectorStep'

import type { GitQueryParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useQueryParams } from '@common/hooks'

import { StartupScriptActions } from '@common/constants/TrackingConstants'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { getStatus, getConnectorNameFromValue } from '@pipeline/components/PipelineStudio/StageBuilder/StageBuilderUtil'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import ConnectorField from './StartupScriptConnectorField'
import StartupScriptWizardStepTwo from './StartupScriptWizardStepTwo'
import {
  ConnectorMap,
  AllowedTypes,
  ConnectorTypes,
  ConnectorIcons,
  StartupScriptListViewProps,
  StartupScriptWizardInitData,
  StartupScriptLastStepProps
} from './StartupScriptInterface.types'
import { StartupScriptWizard } from './StartupScriptWizard'

import css from './StartupScriptSelection.module.scss'

function StartupScriptListView({
  updateStage,
  stage,
  isPropagating,
  connectors,
  startupCommand,
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
      const path = isPropagating
        ? 'stage.spec.serviceConfig.stageOverrides'
        : 'stage.spec.serviceConfig.serviceDefinition.spec'
      const { startupCommand: command, ...rest } = get(stage, path)
      const newStage = produce(stage, draft => {
        set(draft, path, rest)
      }).stage

      if (newStage) {
        updateStage?.(newStage)
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
    if (startupCommand) {
      const values = {
        ...startupCommand,
        selectedStore: get(startupCommand, 'store.type'),
        connectorRef: get(startupCommand, 'store.spec.connectorRef')
      }
      return values
    }
    return {
      selectedStore: '',
      connectorRef: undefined
    }
  }

  /* istanbul ignore next */
  const updateStageData = (script: StartupCommandConfiguration): void => {
    const path = isPropagating
      ? 'stage.spec.serviceConfig.stageOverrides.startupCommand'
      : 'stage.spec.serviceConfig.serviceDefinition.spec.startupCommand'

    if (stage) {
      updateStage?.(
        produce(stage, draft => {
          set(draft, path, script)
        }).stage as StageElementConfig
      )
    }
  }

  /* istanbul ignore next */
  const handleSubmit = (script: StartupCommandConfiguration): void => {
    updateStageData(script)

    trackEvent(StartupScriptActions.SaveStartupScriptOnPipelinePage, { startupCommand: startupCommand?.store?.type })

    hideConnectorModal()
    setConnectorView(false)
    setConnectorType('')
  }

  /* istanbul ignore next */
  const handleConnectorViewChange = (isConnectorView: boolean): void => {
    setConnectorView(isConnectorView)
    setIsEditMode(false)
  }

  /* istanbul ignore next */
  const handleStoreChange = (type?: ConnectorTypes): void => {
    setConnectorType(type || '')
  }

  const lastStepProps = useCallback((): StartupScriptLastStepProps => {
    return {
      key: getString('pipeline.fileDetails'),
      name: getString('pipeline.fileDetails'),
      expressions,
      allowableTypes,
      stepName: getString('pipeline.startupCommand.fileDetails'),
      initialValues: getLastStepInitialData(),
      handleSubmit: handleSubmit,
      isReadonly: isReadonly
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

  const getLastStepInitialData = (): StartupCommandConfiguration => {
    const initValues = startupCommand
    /* istanbul ignore next */
    if (get(initValues, 'store.type') && get(initValues, 'store.type') !== connectorType) {
      return null as unknown as StartupCommandConfiguration
    }
    return initValues
  }

  const getLastSteps = useCallback((): React.ReactElement<StepProps<ConnectorConfigDTO>> => {
    return <StartupScriptWizardStepTwo {...lastStepProps()} />
  }, [startupCommand, connectorType, lastStepProps])

  const getNewConnectorSteps = useCallback((): JSX.Element | void => {
    const type = ConnectorMap[connectorType]
    if (type) {
      const buildPayload = getBuildPayload(type)
      /* istanbul ignore next */
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
          <VerifyOutOfClusterDelegate
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

  const renderStartupScriptList = React.useCallback(
    (script: StartupCommandConfiguration): React.ReactElement => {
      const { color } = getStatus(get(script, 'store.spec.connectorRef'), connectors, accountId)
      const connectorName = getConnectorNameFromValue(get(script, 'store.spec.connectorRef'), connectors)
      return (
        <div className={css.rowItem}>
          <section className={css.startupScriptList}>
            <div className={css.columnId}>
              <Icon inline name={ConnectorIcons[get(script, 'store.type') as ConnectorTypes]} size={20} />
              {get(script, 'store.type') === 'Harness'
                ? getString('harness')
                : renderConnectorField(get(script, 'store.spec.connectorRef'), connectorName, color)}
            </div>
            {!!get(script, 'store.spec.paths')?.length && (
              <div className={css.columnId}>
                <Text lineClamp={1} width={300}>
                  <span className={css.noWrap}>
                    {typeof get(script, 'store.spec.paths') === 'string'
                      ? /* istanbul ignore next */ get(script, 'store.spec.paths')
                      : get(script, 'store.spec.paths').join(', ')}
                  </span>
                </Text>
              </div>
            )}
            {get(script, 'store.spec.files')?.length && (
              <div className={css.columnId}>
                <Text lineClamp={1} width={300}>
                  <span className={css.noWrap}>{get(script, 'store.spec.files')}</span>
                </Text>
              </div>
            )}
            {get(script, 'store.spec.secretFiles')?.length && (
              <div className={css.columnId}>
                <Text lineClamp={1} width={300}>
                  <span className={css.noWrap}>{get(script, 'store.spec.secretFiles')}</span>
                </Text>
              </div>
            )}

            {!isReadonly && (
              <span>
                <Layout.Horizontal className={css.startupScriptListButton}>
                  <Button
                    icon="Edit"
                    iconProps={{ size: 18 }}
                    onClick={() => editStartupScript(script?.store?.type as ConnectorTypes)}
                    minimal
                  />

                  <Button iconProps={{ size: 18 }} icon="main-trash" onClick={removeStartupScript} minimal />
                </Layout.Horizontal>
              </span>
            )}
          </section>
        </div>
      )
    },
    [connectors]
  )

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
        {!isEmpty(startupCommand) && (
          <div className={cx(css.startupScriptList, css.listHeader)}>
            <Text font={{ variation: FontVariation.TABLE_HEADERS }} width={200}>
              {getString('store')}
            </Text>
            <Text font={{ variation: FontVariation.TABLE_HEADERS }} width={200}>
              {getString('location')}
            </Text>
            <span></span>
          </div>
        )}
        <Layout.Vertical style={{ flexShrink: 'initial' }}>
          <section>{!isEmpty(startupCommand) && renderStartupScriptList(startupCommand)}</section>
        </Layout.Vertical>
      </Layout.Vertical>
      <Layout.Vertical spacing={'medium'} flex={{ alignItems: 'flex-start' }}>
        {!isReadonly && isEmpty(startupCommand) && (
          <Button
            className={css.addStartupScript}
            id="add-startup-script"
            size={ButtonSize.SMALL}
            variation={ButtonVariation.LINK}
            data-test-id="addStartupScript"
            onClick={addStartupScript}
            text={getString('common.plusAddName', { name: getString('pipeline.startupCommand.name') })}
          />
        )}
      </Layout.Vertical>
    </Layout.Vertical>
  )
}

export default StartupScriptListView
