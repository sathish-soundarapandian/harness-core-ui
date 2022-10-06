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
import List from '@common/components/List/List'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import type { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { isFieldRuntime } from '../../K8sServiceSpecHelper'
import { isFieldfromTriggerTabDisabled } from '../ManifestSourceUtils'
import ManifestGitStoreRuntimeFields from '../ManifestSourceRuntimeFields/ManifestGitStoreRuntimeFields'
import ManifestCommonRuntimeFields from '../ManifestSourceRuntimeFields/ManifestCommonRuntimeFields'
import { isExecutionTimeFieldDisabled } from '../../ArtifactSource/artifactSourceUtils'
import css from '../../KubernetesManifests/KubernetesManifests.module.scss'

const Content = (props: ManifestSourceRenderProps): React.ReactElement => {
  const { template, path, manifestPath, manifest, fromTrigger, allowableTypes, readonly, formik, stageIdentifier } =
    props
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
      <ManifestCommonRuntimeFields {...props} />
      <div className={css.inputFieldLayout}>
        {isFieldRuntime(`${manifestPath}.spec.store.spec.paths`, template) && (
          <div className={css.verticalSpacingInput}>
            <FormInput.MultiTextInput
              disabled={isFieldDisabled(`${manifestPath}.spec.store.spec.paths`)}
              name={`${path}.${manifestPath}.spec.store.spec.paths`}
              multiTextInputProps={{
                expressions,
                allowableTypes
              }}
              label={getString('pipeline.manifestType.osTemplatePath')}
              placeholder={getString('pipeline.manifestType.osTemplatePathPlaceHolder')}
            />
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
        {isFieldRuntime(`${manifestPath}.spec.paramsPaths`, template) && (
          <div className={css.verticalSpacingInput}>
            <List
              labelClassName={css.listLabel}
              label={getString('pipeline.manifestType.paramsYamlPath')}
              name={`${path}.${manifestPath}.spec.paramsPaths`}
              placeholder={getString('pipeline.manifestType.manifestPathPlaceholder')}
              disabled={isFieldDisabled(`${manifestPath}.spec.paramsPaths`)}
              style={{ marginBottom: 'var(--spacing-small)' }}
              expressions={expressions}
              isNameOfArrayType
            />
          </div>
        )}
        {getMultiTypeFromValue(get(formik?.values, `${path}.${manifestPath}.spec.paramsPaths`)) ===
          MultiTypeInputType.RUNTIME && (
          <ConfigureOptions
            className={css.configureOptions}
            style={{ alignSelf: 'center' }}
            value={get(formik?.values, `${path}.${manifestPath}.spec.paramsPaths`)}
            type="String"
            variableName="paramsPaths"
            showRequiredField={false}
            showDefaultField={true}
            isExecutionTimeFieldDisabled={isExecutionTimeFieldDisabled(props.stepViewType as StepViewType)}
            showAdvanced={true}
            onChange={value => {
              formik.setFieldValue(`${path}.${manifestPath}.spec.paramsPaths`, value)
            }}
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
            showAdvanced={true}
            onChange={value => {
              formik.setFieldValue(`${path}.${manifestPath}.spec.skipResourceVersioning`, value)
            }}
          />
        )}
      </div>
    </Layout.Vertical>
  )
}

export class OpenshiftTemplateManifestSource extends ManifestSourceBase<ManifestSourceRenderProps> {
  protected manifestType = ManifestDataType.OpenshiftTemplate

  renderContent(props: ManifestSourceRenderProps): JSX.Element | null {
    if (!props.isManifestsRuntime) {
      return null
    }

    return <Content {...props} />
  }
}
