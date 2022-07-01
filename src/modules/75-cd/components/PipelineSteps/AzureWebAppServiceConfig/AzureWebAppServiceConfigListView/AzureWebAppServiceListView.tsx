/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  Layout,
  Button,
  ButtonSize,
  ButtonVariation,
  MultiTypeInputType,
  StepWizard,
  Text,
  StepProps,
  Icon
} from '@wings-software/uicore'
import cx from 'classnames'
import { FontVariation } from '@harness/design-system'
import { useModalHook } from '@harness/use-modal'
import { Classes, Dialog, IDialogProps } from '@blueprintjs/core'
import produce from 'immer'
import { isEmpty, set } from 'lodash-es'
import { useStrings } from 'framework/strings'

import type { StageElementWrapper } from '@pipeline/utils/pipelineTypes'
import type {
  ConnectorConfigDTO,
  ConnectorInfoDTO,
  PageConnectorResponse,
  ServiceDefinition,
  StageElementConfig
} from 'services/cd-ng'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'

import type { ConnectorSelectedValue } from '@connectors/components/ConnectorReferenceField/ConnectorReferenceField'
import ConnectorDetailsStep from '@connectors/components/CreateConnector/commonSteps/ConnectorDetailsStep'
import { useQueryParams } from '@common/hooks'
import type { GitQueryParams } from '@common/interfaces/RouteInterfaces'
import { Connectors, CONNECTOR_CREDENTIALS_STEP_IDENTIFIER } from '@connectors/constants'
import GitDetailsStep from '@connectors/components/CreateConnector/commonSteps/GitDetailsStep'
import StepGitAuthentication from '@connectors/components/CreateConnector/GitConnector/StepAuth/StepGitAuthentication'
import StepGithubAuthentication from '@connectors/components/CreateConnector/GithubConnector/StepAuth/StepGithubAuthentication'
import StepBitbucketAuthentication from '@connectors/components/CreateConnector/BitbucketConnector/StepAuth/StepBitbucketAuthentication'
import StepGitlabAuthentication from '@connectors/components/CreateConnector/GitlabConnector/StepAuth/StepGitlabAuthentication'
import DelegateSelectorStep from '@connectors/components/CreateConnector/commonSteps/DelegateSelectorStep/DelegateSelectorStep'
import VerifyOutOfClusterDelegate from '@connectors/common/VerifyOutOfClusterDelegate/VerifyOutOfClusterDelegate'
// import { useTelemetry } from '@common/hooks/useTelemetry'
// import { ManifestActions } from '@common/constants/TrackingConstants'
import {
  buildBitbucketPayload,
  buildGithubPayload,
  buildGitlabPayload,
  buildGitPayload
} from '@connectors/pages/connectors/utils/ConnectorUtils'
import { getConnectorNameFromValue, getStatus } from '@pipeline/components/PipelineStudio/StageBuilder/StageBuilderUtil'
import { AzureWebAppServiceConfigWizard } from '@cd/components/PipelineSteps/AzureWebAppServiceConfig/AzureWebAppServiceConfigListView/AzureWebAppServiceWizard/AzureWebAppServiceConfigWizard'
import AzureWebAppServiceStepTwo from '@cd/components/PipelineSteps/AzureWebAppServiceConfig/AzureWebAppServiceConfigListView/AzureWebAppServiceWizard/AzureWebAppServiceStepTwo'
import {
  AllowedTypes,
  ConnectorIcons,
  ConnectorMap,
  ConnectorTypes,
  WizardStepNames
} from '../AzureWebAppServiceConfig.types'
import ConnectorField from './AzureWebAppServiceConnectorField'
import css from '../AzureWebAppServiceConfig.module.scss'

export enum ModalViewOption {
  APPLICATIONSETTING = 0,
  CONNECTIONSTRING = 1
}

interface LastStepProps {
  key: string
  name: string
  expressions: string[]
  allowableTypes: MultiTypeInputType[]
  stepName: string
  // todo: change type from any
  initialValues: any
  handleSubmit: (data: any) => void
  isReadonly?: boolean
}

export interface applicationSettingsWizardInitData {
  connectorRef: string | undefined | ConnectorSelectedValue
  store: ConnectorTypes | string
}
export interface AzureWebAppListViewProps {
  pipeline: any
  updateStage: (stage: StageElementConfig) => Promise<void>
  stage: StageElementWrapper | undefined
  isPropagating?: boolean
  isReadonly: boolean
  connectors: PageConnectorResponse | undefined
  refetchConnectors: () => void
  deploymentType?: ServiceDefinition['type']
  allowableTypes: MultiTypeInputType[]
  applicationSettings?: any
  connectionStrings?: any
}

export const DIALOG_PROPS: IDialogProps = {
  isOpen: true,
  usePortal: true,
  autoFocus: true,
  canEscapeKeyClose: false,
  canOutsideClickClose: false,
  enforceFocus: false,
  style: { width: 1175, minHeight: 640, borderLeft: 0, paddingBottom: 0, position: 'relative', overflow: 'hidden' }
}

function AzureWebAppListView({
  updateStage,
  stage,
  isPropagating,
  connectors,
  refetchConnectors,
  applicationSettings,
  connectionStrings,
  isReadonly,
  allowableTypes
}: AzureWebAppListViewProps): JSX.Element {
  const { getString } = useStrings()

  //for selecting which modal to open
  const [selectedOption, setSelectedOption] = useState<ModalViewOption | undefined>(undefined)
  const [connectorView, setConnectorView] = useState(false)
  const [connectorType, setConnectorType] = useState('')
  const [isEditMode, setIsEditMode] = useState(false)
  // const { trackEvent } = useTelemetry()

  const { accountId, projectIdentifier, orgIdentifier } = useParams<{
    projectIdentifier: string
    orgIdentifier: string
    accountId: string
  }>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const { expressions } = useVariablesExpression()

  const removeApplicationConfig = (type: ModalViewOption): void => {
    if (stage) {
      const newStage = produce(stage, draft => {
        switch (type) {
          case ModalViewOption.APPLICATIONSETTING:
            set(draft, 'stage.spec.serviceConfig.serviceDefinition.spec.applicationSettings', {})
            break
          case ModalViewOption.CONNECTIONSTRING:
            set(draft, 'stage.spec.serviceConfig.serviceDefinition.spec.connectionStrings', {})
            break
        }
      }).stage

      if (newStage) {
        updateStage(newStage)
      }
    }
  }
  const editApplicationConfig = (store: ConnectorTypes, type: ModalViewOption): void => {
    setSelectedOption(type)
    setConnectorType(store)
    setConnectorView(false)
    showConnectorModal()
  }

  const updateStageData = (item: any, itemPath: string): void => {
    const path = isPropagating
      ? `stage.spec.serviceConfig.stageOverrides.${itemPath}`
      : `stage.spec.serviceConfig.serviceDefinition.spec.${itemPath}`

    if (stage) {
      updateStage(
        produce(stage, draft => {
          set(draft, path, item)
        }).stage as StageElementConfig
      )
    }
  }

  // todo
  const handleSubmit = (item: any): void => {
    let path = ''
    switch (selectedOption) {
      case ModalViewOption.APPLICATIONSETTING:
        applicationSettings = item
        path = 'applicationSettings'
        updateStageData(applicationSettings, path)
        break
      case ModalViewOption.CONNECTIONSTRING:
        connectionStrings = item
        path = 'connectionStrings'
        updateStageData(connectionStrings, path)
        break
    }
    // todo: add tracking events
    // trackEvent(true ? ManifestActions.SaveManifestOnPipelinePage : ManifestActions.UpdateManifestOnPipelinePage, {})

    hideConnectorModal()
    setConnectorView(false)
    setConnectorType('')
    setSelectedOption(undefined)
    refetchConnectors()
  }

  const handleConnectorViewChange = (isConnectorView: boolean): void => {
    setConnectorView(isConnectorView)
    setIsEditMode(false)
  }
  const handleStoreChange = (type?: ConnectorTypes): void => {
    setConnectorType(type || '')
  }

  const getLabels = React.useCallback((): WizardStepNames => {
    switch (selectedOption) {
      case ModalViewOption.APPLICATIONSETTING:
        return {
          wizardName: getString('pipeline.appServiceConfig.applicationSettings.file'),
          firstStepName: getString('pipeline.appServiceConfig.applicationSettings.fileSource'),
          secondStepName: getString('pipeline.appServiceConfig.applicationSettings.fileDetails')
        }
      case ModalViewOption.CONNECTIONSTRING:
        return {
          wizardName: getString('pipeline.appServiceConfig.connectionStrings.file'),
          firstStepName: getString('pipeline.appServiceConfig.connectionStrings.fileSource'),
          secondStepName: getString('pipeline.appServiceConfig.connectionStrings.fileDetails')
        }
      default:
        return {
          wizardName: '',
          firstStepName: '',
          secondStepName: ''
        }
    }
  }, [selectedOption])

  const getLastStepInitialData = React.useCallback((): any => {
    switch (selectedOption) {
      case ModalViewOption.APPLICATIONSETTING:
        if (applicationSettings?.store?.type && applicationSettings?.store?.type !== connectorType) {
          return {}
        }
        return { ...applicationSettings }
      case ModalViewOption.CONNECTIONSTRING:
        if (connectionStrings?.store?.type && connectionStrings?.store?.type !== connectorType) {
          return { ...connectionStrings }
        }
        break
    }
  }, [selectedOption])

  const lastStepProps = React.useCallback((): LastStepProps => {
    return {
      key: getLabels()?.secondStepName,
      name: getLabels()?.secondStepName,
      expressions,
      allowableTypes,
      stepName: getLabels()?.secondStepName,
      initialValues: getLastStepInitialData(),
      handleSubmit: handleSubmit,
      isReadonly: isReadonly
    }
  }, [connectorType, selectedOption])

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

  const getLastSteps = React.useCallback((): Array<React.ReactElement<StepProps<ConnectorConfigDTO>>> => {
    const arr: Array<React.ReactElement<StepProps<ConnectorConfigDTO>>> = []
    const manifestDetailStep = <AzureWebAppServiceStepTwo {...lastStepProps()} />

    arr.push(manifestDetailStep)
    return arr
  }, [connectorType, selectedOption, lastStepProps])

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
          {connectorType !== Connectors.ARTIFACTORY ? (
            <GitDetailsStep type={type} name={getString('details')} isEditMode={isEditMode} connectorInfo={undefined} />
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
            type={type}
          />
        </StepWizard>
      )
    }
  }, [connectorView, connectorType, isEditMode, selectedOption])

  const getInitialValues = React.useCallback((): applicationSettingsWizardInitData => {
    switch (selectedOption) {
      case ModalViewOption.APPLICATIONSETTING:
        if (applicationSettings) {
          const values = {
            ...applicationSettings,
            store: applicationSettings?.store?.type,
            connectorRef: applicationSettings?.store?.spec?.connectorRef
          }
          return values
        }
        return {
          store: '',
          connectorRef: undefined
        }
      case ModalViewOption.CONNECTIONSTRING:
        if (connectionStrings) {
          const values = {
            ...connectionStrings,
            store: connectionStrings?.store?.type,
            connectorRef: connectionStrings?.store?.spec?.connectorRef
          }
          return values
        }
        return {
          store: '',
          connectorRef: undefined
        }
      default:
        return {
          store: '',
          connectorRef: undefined
        }
    }
  }, [selectedOption])

  const renderApplicationSettingsList = (applicationSetting: any): any => {
    const { color } = getStatus(applicationSetting?.store?.spec?.connectorRef, connectors, accountId)
    const connectorName = getConnectorNameFromValue(applicationSetting?.store?.spec?.connectorRef, connectors)

    return (
      <div className={css.rowItem}>
        <section className={css.serviceConfigList}>
          <div className={css.columnId}>
            <Icon inline name={ConnectorIcons[applicationSetting?.store?.type as ConnectorTypes]} size={20} />
            {renderConnectorField(applicationSetting?.store?.spec?.connectorRef, connectorName, color)}
          </div>
          {!!applicationSetting?.store?.spec.paths?.length && (
            <div>
              <Text lineClamp={1} width={200}>
                <span className={css.noWrap}>
                  {typeof applicationSetting?.store?.spec.paths === 'string'
                    ? applicationSetting?.store?.spec.paths
                    : applicationSetting?.store?.spec.paths.join(', ')}
                </span>
              </Text>
            </div>
          )}
          {!isReadonly && (
            <span>
              <Layout.Horizontal className={css.serviceConfigListButton}>
                <Button
                  icon="Edit"
                  iconProps={{ size: 18 }}
                  onClick={() =>
                    editApplicationConfig(
                      applicationSetting?.store?.type as ConnectorTypes,
                      ModalViewOption.APPLICATIONSETTING
                    )
                  }
                  minimal
                />

                <Button
                  iconProps={{ size: 18 }}
                  icon="main-trash"
                  onClick={() => removeApplicationConfig(ModalViewOption.APPLICATIONSETTING)}
                  minimal
                />
              </Layout.Horizontal>
            </span>
          )}
        </section>
      </div>
    )
  }

  const renderConnectionStringsList = (connectionString: any): any => {
    const { color } = getStatus(connectionString?.store?.spec?.connectorRef, connectors, accountId)
    const connectorName = getConnectorNameFromValue(connectionString?.store?.spec?.connectorRef, connectors)

    return (
      <div className={css.rowItem}>
        <section className={css.serviceConfigList}>
          <div className={css.columnId}>
            <Icon inline name={ConnectorIcons[connectionString?.store?.type as ConnectorTypes]} size={20} />
            {renderConnectorField(connectionString?.store?.spec?.connectorRef, connectorName, color)}
          </div>
          {!!connectionString?.store?.spec.paths?.length && (
            <div>
              <Text lineClamp={1} width={200}>
                <span className={css.noWrap}>
                  {typeof connectionString?.store?.spec.paths === 'string'
                    ? connectionString?.store?.spec.paths
                    : connectionString?.store?.spec.paths.join(', ')}
                </span>
              </Text>
            </div>
          )}
          {!isReadonly && (
            <span>
              <Layout.Horizontal className={css.serviceConfigListButton}>
                <Button
                  icon="Edit"
                  iconProps={{ size: 18 }}
                  onClick={() =>
                    editApplicationConfig(
                      connectionString?.store?.type as ConnectorTypes,
                      ModalViewOption.CONNECTIONSTRING
                    )
                  }
                  minimal
                />

                <Button
                  iconProps={{ size: 18 }}
                  icon="main-trash"
                  onClick={() => removeApplicationConfig(ModalViewOption.CONNECTIONSTRING)}
                  minimal
                />
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
      setSelectedOption(undefined)
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
          <AzureWebAppServiceConfigWizard
            connectorTypes={AllowedTypes}
            newConnectorView={connectorView}
            expressions={expressions}
            labels={getLabels()}
            allowableTypes={allowableTypes}
            handleConnectorViewChange={handleConnectorViewChange}
            handleStoreChange={handleStoreChange}
            initialValues={getInitialValues()}
            newConnectorSteps={getNewConnectorSteps()}
            lastSteps={getLastSteps()}
            iconsProps={ConnectorIcons}
            isReadonly={isReadonly}
          />
        </div>
        <Button minimal icon="cross" onClick={onClose} className={css.crossIcon} />
      </Dialog>
    )
  }, [selectedOption, connectorView, connectorType, expressions.length, expressions, allowableTypes, isEditMode])

  const renderConnectorField = React.useCallback(
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
        {(!isEmpty(applicationSettings) || !isEmpty(connectionStrings)) && (
          <div className={css.serviceConfigList}>
            <Text font={{ variation: FontVariation.TABLE_HEADERS }}>{getString('store').toLocaleUpperCase()}</Text>
            <Text font={{ variation: FontVariation.TABLE_HEADERS }}>{getString('location').toLocaleUpperCase()}</Text>
            <span></span>
          </div>
        )}
        <Layout.Vertical style={{ flexShrink: 'initial' }}>
          <section>{!isEmpty(applicationSettings) && renderApplicationSettingsList(applicationSettings)}</section>
          <section>{!isEmpty(connectionStrings) && renderConnectionStringsList(connectionStrings)}</section>
        </Layout.Vertical>
      </Layout.Vertical>
      <Layout.Vertical spacing={'medium'} flex={{ alignItems: 'flex-start' }}>
        {!isReadonly && isEmpty(applicationSettings) && (
          <Button
            className={css.addServiceConfig}
            id="add-applicationSetting"
            size={ButtonSize.SMALL}
            variation={ButtonVariation.LINK}
            onClick={() => {
              setSelectedOption(ModalViewOption.APPLICATIONSETTING)
              showConnectorModal()
            }}
            text={getString('common.plusAddName', {
              name: getString('pipeline.appServiceConfig.applicationSettings.name')
            })}
          />
        )}
        {!isReadonly && isEmpty(connectionStrings) && (
          <Button
            className={css.addServiceConfig}
            id="add-connectionString"
            size={ButtonSize.SMALL}
            variation={ButtonVariation.LINK}
            onClick={() => {
              setSelectedOption(ModalViewOption.CONNECTIONSTRING)
              showConnectorModal()
            }}
            text={getString('common.plusAddName', {
              name: getString('pipeline.appServiceConfig.connectionStrings.name')
            })}
          />
        )}
      </Layout.Vertical>
    </Layout.Vertical>
  )
}

export default AzureWebAppListView
