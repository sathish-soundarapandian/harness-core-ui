/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { FormInput, getMultiTypeFromValue, Layout, MultiTypeInputType } from '@harness/uicore'
import { get } from 'lodash-es'
import { ManifestDataType } from '@pipeline/components/ManifestSelection/Manifesthelper'
import { ManifestSourceBase, ManifestSourceRenderProps } from '@cd/factory/ManifestSourceFactory/ManifestSourceBase'
import { useStrings } from 'framework/strings'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { FormMultiTypeCheckboxField } from '@common/components'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import type { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { FileUsage } from '@filestore/interfaces/FileStore'
import { isFieldRuntime } from '../../K8sServiceSpecHelper'
import { isFieldfromTriggerTabDisabled } from '../ManifestSourceUtils'
import ManifestGitStoreRuntimeFields from '../ManifestSourceRuntimeFields/ManifestGitStoreRuntimeFields'
import ManifestCommonRuntimeFields from '../ManifestSourceRuntimeFields/ManifestCommonRuntimeFields'
import { isExecutionTimeFieldDisabled } from '../../ArtifactSource/artifactSourceUtils'
import MultiTypeListOrFileSelectList from '../MultiTypeListOrFileSelectList'
import css from '../../KubernetesManifests/KubernetesManifests.module.scss'

const Content = (props: ManifestSourceRenderProps): React.ReactElement => {
  const {
    template,
    path,
    manifestPath,
    manifest,
    fromTrigger,
    allowableTypes,
    readonly,
    formik,
    stageIdentifier,
    fileUsage = FileUsage.MANIFEST_FILE
  } = props
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

  const hasKustomizeYamlFolderPath = !!manifest?.spec?.overlayConfiguration?.kustomizeYamlFolderPath

  return (
    <Layout.Vertical
      data-name="manifest"
      key={manifest?.identifier}
      className={cx(css.inputWidth, css.layoutVerticalSpacing)}
    >
      <ManifestGitStoreRuntimeFields {...props} />
      <ManifestCommonRuntimeFields {...props} fileUsage={fileUsage} />
      <div className={css.inputFieldLayout}>
        {isFieldRuntime(`${manifestPath}.spec.store.spec.folderPath`, template) && (
          <div className={css.verticalSpacingInput}>
            <FormInput.MultiTextInput
              disabled={isFieldDisabled(`${manifestPath}.spec.store.spec.folderPath`)}
              name={`${path}.${manifestPath}.spec.store.spec.folderPath`}
              multiTextInputProps={{
                expressions,
                allowableTypes
              }}
              label={
                hasKustomizeYamlFolderPath
                  ? getString('pipeline.manifestType.kustomizeBasePath')
                  : getString('pipeline.manifestType.kustomizeFolderPath')
              }
            />
          </div>
        )}
        {getMultiTypeFromValue(get(formik?.values, `${path}.${manifestPath}.spec.store.spec.folderPath`)) ===
          MultiTypeInputType.RUNTIME && (
          <ConfigureOptions
            className={css.configureOptions}
            style={{ alignSelf: 'center' }}
            value={get(formik?.values, `${path}.${manifestPath}.spec.store.spec.folderPath`)}
            type="String"
            variableName="folderPath"
            showRequiredField={false}
            showDefaultField={true}
            isExecutionTimeFieldDisabled={isExecutionTimeFieldDisabled(props.stepViewType as StepViewType)}
            onChange={value => {
              formik.setFieldValue(`${path}.${manifestPath}.spec.store.spec.folderPath`, value)
            }}
            isReadonly={isFieldDisabled(`${manifestPath}.spec.store.spec.folderPath`)}
          />
        )}
      </div>
      <div className={css.inputFieldLayout}>
        {isFieldRuntime(`${manifestPath}.spec.pluginPath`, template) && (
          <div className={css.verticalSpacingInput}>
            <FormInput.MultiTextInput
              disabled={isFieldDisabled(`${manifestPath}.spec.pluginPath`)}
              name={`${path}.${manifestPath}.spec.pluginPath`}
              multiTextInputProps={{
                expressions,
                allowableTypes
              }}
              label={getString('pluginPath')}
            />
          </div>
        )}
        {getMultiTypeFromValue(get(formik?.values, `${path}.${manifestPath}.spec.pluginPath`)) ===
          MultiTypeInputType.RUNTIME && (
          <ConfigureOptions
            className={css.configureOptions}
            style={{ alignSelf: 'center' }}
            value={get(formik?.values, `${path}.${manifestPath}.spec.pluginPath`)}
            type="String"
            variableName="pluginPath"
            showRequiredField={false}
            showDefaultField={true}
            isExecutionTimeFieldDisabled={isExecutionTimeFieldDisabled(props.stepViewType as StepViewType)}
            onChange={value => {
              formik.setFieldValue(`${path}.${manifestPath}.spec.pluginPath`, value)
            }}
            isReadonly={isFieldDisabled(`${manifestPath}.spec.pluginPath`)}
          />
        )}
      </div>
      <div className={css.inputFieldLayout}>
        {isFieldRuntime(`${manifestPath}.spec.overlayConfiguration`, template) && (
          <div className={css.verticalSpacingInput}>
            <FormInput.MultiTextInput
              disabled={isFieldDisabled(`${manifestPath}.spec.overlayConfiguration`)}
              name={`${path}.${manifestPath}.spec.overlayConfiguration`}
              multiTextInputProps={{
                expressions,
                allowableTypes
              }}
              label={getString('pipeline.manifestType.kustomizeYamlFolderPath')}
            />
          </div>
        )}
        {getMultiTypeFromValue(get(formik?.values, `${path}.${manifestPath}.spec.overlayConfiguration`)) ===
          MultiTypeInputType.RUNTIME && (
          <ConfigureOptions
            className={css.configureOptions}
            style={{ alignSelf: 'center' }}
            value={get(formik?.values, `${path}.${manifestPath}.spec.overlayConfiguration`)}
            type="String"
            variableName="overlayConfiguration"
            showRequiredField={false}
            showDefaultField={true}
            isExecutionTimeFieldDisabled={isExecutionTimeFieldDisabled(props.stepViewType as StepViewType)}
            onChange={value => {
              formik.setFieldValue(`${path}.${manifestPath}.spec.overlayConfiguration`, value)
            }}
            isReadonly={isFieldDisabled(`${manifestPath}.spec.overlayConfiguration`)}
          />
        )}
      </div>
      <div className={css.inputFieldLayout}>
        {isFieldRuntime(`${manifestPath}.spec.patchesPaths`, template) && (
          <div className={css.verticalSpacingInput}>
            <MultiTypeListOrFileSelectList
              allowableTypes={allowableTypes}
              label={getString('pipeline.manifestTypeLabels.KustomizePatches')}
              name={`${path}.${manifestPath}.spec.patchesPaths`}
              placeholder={getString('pipeline.manifestType.manifestPathPlaceholder')}
              disabled={isFieldDisabled(`${manifestPath}.spec.patchesPaths`)}
              formik={formik}
              isNameOfArrayType
            />
          </div>
        )}
        {getMultiTypeFromValue(get(formik?.values, `${path}.${manifestPath}.spec.patchesPaths`)) ===
          MultiTypeInputType.RUNTIME && (
          <ConfigureOptions
            className={css.configureOptions}
            style={{ alignSelf: 'center' }}
            value={get(formik?.values, `${path}.${manifestPath}.spec.patchesPaths`)}
            type="String"
            variableName="patchesPaths"
            showRequiredField={false}
            showDefaultField={true}
            isExecutionTimeFieldDisabled={isExecutionTimeFieldDisabled(props.stepViewType as StepViewType)}
            onChange={value => {
              formik.setFieldValue(`${path}.${manifestPath}.spec.patchesPaths`, value)
            }}
            isReadonly={isFieldDisabled(`${manifestPath}.spec.patchesPaths`)}
          />
        )}
      </div>
      <div className={css.inputFieldLayout}>
        {isFieldRuntime(`${manifestPath}.spec.overlayConfiguration.kustomizeYamlFolderPath`, template) && (
          <div className={css.verticalSpacingInput}>
            <FormInput.MultiTextInput
              disabled={isFieldDisabled(`${manifestPath}.spec.overlayConfiguration.kustomizeYamlFolderPath`)}
              name={`${path}.${manifestPath}.spec.overlayConfiguration.kustomizeYamlFolderPath`}
              multiTextInputProps={{
                expressions,
                allowableTypes
              }}
              label={getString('pipeline.manifestType.kustomizeYamlFolderPath')}
            />
          </div>
        )}
        {getMultiTypeFromValue(
          get(formik?.values, `${path}.${manifestPath}.spec.overlayConfiguration.kustomizeYamlFolderPath`)
        ) === MultiTypeInputType.RUNTIME && (
          <ConfigureOptions
            className={css.configureOptions}
            style={{ alignSelf: 'center' }}
            value={get(formik?.values, `${path}.${manifestPath}.spec.overlayConfiguration.kustomizeYamlFolderPath`)}
            type="String"
            variableName="kustomizeYamlFolderPath"
            showRequiredField={false}
            showDefaultField={true}
            isExecutionTimeFieldDisabled={isExecutionTimeFieldDisabled(props.stepViewType as StepViewType)}
            onChange={value => {
              formik.setFieldValue(`${path}.${manifestPath}.spec.overlayConfiguration.kustomizeYamlFolderPath`, value)
            }}
            isReadonly={isFieldDisabled(`${manifestPath}.spec.overlayConfiguration.kustomizeYamlFolderPath`)}
          />
        )}
      </div>

      <div className={css.inputFieldLayout}>
        {isFieldRuntime(`${manifestPath}.spec.enableDeclarativeRollback`, template) && (
          <div className={css.verticalSpacingInput}>
            <FormMultiTypeCheckboxField
              disabled={isFieldDisabled(`${manifestPath}.spec.enableDeclarativeRollback`)}
              name={`${path}.${manifestPath}.spec.enableDeclarativeRollback`}
              label={getString('pipeline.manifestType.enableDeclarativeRollback')}
              setToFalseWhenEmpty={true}
              multiTypeTextbox={{
                expressions,
                allowableTypes
              }}
            />
          </div>
        )}
        {getMultiTypeFromValue(get(formik?.values, `${path}.${manifestPath}.spec.enableDeclarativeRollback`)) ===
          MultiTypeInputType.RUNTIME && (
          <ConfigureOptions
            className={css.configureOptions}
            style={{ alignSelf: 'center' }}
            value={get(formik?.values, `${path}.${manifestPath}.spec.enableDeclarativeRollback`)}
            type="String"
            variableName="enableDeclarativeRollback"
            showRequiredField={false}
            showDefaultField={true}
            isExecutionTimeFieldDisabled={isExecutionTimeFieldDisabled(props.stepViewType as StepViewType)}
            onChange={value => {
              formik.setFieldValue(`${path}.${manifestPath}.spec.enableDeclarativeRollback`, value)
            }}
            isReadonly={isFieldDisabled(`${manifestPath}.spec.enableDeclarativeRollback`)}
          />
        )}
      </div>

      <div className={css.inputFieldLayout}>
        {isFieldRuntime(`${manifestPath}.spec.skipResourceVersioning`, template) && (
          <div className={css.verticalSpacingInput}>
            <FormMultiTypeCheckboxField
              disabled={isFieldDisabled(`${manifestPath}.spec.skipResourceVersioning`)}
              name={`${path}.${manifestPath}.spec.skipResourceVersioning`}
              label={getString('skipResourceVersion')}
              setToFalseWhenEmpty={true}
              multiTypeTextbox={{
                expressions,
                allowableTypes
              }}
            />
          </div>
        )}
        {getMultiTypeFromValue(get(formik?.values, `${path}.${manifestPath}.spec.skipResourceVersioning`)) ===
          MultiTypeInputType.RUNTIME && (
          <ConfigureOptions
            className={css.configureOptions}
            style={{ alignSelf: 'center' }}
            value={get(formik?.values, `${path}.${manifestPath}.spec.skipResourceVersioning`)}
            type="String"
            variableName="skipResourceVersioning"
            showRequiredField={false}
            showDefaultField={true}
            isExecutionTimeFieldDisabled={isExecutionTimeFieldDisabled(props.stepViewType as StepViewType)}
            onChange={value => {
              formik.setFieldValue(`${path}.${manifestPath}.spec.skipResourceVersioning`, value)
            }}
            isReadonly={isFieldDisabled(`${manifestPath}.spec.skipResourceVersioning`)}
          />
        )}
      </div>
    </Layout.Vertical>
  )
}

export class KustomizeManifestSource extends ManifestSourceBase<ManifestSourceRenderProps> {
  protected manifestType = ManifestDataType.Kustomize

  renderContent(props: ManifestSourceRenderProps): JSX.Element | null {
    if (!props.isManifestsRuntime) {
      return null
    }

    return <Content {...props} />
  }
}
