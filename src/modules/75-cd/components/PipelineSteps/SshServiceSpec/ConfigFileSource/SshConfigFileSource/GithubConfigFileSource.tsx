import React from 'react'
import {
  ConfigFileSourceBase,
  ConfigFileSourceRenderProps
} from '@cd/factory/ConfigFileSourceFactory/ConfigFileSourceBase'

import { ENABLE_CONFIG_FILES } from '@pipeline/components/ConfigFilesSelection/ConfigFilesHelper'
import SshValuesYamlConfigFileContent from '../ConfigFileSourceRuntimeFields/SshValuesYamlConfigFileContent'

export class GitHubConfigFileSource extends ConfigFileSourceBase<ConfigFileSourceRenderProps> {
  protected configFileType = ENABLE_CONFIG_FILES.Github

  renderContent(props: ConfigFileSourceRenderProps): JSX.Element | null {
    if (!props.isConfigFileRuntime) {
      return null
    }
    return <SshValuesYamlConfigFileContent {...props} />
  }
}
