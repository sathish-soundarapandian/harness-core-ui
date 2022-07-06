// import { K8sManifestSource } from '@cd/components/PipelineSteps/K8sServiceSpec/ManifestSource/K8sManifestSource/K8sManifestSource'
// import { ValuesYamlManifestSource } from '@cd/components/PipelineSteps/K8sServiceSpec/ManifestSource/ValuesYamlManifestSource/ValuesYamlManifestSource'
import { K8sConfigFileSource } from '@cd/components/PipelineSteps/K8sServiceSpec/ConfigFileSource/K8sConfigFileSource/K8ConfigFileSource'

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
// configFileSourceBaseFactory.registerConfigFileSource(new K8sManifestSource())
configFileSourceBaseFactory.registerConfigFileSource(new K8sConfigFileSource())

export default configFileSourceBaseFactory
