/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  AllowedTypes,
  Button,
  ButtonSize,
  ButtonVariation,
  Layout,
  StepProps,
  MultiTypeInputType,
  PageSpinner,
  IconProps,
  StepWizard
} from '@harness/uicore'
import { useModalHook } from '@harness/use-modal'
import { Dialog, IDialogProps } from '@blueprintjs/core'
import { defaultTo, get, isEmpty, noop } from 'lodash-es'
import { useStrings } from 'framework/strings'
import type { EnvironmentPathProps, PipelinePathProps, GitQueryParams } from '@common/interfaces/RouteInterfaces'
import RbacButton from '@rbac/components/Button/Button'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import type {
  ConfigFileWrapper,
  ConnectorConfigDTO,
  NGServiceConfig,
  NGServiceV2InfoConfig,
  ServiceDefinition,
  ServiceResponse
} from 'services/cd-ng'
import { ConfigFilesWizard } from '@pipeline/components/ConfigFilesSelection/ConfigFilesWizard/ConfigFilesWizard'
import {
  ConfigFileIconByType,
  ConfigFilesMap,
  FILE_TYPE_VALUES,
  ConfigFilesToConnectorMap
} from '@pipeline/components/ConfigFilesSelection/ConfigFilesHelper'
import ConnectorDetailsStep from '@connectors/components/CreateConnector/commonSteps/ConnectorDetailsStep'
import GitDetailsStep from '@connectors/components/CreateConnector/commonSteps/GitDetailsStep'
import ConnectorTestConnection from '@connectors/common/ConnectorTestConnection/ConnectorTestConnection'
import StepGitAuthentication from '@connectors/components/CreateConnector/GitConnector/StepAuth/StepGitAuthentication'
import StepGithubAuthentication from '@connectors/components/CreateConnector/GithubConnector/StepAuth/StepGithubAuthentication'
import StepBitbucketAuthentication from '@connectors/components/CreateConnector/BitbucketConnector/StepAuth/StepBitbucketAuthentication'
import StepGitlabAuthentication from '@connectors/components/CreateConnector/GitlabConnector/StepAuth/StepGitlabAuthentication'
import DelegateSelectorStep from '@connectors/components/CreateConnector/commonSteps/DelegateSelectorStep/DelegateSelectorStep'
import { yamlParse } from '@common/utils/YamlHelperMethods'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { useQueryParams } from '@common/hooks'
import { HarnessConfigStep } from '@pipeline/components/ConfigFilesSelection/ConfigFilesWizard/ConfigFilesSteps/HarnessConfigStep'
import type {
  ConfigFileType,
  HarnessConfigFileLastStepPrevStepData,
  GitConfigFileLastStepPrevStepData
} from '@pipeline/components/ConfigFilesSelection/ConfigFilesInterface'

import { GitConfigStep } from '@pipeline/components/ConfigFilesSelection/ConfigFilesWizard/ConfigFilesSteps/GitConfigStep'
import { Connectors, CONNECTOR_CREDENTIALS_STEP_IDENTIFIER } from '@connectors/constants'
import { getBuildPayload } from '@pipeline/components/ManifestSelection/Manifesthelper'
import { useGetLastStepConnectorValue } from '@pipeline/hooks/useGetLastStepConnectorValue'
import ServiceConfigFileOverridesList from './ServiceConfigFileOverridesList'
import ServiceConfigFileList from './ServiceConfigFileList'
import {
  AllowedConfigStoresTypes,
  OverrideGitStores,
  getAllowedConfigStores,
  shouldShowGitConfigStores
} from './ServiceConfigFileOverrideUtil'
import css from '../ServiceManifestOverride/ServiceManifestOverride.module.scss'

interface ConfigFileDefaultValueType {
  store: ConfigFileType
  files: string[]
  identifier: string
  fileType: FILE_TYPE_VALUES
  connectorRef?: string
}
interface ServiceConfigFileOverrideProps {
  fileOverrides: ConfigFileWrapper[]
  isReadonly: boolean
  allowableTypes: AllowedTypes
  handleConfigFileOverrideSubmit: (val: ConfigFileWrapper, index: number) => void
  handleServiceFileDelete: (index: number) => void
  expressions: string[]
  selectedService?: string
  serviceList?: ServiceResponse[]
  fromEnvConfigPage?: boolean
  serviceType?: string
}
const DIALOG_PROPS: IDialogProps = {
  isOpen: true,
  usePortal: true,
  autoFocus: true,
  canEscapeKeyClose: false,
  canOutsideClickClose: false,
  enforceFocus: false,
  style: { width: 1175, minHeight: 640, borderLeft: 0, paddingBottom: 0, position: 'relative', overflow: 'hidden' }
}
function ServiceConfigFileOverride(props: ServiceConfigFileOverrideProps): React.ReactElement {
  const { getString } = useStrings()
  const [fileIndex, setEditIndex] = useState(0)
  const [isEditMode, setIsEditMode] = useState(false)
  const [configStore, setConfigStore] = useState<ConfigFileType>('' as ConfigFileType)
  const [newConnectorView, setNewConnectorView] = useState(false)
  const {
    fileOverrides,
    selectedService,
    serviceList,
    isReadonly,
    expressions,
    handleConfigFileOverrideSubmit,
    handleServiceFileDelete,
    allowableTypes,
    fromEnvConfigPage,
    serviceType
  } = props

  const { accountId, orgIdentifier, projectIdentifier, environmentIdentifier } = useParams<
    PipelinePathProps & EnvironmentPathProps
  >()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()

  const { CDS_SERVICE_CONFIG_LAST_STEP, CDS_GIT_CONFIG_FILES } = useFeatureFlags()

  const allowedOverrideStoreTypes = React.useMemo((): ConfigFileType[] => {
    if (serviceType) {
      return shouldShowGitConfigStores(serviceType as ServiceDefinition['type'])
        ? [...AllowedConfigStoresTypes, ...OverrideGitStores]
        : AllowedConfigStoresTypes
    } else {
      // Environment Configurations
      return getAllowedConfigStores({ CDS_GIT_CONFIG_FILES })
    }
  }, [CDS_GIT_CONFIG_FILES, serviceType])

  const getServiceYaml = useCallback((): NGServiceV2InfoConfig => {
    const serviceSelected = serviceList?.find(serviceObj => serviceObj.service?.identifier === selectedService)
    if (serviceSelected) {
      return yamlParse<NGServiceConfig>(defaultTo(serviceSelected?.service?.yaml, '')).service as NGServiceV2InfoConfig
    }
    return {} as NGServiceV2InfoConfig
  }, [selectedService, serviceList])

  const getServiceConfigFiles = useCallback((): ConfigFileWrapper[] => {
    if (!isEmpty(selectedService)) {
      const parsedServiceYaml = getServiceYaml()
      return defaultTo(parsedServiceYaml?.serviceDefinition?.spec?.configFiles, [])
    }
    return []
  }, [getServiceYaml, selectedService])

  const getDeploymentType = (): ServiceDefinition['type'] => {
    const parsedServiceYaml = getServiceYaml()
    return defaultTo(parsedServiceYaml?.serviceDefinition?.type, '') as ServiceDefinition['type']
  }

  const getInitialValues = useCallback((): ConfigFileDefaultValueType => {
    if (isEditMode) {
      const initValues = get(fileOverrides[fileIndex], 'configFile.spec.store.spec')
      return {
        ...initValues,
        store: fileOverrides?.[fileIndex]?.configFile?.spec?.store?.type,
        identifier: get(fileOverrides[fileIndex], 'configFile.identifier', ''),
        files: initValues?.secretFiles?.length ? initValues?.secretFiles : initValues?.files,
        secretFiles: initValues?.secretFiles,
        fileType: initValues?.secretFiles?.length ? FILE_TYPE_VALUES.ENCRYPTED : FILE_TYPE_VALUES.FILE_STORE
      }
    }
    return {
      store: '' as ConfigFileType,
      files: [''],
      identifier: '',
      fileType: FILE_TYPE_VALUES.FILE_STORE
    }
  }, [fileOverrides, fileIndex, isEditMode])

  const createNewFileOverride = (): void => {
    setEditIndex(fileOverrides.length)

    showModal()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }

  const editFileOverride = useCallback(
    (index: number): void => {
      setEditIndex(index)
      if (fileOverrides?.[index]?.configFile?.spec?.store?.type) {
        setConfigStore(fileOverrides?.[index]?.configFile?.spec?.store?.type as ConfigFileType)
      }
      setIsEditMode(true)
      showModal()
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fileOverrides]
  )

  const handleSubmit = useCallback(
    (filesObj: ConfigFileWrapper): void => {
      hideModal()
      setIsEditMode(false)
      handleConfigFileOverrideSubmit(filesObj, fileIndex)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fileIndex]
  )

  const initialValues = getInitialValues()
  const initialConnectorRef = initialValues.connectorRef

  const { selectedConnector, fetchingConnector } = useGetLastStepConnectorValue({
    initialConnectorRef,
    isEditMode
  })

  const prevStepProps = useCallback((): { editConfigFilePrevStepData: ConnectorConfigDTO } => {
    return {
      editConfigFilePrevStepData: {
        ...initialValues,
        store: initialValues?.store,
        connectorRef: selectedConnector
      }
    }
  }, [initialValues, selectedConnector])

  const shouldPassPrevStepData = useCallback((): boolean => {
    if (initialValues.store === ConfigFilesMap.Harness) {
      return isEditMode && !!CDS_SERVICE_CONFIG_LAST_STEP
    }
    return isEditMode && !!selectedConnector && !!CDS_SERVICE_CONFIG_LAST_STEP
  }, [selectedConnector, isEditMode, initialValues?.store, CDS_SERVICE_CONFIG_LAST_STEP])

  const commonProps = {
    name: getString('credentials'),
    onConnectorCreated: noop,
    isEditMode,
    setIsEditMode,
    accountId,
    orgIdentifier,
    projectIdentifier,
    connectorInfo: undefined,
    configFileIndex: fileIndex,
    deploymentType: getDeploymentType()
  }

  const commonLastStepProps = {
    handleSubmit,
    expressions
  }

  const handleChangeStore = (store: ConfigFileType): void => {
    setConfigStore(store || '')
  }

  const handleConnectorViewChange = (isConnectorView: boolean): void => {
    setNewConnectorView(isConnectorView)
    setIsEditMode(false)
  }

  const getIconProps = useCallback((): IconProps => {
    const iconProps: IconProps = {
      name: ConfigFileIconByType[selectedService as ConfigFileType]
    }
    return iconProps
  }, [selectedService])

  const getNewConnectorSteps = useCallback((): JSX.Element => {
    const buildPayload = getBuildPayload(ConfigFilesToConnectorMap[configStore])
    switch (configStore) {
      case ConfigFilesToConnectorMap.Harness:
        return (
          <HarnessConfigStep
            {...commonProps}
            expressions={expressions}
            stepName={getString('pipeline.configFiles.title')}
            name={getString('pipeline.configFiles.title')}
            handleSubmit={handleSubmit}
            listOfConfigFiles={fileOverrides}
          />
        )
      case ConfigFilesToConnectorMap.Git:
      case ConfigFilesToConnectorMap.Gitlab:
      case ConfigFilesToConnectorMap.Bitbucket:
      case ConfigFilesToConnectorMap.Github:
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
            <ConnectorTestConnection
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newConnectorView, configStore, isEditMode, getInitialValues])

  const getLastSteps = useCallback((): Array<React.ReactElement<StepProps<any>>> => {
    const arr: Array<React.ReactElement<StepProps<any>>> = []
    let configDetailStep = null

    if (isEditMode && fetchingConnector) {
      configDetailStep = <PageSpinner />
    } else {
      switch (configStore) {
        case ConfigFilesToConnectorMap.Harness:
          configDetailStep = (
            <HarnessConfigStep
              {...commonProps}
              stepName={getString('pipeline.configFiles.title', { type: 'Details' })}
              name={getString('pipeline.configFiles.title', { type: 'Details' })}
              listOfConfigFiles={fileOverrides}
              {...commonLastStepProps}
              {...((shouldPassPrevStepData() ? prevStepProps() : {}) as HarnessConfigFileLastStepPrevStepData)}
            />
          )
          break
        case ConfigFilesToConnectorMap.Git:
        case ConfigFilesToConnectorMap.Gitlab:
        case ConfigFilesToConnectorMap.Bitbucket:
        case ConfigFilesToConnectorMap.Github:
          configDetailStep = (
            <GitConfigStep
              {...commonProps}
              allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
              stepName={getString('pipeline.configFiles.title', { type: 'Details' })}
              name={getString('pipeline.configFiles.title', { type: 'Details' })}
              listOfConfigFiles={fileOverrides}
              selectedConfigFile={configStore}
              {...commonLastStepProps}
              {...((shouldPassPrevStepData() ? prevStepProps() : {}) as GitConfigFileLastStepPrevStepData)}
            />
          )
          break

        default:
          configDetailStep = (
            <HarnessConfigStep
              {...commonProps}
              stepName={getString('pipeline.configFiles.title', { type: 'Details' })}
              name={getString('pipeline.configFiles.title', { type: 'Details' })}
              listOfConfigFiles={fileOverrides}
              {...commonLastStepProps}
              {...((shouldPassPrevStepData() ? prevStepProps() : {}) as HarnessConfigFileLastStepPrevStepData)}
            />
          )
          break
      }
    }

    arr.push(configDetailStep)
    return arr
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    selectedService,
    getString,
    isEditMode,
    prevStepProps,
    getServiceConfigFiles,
    configStore,
    fileOverrides,
    handleSubmit,
    initialValues,
    selectedConnector,
    fetchingConnector
  ])

  const [showModal, hideModal] = useModalHook(() => {
    const onClose = (): void => {
      setNewConnectorView(false)
      hideModal()
      setEditIndex(0)
      setIsEditMode(false)
      setConfigStore('' as ConfigFileType)
    }
    return (
      <Dialog onClose={onClose} {...DIALOG_PROPS}>
        <div className={css.createConnectorWizard}>
          <ConfigFilesWizard
            stores={allowedOverrideStoreTypes}
            expressions={expressions}
            allowableTypes={allowableTypes}
            isReadonly={isReadonly}
            iconsProps={getIconProps()}
            configFileIndex={fileIndex}
            deploymentType={getDeploymentType()}
            initialValues={getInitialValues()}
            firstStep={
              !fromEnvConfigPage &&
              !isEditMode &&
              getServiceConfigFiles().length > 0 && (
                <ServiceConfigFileList
                  name={getString('cd.serviceOverrides.configFileSelection')}
                  serviceConfigFileList={getServiceConfigFiles()}
                  isReadonly={isReadonly}
                />
              )
            }
            lastSteps={getLastSteps()}
            newConnectorView={newConnectorView}
            isEditMode={isEditMode}
            handleStoreChange={handleChangeStore}
            newConnectorSteps={getNewConnectorSteps()}
            handleConnectorViewChange={(status: boolean) => handleConnectorViewChange(status)}
          />
        </div>
        <Button minimal icon="cross" onClick={onClose} className={css.crossIcon} />
      </Dialog>
    )
  }, [expressions, allowableTypes, fileIndex, isEditMode, isReadonly, initialValues, selectedConnector])

  const addBtnCommonProps = {
    size: ButtonSize.SMALL,
    variation: ButtonVariation.LINK,
    className: css.addOverrideBtn,
    permission: {
      resource: {
        resourceType: ResourceType.ENVIRONMENT,
        resourceIdentifier: environmentIdentifier
      },
      resourceScope: {
        accountIdentifier: accountId,
        orgIdentifier,
        projectIdentifier
      },
      permission: PermissionIdentifier.EDIT_ENVIRONMENT
    },
    onClick: createNewFileOverride
  }

  return (
    <Layout.Vertical flex={{ alignItems: 'flex-start' }} spacing="medium">
      {fileOverrides && fileOverrides?.length > 0 && (
        <ServiceConfigFileOverridesList
          configFileOverrideList={fileOverrides}
          isReadonly={isReadonly}
          editFileOverride={editFileOverride}
          handleServiceFileDelete={handleServiceFileDelete}
        />
      )}
      <RbacButton
        {...addBtnCommonProps}
        icon="plus"
        text={`${getString('common.newName', {
          name: getString('cd.configFileStoreTitle')
        })} ${getString('common.override')}`}
      />
    </Layout.Vertical>
  )
}

export default ServiceConfigFileOverride
