import type { SshWinRmConfigFilesProps } from '@cd/components/PipelineSteps/SshServiceSpec/SshServiceSpecInterface'
export interface ConfigFileSourceRenderProps extends SshWinRmConfigFilesProps {
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
