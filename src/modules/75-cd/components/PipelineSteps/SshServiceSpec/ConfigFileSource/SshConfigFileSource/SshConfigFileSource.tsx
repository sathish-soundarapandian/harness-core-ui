/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import {
  ConfigFileSourceBase,
  ConfigFileSourceRenderProps
} from '@cd/factory/ConfigFileSourceFactory/ConfigFileSourceBase'

import { ENABLE_CONFIG_FILES } from '@pipeline/components/ConfigFilesSelection/ConfigFilesHelper'
import SshValuesYamlConfigFileContent from '../ConfigFileSourceRuntimeFields/SshValuesYamlConfigFileContent'

export class SshConfigFileSource extends ConfigFileSourceBase<ConfigFileSourceRenderProps> {
  protected configFileType = ENABLE_CONFIG_FILES.Harness

  renderContent(props: ConfigFileSourceRenderProps): JSX.Element | null {
    if (!props.isConfigFileRuntime) {
      return null
    }
    return <SshValuesYamlConfigFileContent {...props} pathFieldlabel="fileFolderPathText" />
  }
}
