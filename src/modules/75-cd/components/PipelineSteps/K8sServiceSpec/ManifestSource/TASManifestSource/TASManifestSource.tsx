/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { getMultiTypeFromValue, Layout, MultiTypeInputType } from '@harness/uicore'
import { get } from 'lodash-es'
import { ManifestDataType, ManifestStoreMap } from '@pipeline/components/ManifestSelection/Manifesthelper'
import { ManifestSourceBase, ManifestSourceRenderProps } from '@cd/factory/ManifestSourceFactory/ManifestSourceBase'
import { useStrings } from 'framework/strings'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import List from '@common/components/List/List'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import type { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { SELECT_FILES_TYPE } from '@filestore/utils/constants'
import { FileSelectList } from '@filestore/components/FileStoreList/FileStoreList'
import { isFieldRuntime } from '../../K8sServiceSpecHelper'
import { isFieldfromTriggerTabDisabled } from '../ManifestSourceUtils'
import ManifestGitStoreRuntimeFields from '../ManifestSourceRuntimeFields/ManifestGitStoreRuntimeFields'
import CustomRemoteManifestRuntimeFields from '../ManifestSourceRuntimeFields/CustomRemoteManifestRuntimeFields'
import { isExecutionTimeFieldDisabled } from '../../ArtifactSource/artifactSourceUtils'
import css from '../../KubernetesManifests/KubernetesManifests.module.scss'

const Content = (props: ManifestSourceRenderProps): React.ReactElement => {
  const { template, path, manifestPath, manifest, fromTrigger, readonly, formik, stageIdentifier } = props
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const manifestStoreType = get(template, `${manifestPath}.spec.store.type`, null)
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
      <CustomRemoteManifestRuntimeFields {...props} />
      <div className={css.inputFieldLayout}>
        {isFieldRuntime(`${manifestPath}.spec.store.spec.files`, template) && (
          <div className={css.verticalSpacingInput}>
            <FileSelectList
              labelClassName={css.listLabel}
              label={getString('fileFolderPathText')}
              name={`${path}.${manifestPath}.spec.store.spec.files`}
              placeholder={getString('pipeline.manifestType.manifestPathPlaceholder')}
              disabled={isFieldDisabled(`${manifestPath}.spec.store.spec.files`)}
              style={{ marginBottom: 'var(--spacing-small)' }}
              expressions={expressions}
              isNameOfArrayType
              type={SELECT_FILES_TYPE.FILE_STORE}
              formik={formik}
              allowOnlyOne
            />
          </div>
        )}
        {isFieldRuntime(`${manifestPath}.spec.store.spec.paths`, template) && (
          <div className={css.verticalSpacingInput}>
            {manifestStoreType === ManifestStoreMap.Harness ? (
              <FileSelectList
                labelClassName={css.listLabel}
                label={getString('fileFolderPathText')}
                name={`${path}.${manifestPath}.spec.store.spec.paths`}
                placeholder={getString('pipeline.manifestType.manifestPathPlaceholder')}
                disabled={isFieldDisabled(`${manifestPath}.spec.store.spec.paths`)}
                style={{ marginBottom: 'var(--spacing-small)' }}
                expressions={expressions}
                isNameOfArrayType
                type={SELECT_FILES_TYPE.FILE_STORE}
                formik={formik}
                allowOnlyOne
              />
            ) : (
              <List
                labelClassName={css.listLabel}
                label={getString('fileFolderPathText')}
                name={`${path}.${manifestPath}.spec.store.spec.paths`}
                placeholder={getString('pipeline.manifestType.manifestPathPlaceholder')}
                disabled={isFieldDisabled(`${manifestPath}.spec.store.spec.paths`)}
                style={{ marginBottom: 'var(--spacing-small)' }}
                expressions={expressions}
                isNameOfArrayType
                allowOnlyOne
              />
            )}
          </div>
        )}
        {getMultiTypeFromValue(get(formik?.values, `${path}.${manifestPath}.spec.store.spec.paths`)) ===
          MultiTypeInputType.RUNTIME && (
          <ConfigureOptions
            className={css.configureOptions}
            style={{ alignSelf: 'center' }}
            value={get(formik?.values, `${path}.${manifestPath}.spec.store.spec.paths`)}
            type="String"
            variableName="paths"
            showRequiredField={false}
            showDefaultField={true}
            isExecutionTimeFieldDisabled={isExecutionTimeFieldDisabled(props.stepViewType as StepViewType)}
            showAdvanced={true}
            onChange={value => {
              formik.setFieldValue(`${path}.${manifestPath}.spec.store.spec.paths`, value)
            }}
          />
        )}
      </div>

      <div className={css.inputFieldLayout}>
        {isFieldRuntime(`${manifestPath}.spec.autoScalerPath`, template) && (
          <div className={css.verticalSpacingInput}>
            {manifestStoreType === ManifestStoreMap.Harness ? (
              <FileSelectList
                labelClassName={css.listLabel}
                label={getString('pipeline.manifestType.autoScalerYAMLPath')}
                name={`${path}.${manifestPath}.spec.autoScalerPath`}
                placeholder={getString('pipeline.manifestType.manifestPathPlaceholder')}
                disabled={isFieldDisabled(`${manifestPath}.spec.autoScalerPath`)}
                style={{ marginBottom: 'var(--spacing-small)' }}
                expressions={expressions}
                isNameOfArrayType
                type={SELECT_FILES_TYPE.FILE_STORE}
                formik={formik}
                allowOnlyOne
              />
            ) : (
              <List
                labelClassName={css.listLabel}
                label={getString('pipeline.manifestType.autoScalerYAMLPath')}
                name={`${path}.${manifestPath}.spec.autoScalerPath`}
                placeholder={getString('pipeline.manifestType.manifestPathPlaceholder')}
                disabled={isFieldDisabled(`${manifestPath}.spec.autoScalerPath`)}
                style={{ marginBottom: 'var(--spacing-small)' }}
                expressions={expressions}
                isNameOfArrayType
                allowOnlyOne
              />
            )}
          </div>
        )}
        {getMultiTypeFromValue(get(formik?.values, `${path}.${manifestPath}.spec.autoScalerPath`)) ===
          MultiTypeInputType.RUNTIME && (
          <ConfigureOptions
            className={css.configureOptions}
            style={{ alignSelf: 'center' }}
            value={get(formik?.values, `${path}.${manifestPath}.spec.autoScalerPath`)}
            type="String"
            variableName="autoScalerPath"
            showRequiredField={false}
            showDefaultField={true}
            isExecutionTimeFieldDisabled={isExecutionTimeFieldDisabled(props.stepViewType as StepViewType)}
            showAdvanced={true}
            onChange={value => {
              formik.setFieldValue(`${path}.${manifestPath}.spec.autoScalerPath`, value)
            }}
          />
        )}
      </div>

      <div className={css.inputFieldLayout}>
        {isFieldRuntime(`${manifestPath}.spec.varsPaths`, template) && (
          <div className={css.verticalSpacingInput}>
            {manifestStoreType === ManifestStoreMap.Harness ? (
              <FileSelectList
                labelClassName={css.listLabel}
                label={getString('pipeline.manifestType.varsYAMLPath')}
                name={`${path}.${manifestPath}.spec.varsPaths`}
                placeholder={getString('pipeline.manifestType.manifestPathPlaceholder')}
                disabled={isFieldDisabled(`${manifestPath}.spec.varsPaths`)}
                style={{ marginBottom: 'var(--spacing-small)' }}
                expressions={expressions}
                isNameOfArrayType
                type={SELECT_FILES_TYPE.FILE_STORE}
                formik={formik}
              />
            ) : (
              <List
                labelClassName={css.listLabel}
                label={getString('pipeline.manifestType.varsYAMLPath')}
                name={`${path}.${manifestPath}.spec.varsPaths`}
                placeholder={getString('pipeline.manifestType.manifestPathPlaceholder')}
                disabled={isFieldDisabled(`${manifestPath}.spec.varsPaths`)}
                style={{ marginBottom: 'var(--spacing-small)' }}
                expressions={expressions}
                isNameOfArrayType
              />
            )}
          </div>
        )}
        {getMultiTypeFromValue(get(formik?.values, `${path}.${manifestPath}.spec.varsPaths`)) ===
          MultiTypeInputType.RUNTIME && (
          <ConfigureOptions
            className={css.configureOptions}
            style={{ alignSelf: 'center' }}
            value={get(formik?.values, `${path}.${manifestPath}.spec.varsPaths`)}
            type="String"
            variableName="varsPaths"
            showRequiredField={false}
            showDefaultField={true}
            isExecutionTimeFieldDisabled={isExecutionTimeFieldDisabled(props.stepViewType as StepViewType)}
            showAdvanced={true}
            onChange={value => {
              formik.setFieldValue(`${path}.${manifestPath}.spec.varsPaths`, value)
            }}
          />
        )}
      </div>
    </Layout.Vertical>
  )
}

export class TASManifestSource extends ManifestSourceBase<ManifestSourceRenderProps> {
  protected manifestType = ManifestDataType.TasManifest

  renderContent(props: ManifestSourceRenderProps): JSX.Element | null {
    if (!props.isManifestsRuntime) {
      return null
    }

    return <Content {...props} />
  }
}
