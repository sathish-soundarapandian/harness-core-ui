import type { KubernetesConfigFilesProps } from '@cd/components/PipelineSteps/K8sServiceSpec/K8sServiceSpecInterface'
export interface ConfigFileSourceRenderProps extends KubernetesConfigFilesProps {
  isConfigFileRuntime: boolean
  projectIdentifier: string
  orgIdentifier: string
  accountId: string
  pipelineIdentifier: string
  repoIdentifier?: string
  branch?: string
}

export abstract class ConfigFileSourceBase<T> {
  protected abstract configFileType: string
  abstract renderContent(props: T): JSX.Element | null

  getConfigFileSourceType(): string {
    return this.configFileType
  }
}
