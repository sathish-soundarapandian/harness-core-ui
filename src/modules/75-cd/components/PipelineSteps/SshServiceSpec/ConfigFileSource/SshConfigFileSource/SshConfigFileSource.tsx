import React from 'react'
import { ConfigFileSourceBase } from '@cd/factory/ConfigFileSourceFactory/ConfigFileSourceBase'

import type { ConfigFileSourceRenderProps } from '@cd/factory/ConfigFileSourceFactory/ConfigFileSourceBase'

import { ENABLE_CONFIG_FILES } from '@pipeline/components/ConfigFilesSelection/ConfigFilesHelper'
import K8sValuesYamlConfigFileContent from '../ConfigFileSourceRuntimeFields/SshValuesYamlConfigFileContent'

export class SshConfigFileSource extends ConfigFileSourceBase<ConfigFileSourceRenderProps> {
  protected configFileType = ENABLE_CONFIG_FILES.Harness

  renderContent(props: ConfigFileSourceRenderProps): JSX.Element | null {
    if (!props.isConfigFileRuntime) {
      return null
    }
    return <K8sValuesYamlConfigFileContent {...props} pathFieldlabel="fileFolderPathText" />
  }
}
