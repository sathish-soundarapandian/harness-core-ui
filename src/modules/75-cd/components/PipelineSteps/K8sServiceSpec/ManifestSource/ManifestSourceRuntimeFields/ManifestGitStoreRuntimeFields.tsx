/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { defaultTo, get } from 'lodash-es'

import { useStrings } from 'framework/strings'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { ManifestToConnectorMap } from '@pipeline/components/ManifestSelection/Manifesthelper'
import { TextFieldInputSetView } from '@pipeline/components/InputSetView/TextFieldInputSetView/TextFieldInputSetView'
import type { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import type { ManifestSourceRenderProps } from '@cd/factory/ManifestSourceFactory/ManifestSourceBase'
import { isFieldRuntime } from '../../K8sServiceSpecHelper'
import { isFieldfromTriggerTabDisabled } from '../ManifestSourceUtils'
import { isExecutionTimeFieldDisabled } from '../../ArtifactSource/artifactSourceUtils'
import css from '../../KubernetesManifests/KubernetesManifests.module.scss'

const ManifestGitStoreRuntimeFields = ({
  template,
  initialValues,
  path,
  manifestPath,
  manifest,
  fromTrigger,
  allowableTypes,
  accountId,
  projectIdentifier,
  orgIdentifier,
  readonly,
  repoIdentifier,
  branch,
  formik,
  stageIdentifier,
  stepViewType
}: ManifestSourceRenderProps): React.ReactElement => {
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
    <>
      {isFieldRuntime(`${manifestPath}.spec.store.spec.connectorRef`, template) && (
        <div data-name="connectorRefContainer" className={css.verticalSpacingInput}>
          <FormMultiTypeConnectorField
            disabled={isFieldDisabled(`${manifestPath}.spec.store.spec.connectorRef`)}
            name={`${path}.${manifestPath}.spec.store.spec.connectorRef`}
            selected={get(initialValues, `${manifestPath}.spec.store.spec.connectorRef`, '')}
            label={getString('connector')}
            placeholder={''}
            setRefValue
            multiTypeProps={{
              allowableTypes,
              expressions
            }}
            width={400}
            accountIdentifier={accountId}
            projectIdentifier={projectIdentifier}
            orgIdentifier={orgIdentifier}
            type={ManifestToConnectorMap[defaultTo(manifest?.spec.store.type, '')]}
            gitScope={{
              repo: defaultTo(repoIdentifier, ''),
              branch: defaultTo(branch, ''),
              getDefaultFromOtherRepo: true
            }}
          />
        </div>
      )}

      {isFieldRuntime(`${manifestPath}.spec.store.spec.repoName`, template) && (
        <TextFieldInputSetView
          className={cx(css.fieldAndOptionsWidth, css.verticalSpacingInput)}
          name={`${path}.${manifestPath}.spec.store.spec.repoName`}
          label={getString('common.repositoryName')}
          disabled={isFieldDisabled(`${manifestPath}.spec.store.spec.repoName`)}
          multiTextInputProps={{
            expressions,
            allowableTypes
          }}
          fieldPath={`${manifestPath}.spec.store.spec.repoName`}
          template={template}
          configureOptionsProps={{
            isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType as StepViewType)
          }}
        />
      )}

      {isFieldRuntime(`${manifestPath}.spec.store.spec.branch`, template) && (
        <TextFieldInputSetView
          className={cx(css.fieldAndOptionsWidth, css.verticalSpacingInput)}
          name={`${path}.${manifestPath}.spec.store.spec.branch`}
          label={getString('pipelineSteps.deploy.inputSet.branch')}
          disabled={isFieldDisabled(`${manifestPath}.spec.store.spec.branch`)}
          multiTextInputProps={{
            expressions,
            allowableTypes
          }}
          fieldPath={`${manifestPath}.spec.store.spec.branch`}
          template={template}
          configureOptionsProps={{
            isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType as StepViewType)
          }}
        />
      )}

      {isFieldRuntime(`${manifestPath}.spec.store.spec.commitId`, template) && (
        <TextFieldInputSetView
          className={cx(css.fieldAndOptionsWidth, css.verticalSpacingInput)}
          name={`${path}.${manifestPath}.spec.store.spec.commitId`}
          label={getString('pipelineSteps.commitIdValue')}
          disabled={isFieldDisabled(`${manifestPath}.spec.store.spec.commitId`)}
          multiTextInputProps={{
            expressions,
            allowableTypes
          }}
          fieldPath={`${manifestPath}.spec.store.spec.commitId`}
          template={template}
          configureOptionsProps={{
            isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType as StepViewType)
          }}
        />
      )}
    </>
  )
}
export default ManifestGitStoreRuntimeFields
