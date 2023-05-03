/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { KubernetesServiceHooksProps } from '@cd/components/PipelineSteps/K8sServiceSpec/K8sServiceSpecInterface'

export interface ServiceHookSourceRenderProps extends KubernetesServiceHooksProps {
  isServiceHookRuntime: boolean
  projectIdentifier: string
  orgIdentifier: string
  accountId: string
  pipelineIdentifier: string
  repoIdentifier?: string
  branch?: string
}

export abstract class ServiceHookSourceBase<T> {
  protected abstract serviceHookType: string
  abstract renderContent(props: T): JSX.Element | null

  getServiceHookSourceType(): string {
    return this.serviceHookType
  }
}
