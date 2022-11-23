/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { ApplicationConfigProps } from '@cd/components/PipelineSteps/AzureWebAppServiceSpec/AzureWebAppServiceSpecInterface.types'

export interface ApplicationConfigRenderProps extends ApplicationConfigProps {
  isApplicationConfigRuntime: boolean
  projectIdentifier: string
  orgIdentifier: string
  accountId: string
  pipelineIdentifier: string
  repoIdentifier?: string
  branch?: string
}

export abstract class ApplicationConfigBase<T> {
  protected abstract applicationConfigType: string
  abstract renderContent(props: T): JSX.Element | null

  getApplicationConfigType(): string {
    return this.applicationConfigType
  }
}
