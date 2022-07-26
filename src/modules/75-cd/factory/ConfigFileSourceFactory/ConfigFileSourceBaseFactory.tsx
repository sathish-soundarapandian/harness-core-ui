import { SshConfigFileSource } from '@cd/components/PipelineSteps/SshServiceSpec/ConfigFileSource/SshConfigFileSource/SshConfigFileSource'

import type { ConfigFileSourceBase } from './ConfigFileSourceBase'

export class ConfigFileSourceBaseFactory {
  protected configFileSourceDict: Map<string, ConfigFileSourceBase<unknown>>

  constructor() {
    this.configFileSourceDict = new Map()
  }

  getConfigFileSource<T>(configFileSourceType: string): ConfigFileSourceBase<T> | undefined {
    if (configFileSourceType) {
      return this.configFileSourceDict.get(configFileSourceType) as ConfigFileSourceBase<T>
    }
  }

  registerConfigFileSource<T>(configFileSource: ConfigFileSourceBase<T>): void {
    this.configFileSourceDict.set(configFileSource.getConfigFileSourceType(), configFileSource)
  }

  deRegisterConfigFileSource(configFileSourceType: string): void {
    this.configFileSourceDict.delete(configFileSourceType)
  }
}

const configFileSourceBaseFactory = new ConfigFileSourceBaseFactory()
configFileSourceBaseFactory.registerConfigFileSource(new SshConfigFileSource())

export default configFileSourceBaseFactory
