/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { defaultTo } from 'lodash-es'

import { FormInput, Layout } from '@wings-software/uicore'
import { ArtifactSourceBase, ArtifactSourceRenderProps } from '@cd/factory/ArtifactSourceFactory/ArtifactSourceBase'

import { ENABLED_ARTIFACT_TYPES } from '@pipeline/components/ArtifactsSelection/ArtifactHelper'
import { useStrings } from 'framework/strings'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { isFieldRuntime } from '../../K8sServiceSpecHelper'
import { isArtifactSourceRuntime } from '../artifactSourceUtils'
import css from '@pipeline/components/ArtifactsSelection/ArtifactRepository/ArtifactConnector.module.scss'

interface JenkinsRenderContent extends ArtifactSourceRenderProps {
  isTagsSelectionDisabled: (data: ArtifactSourceRenderProps) => boolean
}
const Content = (props: JenkinsRenderContent): React.ReactElement => {
  const {
    isPrimaryArtifactsRuntime,
    isSidecarRuntime,
    template,
    path,
    readonly,
    allowableTypes,
    isSidecar,
    artifactPath
  } = props

  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()

  const isRuntime = isArtifactSourceRuntime(isPrimaryArtifactsRuntime, isSidecarRuntime, isSidecar as boolean)

  return (
    <>
      {isRuntime && (
        <Layout.Vertical key={artifactPath} className={css.inputWidth}>
          {isFieldRuntime(`artifacts.${artifactPath}.spec.org`, template) && (
            <FormInput.MultiTextInput
              name={`${path}.artifacts.${artifactPath}.spec.org`}
              label={getString('projectsOrgs.orgName')}
              placeholder={getString('pipeline.artifactsSelection.orgNamePlaceholder')}
              disabled={readonly}
              multiTextInputProps={{
                expressions,
                allowableTypes
              }}
            />
          )}
          {isFieldRuntime(`artifacts.${artifactPath}.spec.packageName`, template) && (
            <FormInput.MultiTextInput
              name={`${path}.artifacts.${artifactPath}.spec.packageName`}
              label={getString('pipeline.artifactsSelection.packageName')}
              placeholder={getString('pipeline.manifestType.packagePlaceholder')}
              disabled={readonly}
              multiTextInputProps={{
                expressions,
                allowableTypes
              }}
            />
          )}
          {isFieldRuntime(`artifacts.${artifactPath}.spec.version`, template) && (
            <FormInput.MultiTextInput
              name={`${path}.artifacts.${artifactPath}.spec.version`}
              label={getString('version')}
              placeholder={getString('pipeline.artifactsSelection.versionPlaceholder')}
              disabled={readonly}
              multiTextInputProps={{
                expressions,
                allowableTypes
              }}
            />
          )}
          {isFieldRuntime(`artifacts.${artifactPath}.spec.versionRegex`, template) && (
            <FormInput.MultiTextInput
              name={`${path}.artifacts.${artifactPath}.spec.versionRegex`}
              label={getString('pipeline.artifactsSelection.versionRegex')}
              placeholder={getString('pipeline.artifactsSelection.versionRegexPlaceholder')}
              disabled={readonly}
              multiTextInputProps={{
                expressions,
                allowableTypes
              }}
            />
          )}
        </Layout.Vertical>
      )}
    </>
  )
}

export class GithubPackageRegistrySource extends ArtifactSourceBase<ArtifactSourceRenderProps> {
  protected artifactType = ENABLED_ARTIFACT_TYPES.GithubPackageRegistry
  protected isSidecar = false

  isTagsSelectionDisabled(_props: ArtifactSourceRenderProps): boolean {
    return false
  }

  renderContent(props: ArtifactSourceRenderProps): JSX.Element | null {
    if (!props.isArtifactsRuntime) {
      return null
    }

    this.isSidecar = defaultTo(props.isSidecar, false)

    return <Content {...props} isTagsSelectionDisabled={this.isTagsSelectionDisabled.bind(this)} />
  }
}
