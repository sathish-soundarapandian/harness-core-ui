/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

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
