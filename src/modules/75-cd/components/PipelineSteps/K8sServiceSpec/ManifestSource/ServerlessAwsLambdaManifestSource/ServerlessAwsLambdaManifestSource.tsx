/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { get } from 'lodash-es'
import cx from 'classnames'
import { FormInput, Layout } from '@harness/uicore'

import { useStrings } from 'framework/strings'
import List from '@common/components/List/List'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { ManifestDataType, ManifestStoreMap } from '@pipeline/components/ManifestSelection/Manifesthelper'
import { ManifestSourceBase, ManifestSourceRenderProps } from '@cd/factory/ManifestSourceFactory/ManifestSourceBase'
import { S3ManifestStoreRuntimeView } from '@cd/components/PipelineSteps/ECSServiceSpec/ManifestSource/S3ManifestStoreRuntimeView'
import { isFieldRuntime } from '../../K8sServiceSpecHelper'
import { isFieldfromTriggerTabDisabled } from '../ManifestSourceUtils'
import ManifestGitStoreRuntimeFields from '../ManifestSourceRuntimeFields/ManifestGitStoreRuntimeFields'
import css from '../../KubernetesManifests/KubernetesManifests.module.scss'

const ServerlessLambdaGitStoreRuntimeView = (props: ManifestSourceRenderProps): React.ReactElement => {
  const { template, path, manifestPath, manifest, fromTrigger, readonly, formik, stageIdentifier } = props
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()

  const isFieldDisabled = (fieldName: string): boolean => {
    // /* instanbul ignore else */
    if (readonly) {
      return true
    }
    return isFieldfromTriggerTabDisabled(
      fieldName,
      formik,
      stageIdentifier,
      manifest?.identifier as string,
      fromTrigger
    )
  }

  return (
    <Layout.Vertical
      data-name="manifest"
      key={manifest?.identifier}
      className={cx(css.inputWidth, css.layoutVerticalSpacing)}
    >
      <ManifestGitStoreRuntimeFields {...props} />

      {isFieldRuntime(`${manifestPath}.spec.store.spec.paths`, template) && (
        <div className={css.verticalSpacingInput}>
          <List
            labelClassName={css.listLabel}
            label={getString('common.git.folderPath')}
            name={`${path}.${manifestPath}.spec.store.spec.paths`}
            placeholder={getString('pipeline.manifestType.pathPlaceholder')}
            disabled={isFieldDisabled(`${manifestPath}.spec.store.spec.paths`)}
            style={{ marginBottom: 'var(--spacing-small)' }}
            expressions={expressions}
            isNameOfArrayType
            allowOnlyOne
          />
        </div>
      )}

      {isFieldRuntime(`${manifestPath}.spec.configOverridePath`, template) && (
        <div className={css.verticalSpacingInput}>
          <FormInput.MultiTextInput
            disabled={isFieldDisabled(`${manifestPath}.spec.configOverridePath`)}
            multiTextInputProps={{ expressions, allowableTypes: props.allowableTypes }}
            label={getString('pipeline.manifestType.serverlessConfigFilePath')}
            placeholder={getString('pipeline.manifestType.serverlessConfigFilePathPlaceholder')}
            name={`${path}.${manifestPath}.spec.configOverridePath`}
          />
        </div>
      )}
    </Layout.Vertical>
  )
}

export class ServerlessAwsLambdaManifestSource extends ManifestSourceBase<ManifestSourceRenderProps> {
  protected manifestType = ManifestDataType.ServerlessAwsLambda

  renderContent(props: ManifestSourceRenderProps): JSX.Element | null {
    if (!props.isManifestsRuntime) {
      return null
    }

    const manifestStoreType = get(props.template, `${props.manifestPath}.spec.store.type`, null)
    if (manifestStoreType === ManifestStoreMap.S3) {
      return <S3ManifestStoreRuntimeView {...props} pathFieldlabel="fileFolderPathText" />
    }

    return <ServerlessLambdaGitStoreRuntimeView {...props} />
  }
}
