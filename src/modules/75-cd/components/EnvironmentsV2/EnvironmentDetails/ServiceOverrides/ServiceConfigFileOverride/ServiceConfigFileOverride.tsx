/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useState } from 'react'
import { AllowedTypes, Button, ButtonSize, ButtonVariation, Layout, StepProps } from '@harness/uicore'
import { useModalHook } from '@harness/use-modal'
import { Dialog, IDialogProps } from '@blueprintjs/core'
import { defaultTo, get, isEmpty } from 'lodash-es'
import { useStrings } from 'framework/strings'
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
  FILE_TYPE_VALUES
} from '@pipeline/components/ConfigFilesSelection/ConfigFilesHelper'
import { yamlParse } from '@common/utils/YamlHelperMethods'
import { HarnessConfigStep } from '@pipeline/components/ConfigFilesSelection/ConfigFilesWizard/ConfigFilesSteps/HarnessConfigStep'
import type { ConfigFileType } from '@pipeline/components/ConfigFilesSelection/ConfigFilesInterface'
import ServiceConfigFileOverridesList from './ServiceConfigFileOverridesList'
import ServiceConfigFileList from './ServiceConfigFileList'
import css from '../ServiceManifestOverride/ServiceManifestOverride.module.scss'

interface ConfigFileDefaultValueType {
  store: ConfigFileType
  files: string[]
  identifier: string
  fileType: FILE_TYPE_VALUES
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
function ServiceConfigFileOverride({
  fileOverrides,
  selectedService,
  serviceList,
  isReadonly,
  expressions,
  handleConfigFileOverrideSubmit,
  handleServiceFileDelete,
  allowableTypes,
  fromEnvConfigPage
}: ServiceConfigFileOverrideProps): React.ReactElement {
  const { getString } = useStrings()
  const [fileIndex, setEditIndex] = useState(0)
  const [isEditMode, setIsEditMode] = useState(false)

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

  const createNewFileOverride = useCallback((): void => {
    setEditIndex(fileOverrides.length)
    showModal()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileOverrides.length])

  const editFileOverride = useCallback(
    (index: number): void => {
      setEditIndex(index)
      setIsEditMode(true)
      showModal()
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
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

  const getLastSteps = useCallback((): Array<React.ReactElement<StepProps<ConnectorConfigDTO>>> => {
    return [
      <HarnessConfigStep
        key="harnessConfigFile"
        isEditMode={isEditMode}
        stepName={getString('pipeline.configFiles.title', { type: 'Details' })}
        name={getString('pipeline.configFiles.title', { type: 'Details' })}
        listOfConfigFiles={getServiceConfigFiles()}
        expressions={expressions}
        handleSubmit={handleSubmit}
      />
    ]
  }, [expressions, getServiceConfigFiles, getString, handleSubmit, isEditMode])

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
      store: ConfigFilesMap.Harness,
      files: [''],
      identifier: '',
      fileType: FILE_TYPE_VALUES.FILE_STORE
    }
  }, [fileIndex, fileOverrides, isEditMode])

  const [showModal, hideModal] = useModalHook(() => {
    const onClose = (): void => {
      hideModal()
      setEditIndex(0)
      setIsEditMode(false)
    }
    return (
      <Dialog onClose={onClose} {...DIALOG_PROPS}>
        <div className={css.createConnectorWizard}>
          <ConfigFilesWizard
            stores={[ConfigFilesMap.Harness]}
            expressions={expressions}
            allowableTypes={allowableTypes}
            isReadonly={isReadonly}
            iconsProps={{
              name: ConfigFileIconByType.Harness
            }}
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
            isNewFile={!isEditMode}
          />
        </div>
        <Button minimal icon="cross" onClick={onClose} className={css.crossIcon} />
      </Dialog>
    )
  }, [expressions, allowableTypes, fileIndex, isEditMode, isReadonly])

  const addBtnCommonProps = {
    size: ButtonSize.SMALL,
    variation: ButtonVariation.LINK,
    className: css.addOverrideBtn,
    permission: {
      resource: {
        resourceType: ResourceType.ENVIRONMENT
      },
      permission: PermissionIdentifier.EDIT_ENVIRONMENT
    },
    onClick: createNewFileOverride
  }

  return (
    <Layout.Vertical flex={{ alignItems: 'flex-start' }} spacing="medium">
      <ServiceConfigFileOverridesList
        configFileOverrideList={fileOverrides}
        isReadonly={isReadonly}
        editFileOverride={editFileOverride}
        handleServiceFileDelete={handleServiceFileDelete}
      />
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
