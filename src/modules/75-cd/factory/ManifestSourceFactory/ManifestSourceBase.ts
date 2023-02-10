/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { KubernetesManifestsProps } from '@cd/components/PipelineSteps/K8sServiceSpec/K8sServiceSpecInterface'
import type { FileUsage } from '@filestore/interfaces/FileStore'
export interface ManifestSourceRenderProps extends KubernetesManifestsProps {
  isManifestsRuntime: boolean
  projectIdentifier: string
  orgIdentifier: string
  accountId: string
  pipelineIdentifier: string
  repoIdentifier?: string
  branch?: string
  fileUsage?: FileUsage
}

export abstract class ManifestSourceBase<T> {
  protected abstract manifestType: string
  abstract renderContent(props: T): JSX.Element | null

  getManifestSourceType(): string {
    return this.manifestType
  }
}
