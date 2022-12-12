/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { ManifestSourceBase, ManifestSourceRenderProps } from '@cd/factory/ManifestSourceFactory/ManifestSourceBase'
import { ReleaseRepoManifestDataType } from '@pipeline/components/ManifestSelection/GitOps/ReleaseRepoInterface'
import { ManifestContent } from '../ManifestSourceRuntimeFields/ManifestContent'

export class DeploymentRepoManifestSource extends ManifestSourceBase<ManifestSourceRenderProps> {
  protected manifestType = ReleaseRepoManifestDataType.DeploymentRepo

  renderContent(props: ManifestSourceRenderProps): JSX.Element | null {
    if (!props.isManifestsRuntime) {
      return null
    }

    return <ManifestContent {...props} pathFieldlabel="fileFolderPathText" />
  }
}
