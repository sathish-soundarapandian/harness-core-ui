/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useState } from 'react'
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
import { Color, FontVariation } from '@harness/design-system'
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
  PipelineInfoConfig,
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
import StepArtifactoryAuthentication from '@connectors/components/CreateConnector/ArtifactoryConnector/StepAuth/StepArtifactoryAuthentication'
import DelegateSelectorStep from '@connectors/components/CreateConnector/commonSteps/DelegateSelectorStep/DelegateSelectorStep'
import VerifyOutOfClusterDelegate from '@connectors/common/VerifyOutOfClusterDelegate/VerifyOutOfClusterDelegate'

// import { useTelemetry } from '@common/hooks/useTelemetry'
// import { ManifestActions } from '@common/constants/TrackingConstants'
import type { ConnectorRefLabelType } from '@pipeline/components/ArtifactsSelection/ArtifactInterface'
import {
  buildBitbucketPayload,
  buildGithubPayload,
  buildGitlabPayload,
  buildGitPayload
} from '@connectors/pages/connectors/utils/ConnectorUtils'
import { getConnectorNameFromValue, getStatus } from '@pipeline/components/PipelineStudio/StageBuilder/StageBuilderUtil'
import { AzureWebAppServiceConfigWizard } from '@cd/components/PipelineSteps/AzureWebAppServiceConfig/AzureWebAppServiceConfigListView/AzureWebAppServiceWizard/AzureWebAppServiceConfigWizard'
import AzureWebAppServiceStepTwo from '@cd/components/PipelineSteps/AzureWebAppServiceConfig/AzureWebAppServiceConfigListView/AzureWebAppServiceWizard/AzureWebAppServiceStepTwo'
import ConnectorField from './AzureWebAppServiceConnectorField'
import css from '../AzureWebAppServiceConfig.module.scss'

export enum ModalViewOption {
  APPLICATIONSETTING = 0,
  CONNECTIONSTRING = 1
}

export const ConnectorMap: Record<string, ConnectorInfoDTO['type']> = {
  Git: Connectors.GIT,
  Github: Connectors.GITHUB,
  GitLab: Connectors.GITLAB,
  Bitbucket: Connectors.BITBUCKET,
  Artifactory: Connectors.ARTIFACTORY
}

export const AllowedTypes = ['Git', 'Github', 'GitLab', 'Bitbucket', 'Artifactory']
export type ConnectorTypes = 'Git' | 'Github' | 'GitLab' | 'Bitbucket' | 'Artifactory'

export const ConnectorIcons: any = {
  Git: 'service-github',
  Github: 'github',
  GitLab: 'service-gotlab',
  Bitbucket: 'bitbucket',
  Artifactory: 'service-artifactory'
}
interface ApplicationSettingsLastStepProps {
  key: string
  name: string
  expressions: string[]
  allowableTypes: MultiTypeInputType[]
  stepName: string
  // todo: change type from any
  initialValues: any
  handleSubmit: (data: any) => void
  isReadonly?: boolean
  applicationSettings?: any
}

export interface applicationSettingsWizardInitData {
  connectorRef: string | undefined | ConnectorSelectedValue
  store: ConnectorTypes | string
}
export interface AzureWebAppListViewProps {
  pipeline: PipelineInfoConfig
  updateStage: (stage: StageElementConfig) => Promise<void>
  stage: StageElementWrapper | undefined
  isPropagating?: boolean
  isReadonly: boolean
  connectors: PageConnectorResponse | undefined
  refetchConnectors: () => void
  deploymentType?: ServiceDefinition['type']
  allowableTypes: MultiTypeInputType[]
  applicationSettings?: any
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
  // deploymentType,
  isReadonly,
  allowableTypes
}: AzureWebAppListViewProps): JSX.Element {
  const { getString } = useStrings()

  //for selecting which modal to open
  // const [selectedOption, setSelectedOption] = useState(1)
  const [connectorView, setConnectorView] = useState(false)
  const [connectorType, setConnectorType] = useState('')
  // const [selectedConnector, setSelectedConnector] = useState<ConnectorTypes | ''>('')
  const [isEditMode, setIsEditMode] = useState(false)
  // const { trackEvent } = useTelemetry()

  const { accountId, projectIdentifier, orgIdentifier } = useParams<{
    projectIdentifier: string
    orgIdentifier: string
    accountId: string
  }>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const { expressions } = useVariablesExpression()

  const removeApplicationConfig = (): void => {
    if (stage) {
      const newStage = produce(stage, draft => {
        set(draft, 'stage.spec.serviceConfig.serviceDefinition.spec.applicationSettings', {})
      }).stage

      if (newStage) {
        updateStage(newStage)
      }
    }
  }
  const editApplicationConfig = (store: ConnectorTypes): void => {
    setConnectorType(store)
    setConnectorView(false)
    showConnectorModal()
  }

  const updateStageData = (): void => {
    const path = isPropagating
      ? 'stage.spec.serviceConfig.stageOverrides.applicationSettings'
      : 'stage.spec.serviceConfig.serviceDefinition.spec.applicationSettings'

    if (stage) {
      updateStage(
        produce(stage, draft => {
          set(draft, path, applicationSettings)
        }).stage as StageElementConfig
      )
    }
  }

  // todo
  const handleSubmit = (script: any): void => {
    applicationSettings = script
    updateStageData()
    // todo: add tracking events
    // trackEvent(true ? ManifestActions.SaveManifestOnPipelinePage : ManifestActions.UpdateManifestOnPipelinePage, {})

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

  const lastStepProps = useCallback((): ApplicationSettingsLastStepProps => {
    const applicationSettingsDetailsProps: ApplicationSettingsLastStepProps = {
      key: 'Application Settings Script File Details',
      name: 'Application Settings Script File Details',
      expressions,
      allowableTypes,
      stepName: 'Application Settings File Details',
      initialValues: applicationSettings,
      handleSubmit: handleSubmit,
      isReadonly: isReadonly
    }

    return applicationSettingsDetailsProps
  }, [applicationSettings])

  const getLabels = (): ConnectorRefLabelType => {
    return {
      // firstStepName: getString('pipeline.manifestType.specifyManifestRepoType'),
      firstStepName: 'Specify Application Settings Script File type',
      secondStepName: `${getString('common.specify')} ${getString('store')}`
    }
  }

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
    const manifestDetailStep = <AzureWebAppServiceStepTwo {...lastStepProps()} />

    arr.push(manifestDetailStep)
    return arr
  }, [applicationSettings, lastStepProps])

  const getNewConnectorSteps = () => {
    const connectorTypes = applicationSettings?.store && ConnectorMap[applicationSettings?.store?.type]
    const buildPayload = getBuildPayload(connectorTypes)
    return (
      <StepWizard title={getString('connectors.createNewConnector')}>
        <ConnectorDetailsStep
          type={connectorTypes}
          name={getString('overview')}
          isEditMode={isEditMode}
          gitDetails={{ repoIdentifier, branch, getDefaultFromOtherRepo: true }}
        />
        {connectorTypes !== Connectors.ARTIFACTORY ? (
          <GitDetailsStep
            type={connectorTypes}
            name={getString('details')}
            isEditMode={isEditMode}
            connectorInfo={undefined}
          />
        ) : null}
        {connectorTypes === Connectors.GIT ? (
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
        {connectorTypes === Connectors.GITHUB ? (
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
        {connectorTypes === Connectors.BITBUCKET ? (
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
        {connectorTypes === Connectors.GITLAB ? (
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
        {connectorTypes === Connectors.ARTIFACTORY ? (
          <StepArtifactoryAuthentication
            name={getString('details')}
            identifier={CONNECTOR_CREDENTIALS_STEP_IDENTIFIER}
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
          type={connectorTypes}
        />
      </StepWizard>
    )
  }

  const getInitialValues = (): applicationSettingsWizardInitData => {
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
  }

  const renderApplicationSettingsList = (applicationSetting: any): any => {
    const { color } = getStatus(applicationSetting?.store?.spec?.connectorRef, connectors, accountId)
    const connectorName = getConnectorNameFromValue(applicationSetting?.store?.spec?.connectorRef, connectors)

    return (
      <div className={css.rowItem}>
        <section className={css.manifestList}>
          <div className={css.columnId}>
            <Icon inline name={ConnectorIcons[applicationSetting?.store?.type as ConnectorTypes]} size={20} />
            <Text inline width={150} className={css.type} color={Color.BLACK} lineClamp={1}>
              {applicationSetting?.store?.type}
            </Text>
          </div>
          {renderConnectorField(applicationSetting?.store?.spec?.connectorRef, connectorName, color)}
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
              <Layout.Horizontal>
                <Button
                  icon="Edit"
                  iconProps={{ size: 18 }}
                  onClick={() => editApplicationConfig(applicationSetting?.store?.type as ConnectorTypes)}
                  minimal
                />

                <Button iconProps={{ size: 18 }} icon="main-trash" onClick={() => removeApplicationConfig()} minimal />
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
            labels={getLabels()}
            newConnectorView={connectorView}
            expressions={expressions}
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
        {!isEmpty(applicationSettings) && (
          <div className={css.manifestList}>
            <Text font={{ variation: FontVariation.TABLE_HEADERS }}>{'TYPE'}</Text>
            <Text font={{ variation: FontVariation.TABLE_HEADERS }}>{'STORE'}</Text>
            <Text font={{ variation: FontVariation.TABLE_HEADERS }}>{getString('location').toLocaleUpperCase()}</Text>
            <span></span>
          </div>
        )}
        <Layout.Vertical style={{ flexShrink: 'initial' }}>
          <section>{!isEmpty(applicationSettings) && renderApplicationSettingsList(applicationSettings)}</section>
        </Layout.Vertical>
      </Layout.Vertical>
      <Layout.Vertical spacing={'medium'} flex={{ alignItems: 'flex-start' }}>
        {!isReadonly && isEmpty(applicationSettings) && (
          <>
            <Button
              className={css.addNew}
              id="add-applicationSetting"
              size={ButtonSize.SMALL}
              variation={ButtonVariation.LINK}
              onClick={() => {
                showConnectorModal()
                // setSelectedOption(ModalViewOption.APPLICATIONSETTING)
              }}
              text={'+ Add Application Settings'}
            />
            <Button
              className={css.addNew}
              id="add-connectionString"
              size={ButtonSize.SMALL}
              variation={ButtonVariation.LINK}
              onClick={() => {
                showConnectorModal()
                // setSelectedOption(ModalViewOption.CONNECTIONSTRING)
              }}
              text={'+ Add Connection Strings'}
            />
          </>
        )}
      </Layout.Vertical>
    </Layout.Vertical>
  )
}

export default AzureWebAppListView
