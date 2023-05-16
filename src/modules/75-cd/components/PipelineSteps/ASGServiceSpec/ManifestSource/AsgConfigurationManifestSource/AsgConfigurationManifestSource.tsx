import React from 'react'
import type { ManifestSourceRenderProps } from '@cd/factory/ManifestSourceFactory/ManifestSourceBase';
import { ManifestSourceBase } from '@cd/factory/ManifestSourceFactory/ManifestSourceBase'
import { ManifestDataType } from '@pipeline/components/ManifestSelection/Manifesthelper'
import { ManifestContent } from '@cd/components/PipelineSteps/K8sServiceSpec/ManifestSource/ManifestSourceRuntimeFields/ManifestContent'

export class AsgConfigurationManifestSource extends ManifestSourceBase<ManifestSourceRenderProps> {
  protected manifestType = ManifestDataType.AsgConfiguration

  renderContent(props: ManifestSourceRenderProps): JSX.Element | null {
    return <ManifestContent {...props} pathFieldlabel="fileFolderPathText" />
  }
}
