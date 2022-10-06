/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Layout, Button, ButtonSize, ButtonVariation, StepWizard, Text, StepProps, Icon } from '@wings-software/uicore'
import cx from 'classnames'
import { FontVariation } from '@harness/design-system'
import { useModalHook } from '@harness/use-modal'
import { Classes, Dialog, IDialogProps } from '@blueprintjs/core'
import produce from 'immer'
import { get, isEmpty, set } from 'lodash-es'
import { useStrings } from 'framework/strings'

import type {
  ApplicationSettingsConfiguration,
  ConnectionStringsConfiguration,
  ConnectorConfigDTO,
  ConnectorInfoDTO,
  StageElementConfig
} from 'services/cd-ng'
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
import { useTelemetry } from '@common/hooks/useTelemetry'
import {
  buildBitbucketPayload,
  buildGithubPayload,
  buildGitlabPayload,
  buildGitPayload
} from '@connectors/pages/connectors/utils/ConnectorUtils'
import { getConnectorNameFromValue, getStatus } from '@pipeline/components/PipelineStudio/StageBuilder/StageBuilderUtil'
import { AzureWebAppServiceConfigWizard } from '@cd/components/PipelineSteps/AzureWebAppServiceSpec/AzureWebAppServiceConfiguration/AzureWebAppServiceConfigListView/AzureWebAppServiceWizard/AzureWebAppServiceConfigWizard'
import { ServiceConfigActions } from '@common/constants/TrackingConstants'
import GitDetailsStep from '@connectors/components/CreateConnector/commonSteps/GitDetailsStep'
import AzureWebAppServiceStepTwo from './AzureWebAppServiceWizard/AzureWebAppServiceStepTwo'
import ConnectorField from './AzureWebAppServiceConnectorField'
import {
  AllowedTypes,
  AzureWebAppWizardInitData,
  AzureWebAppListViewProps,
  ConnectorIcons,
  ConnectorMap,
  ConnectorTypes,
  LastStepProps,
  ModalViewOption,
  WizardStepNames,
  AzureWebAppSelectionTypes
} from '../AzureWebAppServiceConfig.types'
import css from '../AzureWebAppServiceConfig.module.scss'

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
  stringsConnectors,
  settingsConnectors,
  refetchStringsConnectors,
  refetchSettingsConnectors,
  applicationSettings,
  connectionStrings,
  isReadonly,
  allowableTypes,
  selectedOption,
  setSelectedOption,
  showApplicationSettings,
  showConnectionStrings,
  selectionType,
  handleSubmitConfig,
  handleDeleteConfig,
  editServiceOverride
}: AzureWebAppListViewProps): JSX.Element {
  const { getString } = useStrings()

  const [connectorView, setConnectorView] = useState(false)
  const [connectorType, setConnectorType] = useState('')
  const [isEditMode, setIsEditMode] = useState(false)
  const { trackEvent } = useTelemetry()

  const pipelineView = selectionType === AzureWebAppSelectionTypes.PIPELINE

  const { accountId, projectIdentifier, orgIdentifier } = useParams<{
    projectIdentifier: string
    orgIdentifier: string
    accountId: string
  }>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const { expressions } = useVariablesExpression()

  const handleStageServiceConfigDelete = (type: ModalViewOption): void => {
    /* istanbul ignore else */
    if (stage) {
      const newStage = produce(stage, draft => {
        const path = isPropagating
          ? 'stage.spec.serviceConfig.stageOverrides'
          : 'stage.spec.serviceConfig.serviceDefinition.spec'
        const { applicationSettings: appSettings, connectionStrings: connSettings, ...rest } = get(stage, path)
        switch (type) {
          case ModalViewOption.APPLICATIONSETTING:
            set(draft, path, { ...rest, connectionStrings: connSettings })
            break
          case ModalViewOption.CONNECTIONSTRING:
            set(draft, path, { ...rest, applicationSettings: appSettings })
            break
        }
      }).stage

      /* istanbul ignore else */
      if (newStage) {
        updateStage?.(newStage)
      }
    }
  }

  const removeApplicationConfig = (type: ModalViewOption): void => {
    switch (selectionType) {
      case AzureWebAppSelectionTypes.PIPELINE:
        handleStageServiceConfigDelete(type)
        break
      default:
        handleDeleteConfig?.(0)
        break
    }
  }
  const editApplicationConfig = (store: ConnectorTypes, type: ModalViewOption): void => {
    setSelectedOption(type)
    setConnectorType(store)
    setConnectorView(false)
    showConnectorModal()
  }

  const updateStageData = /* istanbul ignore next */ (
    item: ApplicationSettingsConfiguration | ConnectionStringsConfiguration,
    itemPath: string
  ): void => {
    const path = isPropagating
      ? `stage.spec.serviceConfig.stageOverrides.${itemPath}`
      : `stage.spec.serviceConfig.serviceDefinition.spec.${itemPath}`

    if (stage) {
      updateStage?.(
        produce(stage, draft => {
          set(draft, path, item)
        }).stage as StageElementConfig
      )
    }
  }

  const handleStageServiceConfigSubmit = (
    item: ApplicationSettingsConfiguration | ConnectionStringsConfiguration
  ): void => {
    let path = ''
    switch (selectedOption) {
      case ModalViewOption.APPLICATIONSETTING:
        applicationSettings = { ...item }
        path = 'applicationSettings'
        updateStageData(applicationSettings, path)
        trackEvent(ServiceConfigActions.SaveApplicationSettingOnPipelinePage, {
          applicationSetting: applicationSettings?.store?.type
        })
        break
      case ModalViewOption.CONNECTIONSTRING:
        connectionStrings = { ...item }
        path = 'connectionStrings'
        updateStageData(connectionStrings, path)
        trackEvent(ServiceConfigActions.SaveConnectionStringOnPipelinePage, {
          connectionStrings: connectionStrings?.store?.type
        })
        break
    }
  }

  const handleSubmit = /* istanbul ignore next */ (
    item: ApplicationSettingsConfiguration | ConnectionStringsConfiguration
  ): void => {
    switch (selectionType) {
      case AzureWebAppSelectionTypes.PIPELINE:
        handleStageServiceConfigSubmit(item)
        break
      default:
        handleSubmitConfig?.(item)
        break
    }

    hideConnectorModal()
    setConnectorView(false)
    setConnectorType('')
    if (selectedOption === ModalViewOption.CONNECTIONSTRING) {
      refetchStringsConnectors()
    } else if (selectedOption === ModalViewOption.APPLICATIONSETTING) {
      refetchSettingsConnectors()
    }
    setSelectedOption(undefined)
  }

  const handleConnectorViewChange = /* istanbul ignore next */ (isConnectorView: boolean): void => {
    setConnectorView(isConnectorView)
    setIsEditMode(false)
  }
  const handleStoreChange = /* istanbul ignore next */ (type?: ConnectorTypes): void => {
    setConnectorType(type || '')
  }

  const shouldShowAddButton = (
    item: ConnectionStringsConfiguration | ApplicationSettingsConfiguration | undefined,
    showSpecificButton?: boolean
  ): boolean | undefined => {
    return !isReadonly && showSpecificButton && isEmpty(item)
  }

  const getLabels = React.useCallback((): WizardStepNames => {
    switch (selectedOption) {
      case ModalViewOption.APPLICATIONSETTING:
        return {
          wizardName: getString('pipeline.appServiceConfig.applicationSettings.name'),
          firstStepName: getString('pipeline.fileSource'),
          secondStepName: getString('pipeline.fileDetails'),
          firstStepTitle: getString('pipeline.appServiceConfig.applicationSettings.fileSource'),
          firstStepSubtitle: getString('pipeline.appServiceConfig.applicationSettings.subtitle'),
          secondStepTitle: getString('pipeline.appServiceConfig.applicationSettings.fileDetails'),
          pathPlaceholder: getString('pipeline.appServiceConfig.applicationSettings.filePath')
        }
      case ModalViewOption.CONNECTIONSTRING:
        return {
          wizardName: getString('pipeline.appServiceConfig.connectionStrings.name'),
          firstStepName: getString('pipeline.fileSource'),
          secondStepName: getString('pipeline.fileDetails'),
          firstStepTitle: getString('pipeline.appServiceConfig.connectionStrings.fileSource'),
          firstStepSubtitle: getString('pipeline.appServiceConfig.connectionStrings.subtitle'),
          secondStepTitle: getString('pipeline.appServiceConfig.connectionStrings.fileDetails'),
          pathPlaceholder: getString('pipeline.appServiceConfig.connectionStrings.filePath')
        }
      default:
        return {
          wizardName: '',
          firstStepName: '',
          secondStepName: '',
          secondStepTitle: '',
          firstStepTitle: '',
          firstStepSubtitle: '',
          pathPlaceholder: ''
        }
    }
  }, [selectedOption])

  const getLastStepInitialData = React.useCallback(():
    | ApplicationSettingsConfiguration
    | ConnectionStringsConfiguration => {
    switch (selectedOption) {
      case ModalViewOption.APPLICATIONSETTING:
        if (applicationSettings?.store?.type && applicationSettings?.store?.type === connectorType) {
          return { ...applicationSettings }
        }
        break
      case ModalViewOption.CONNECTIONSTRING:
        if (connectionStrings?.store?.type && connectionStrings?.store?.type === connectorType) {
          return { ...connectionStrings }
        }
        break
    }
    return null as unknown as ApplicationSettingsConfiguration | ConnectionStringsConfiguration
  }, [selectedOption, applicationSettings, connectionStrings, connectorType])

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
  }, [connectorType, selectedOption])

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
    return <AzureWebAppServiceStepTwo {...lastStepProps()} />
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
  }, [connectorView, connectorType, isEditMode, selectedOption])

  const getInitialValues = React.useCallback((): AzureWebAppWizardInitData => {
    switch (selectedOption) {
      case ModalViewOption.APPLICATIONSETTING:
        /* istanbul ignore else */
        if (applicationSettings) {
          const values = {
            ...applicationSettings,
            selectedStore: applicationSettings?.store?.type,
            connectorRef: applicationSettings?.store?.spec?.connectorRef
          }
          return values
        }
        return {
          selectedStore: '',
          connectorRef: undefined
        }
      case ModalViewOption.CONNECTIONSTRING:
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
      default:
        return {
          selectedStore: '',
          connectorRef: undefined
        }
    }
  }, [selectedOption])

  const renderListView = React.useCallback(
    (
      currentOption: ApplicationSettingsConfiguration | ConnectionStringsConfiguration | undefined,
      option: ModalViewOption
    ): React.ReactElement => {
      const selectedStore = currentOption?.store?.type
      const selectedConnectorRef = get(currentOption, 'store.spec.connectorRef')
      const connectorList = option === ModalViewOption.CONNECTIONSTRING ? stringsConnectors : settingsConnectors
      const { color } = getStatus(selectedConnectorRef, connectorList, accountId)
      const connectorName = getConnectorNameFromValue(selectedConnectorRef, connectorList)

      return (
        <div className={css.rowItem}>
          <section className={cx(css.serviceConfigList, pipelineView ? css.pipelineView : css.environmentView)}>
            {pipelineView && (
              <div className={css.columnId}>
                <Text width={200}>
                  {option
                    ? getString('pipeline.appServiceConfig.connectionStrings.name')
                    : getString('pipeline.appServiceConfig.applicationSettings.name')}
                </Text>
              </div>
            )}
            <div className={css.columnId}>
              <Icon inline name={ConnectorIcons[currentOption?.store?.type as ConnectorTypes]} size={20} />
              {get(currentOption, 'store.type') === 'Harness'
                ? getString('harness')
                : renderConnectorField(get(currentOption, 'store.spec.connectorRef'), connectorName, color)}
            </div>
            {!!get(currentOption, 'store.spec.paths')?.length && (
              <div>
                <Text lineClamp={1} width={200} className={css.serviceConfigLocation}>
                  <span>
                    {typeof get(currentOption, 'store.spec.paths') === 'string'
                      ? get(currentOption, 'store.spec.paths')
                      : get(currentOption, 'store.spec.paths').join(', ')}
                  </span>
                </Text>
              </div>
            )}
            {get(currentOption, 'store.spec.files')?.length && (
              <div>
                <Text lineClamp={1} width={200} className={css.serviceConfigLocation}>
                  <span>{get(currentOption, 'store.spec.files')}</span>
                </Text>
              </div>
            )}
            {get(currentOption, 'store.spec.secretFiles')?.length && (
              <div>
                <Text lineClamp={1} width={200} className={css.serviceConfigLocation}>
                  <span>{get(currentOption, 'store.spec.secretFiles')}</span>
                </Text>
              </div>
            )}
            {!isReadonly && (
              <span>
                <Layout.Horizontal className={css.serviceConfigListButton}>
                  <Button
                    icon="Edit"
                    iconProps={{ size: pipelineView ? 18 : 16 }}
                    minimal
                    onClick={() => {
                      if (selectionType === AzureWebAppSelectionTypes.SERVICE_OVERRIDE) {
                        editServiceOverride?.()
                      } else {
                        editApplicationConfig(selectedStore as ConnectorTypes, option)
                      }
                    }}
                  />
                  <Button
                    iconProps={{ size: pipelineView ? 18 : 16 }}
                    icon="main-trash"
                    onClick={() => removeApplicationConfig(option)}
                    minimal
                  />
                </Layout.Horizontal>
              </span>
            )}
          </section>
        </div>
      )
    },
    [stringsConnectors, settingsConnectors, isReadonly]
  )

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
          <div
            className={cx(css.serviceConfigList, css.listHeader, pipelineView ? css.pipelineView : css.environmentView)}
          >
            {pipelineView && (
              <Text font={{ variation: FontVariation.TABLE_HEADERS }}>
                {getString('typeLabel').toLocaleUpperCase()}
              </Text>
            )}
            <Text font={{ variation: FontVariation.TABLE_HEADERS }}>{getString('store').toLocaleUpperCase()}</Text>
            <Text font={{ variation: FontVariation.TABLE_HEADERS }}>{getString('location').toLocaleUpperCase()}</Text>
            <span></span>
          </div>
        )}
        <Layout.Vertical style={{ flexShrink: 'initial' }}>
          <section>
            {!isEmpty(applicationSettings) && renderListView(applicationSettings, ModalViewOption.APPLICATIONSETTING)}
          </section>
          <section>
            {!isEmpty(connectionStrings) && renderListView(connectionStrings, ModalViewOption.CONNECTIONSTRING)}
          </section>
        </Layout.Vertical>
      </Layout.Vertical>
      <Layout.Vertical spacing={'medium'} flex={{ alignItems: 'flex-start' }}>
        {shouldShowAddButton(applicationSettings, showApplicationSettings) && (
          <Button
            className={css.addServiceConfig}
            id="add-applicationSetting"
            size={ButtonSize.SMALL}
            variation={ButtonVariation.LINK}
            onClick={() => {
              if (selectionType === AzureWebAppSelectionTypes.SERVICE_OVERRIDE) {
                editServiceOverride?.()
              } else {
                setSelectedOption(ModalViewOption.APPLICATIONSETTING)
                showConnectorModal()
              }
            }}
            icon="plus"
            text={
              pipelineView
                ? getString('common.newName', {
                    name: getString('pipeline.appServiceConfig.applicationSettings.name')
                  })
                : `${getString('common.newName', {
                    name: getString('pipeline.appServiceConfig.applicationSettings.name')
                  })} ${getString('common.override')}`
            }
          />
        )}
        {shouldShowAddButton(connectionStrings, showConnectionStrings) && (
          <Button
            className={css.addServiceConfig}
            id="add-connectionString"
            size={ButtonSize.SMALL}
            variation={ButtonVariation.LINK}
            onClick={() => {
              if (selectionType === AzureWebAppSelectionTypes.SERVICE_OVERRIDE) {
                editServiceOverride?.()
              } else {
                setSelectedOption(ModalViewOption.CONNECTIONSTRING)
                showConnectorModal()
              }
            }}
            icon="plus"
            text={
              pipelineView
                ? getString('common.newName', {
                    name: getString('pipeline.appServiceConfig.connectionStrings.name')
                  })
                : `${getString('common.newName', {
                    name: getString('pipeline.appServiceConfig.connectionStrings.name')
                  })} ${getString('common.override')}`
            }
          />
        )}
      </Layout.Vertical>
    </Layout.Vertical>
  )
}

export default AzureWebAppListView
