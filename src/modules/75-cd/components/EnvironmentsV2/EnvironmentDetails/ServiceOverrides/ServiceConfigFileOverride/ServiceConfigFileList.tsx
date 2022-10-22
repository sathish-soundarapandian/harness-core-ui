/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback } from 'react'
import { Button, Text, Layout, FontVariation, StepProps, ButtonSize, ButtonVariation } from '@harness/uicore'
import { get } from 'lodash-es'
import type { ConfigFileWrapper, ConnectorConfigDTO } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import { FILE_TYPE_VALUES } from '@pipeline/components/ConfigFilesSelection/ConfigFilesHelper'
import ServiceConfigFileOverridesList from './ServiceConfigFileOverridesList'
import css from '../ServiceOverrides.module.scss'
interface ServiceConfigFileListProps {
  serviceConfigFileList: ConfigFileWrapper[]
  isReadonly: boolean
}

function ServiceConfigFileList({
  serviceConfigFileList,
  isReadonly,
  nextStep,
  prevStepData,
  name
}: StepProps<ConnectorConfigDTO> & ServiceConfigFileListProps): React.ReactElement {
  const { getString } = useStrings()

  const editServiceConfigFileOverride = useCallback(
    (index: number): void => {
      const initValues = get(serviceConfigFileList[index], 'configFile.spec.store.spec')

      nextStep?.({
        ...prevStepData,
        ...initValues,
        identifier: get(serviceConfigFileList[index], 'configFile.identifier', ''),
        files: initValues?.secretFiles?.length ? initValues?.secretFiles : initValues?.files,
        secretFiles: initValues?.secretFiles,
        fileType: initValues?.secretFiles?.length ? FILE_TYPE_VALUES.ENCRYPTED : FILE_TYPE_VALUES.FILE_STORE,
        isEditMode: true,
        configFileIndex: index
      })
    },
    [nextStep, prevStepData, serviceConfigFileList]
  )

  const addServiceConfigFileOverride = (): void => {
    nextStep?.({
      ...prevStepData,
      isEditMode: false,
      identifier: '',
      configFileIndex: serviceConfigFileList.length,
      fileType: FILE_TYPE_VALUES.FILE_STORE,
      secretFiles: [''],
      files: ['']
    })
  }

  return (
    <Layout.Vertical height={'inherit'}>
      <Text font={{ variation: FontVariation.H3 }} margin={{ bottom: 'huge' }}>
        {name}
      </Text>

      <Layout.Vertical flex={{ alignItems: 'flex-start' }} spacing="medium">
        <ServiceConfigFileOverridesList
          configFileOverrideList={serviceConfigFileList}
          isReadonly={isReadonly}
          editFileOverride={editServiceConfigFileOverride}
          isServiceOverride
        />
        <Button
          icon="plus"
          size={ButtonSize.SMALL}
          variation={ButtonVariation.LINK}
          className={css.addOverrideBtn}
          text={getString('cd.serviceOverrides.newConfigFile')}
          onClick={addServiceConfigFileOverride}
          minimal
        />
      </Layout.Vertical>
    </Layout.Vertical>
  )
}

export default ServiceConfigFileList
