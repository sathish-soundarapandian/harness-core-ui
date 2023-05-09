/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { defaultTo, get } from 'lodash-es'
import cx from 'classnames'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import type { ConfigFileSourceRenderProps } from '@cd/factory/ConfigFileSourceFactory/ConfigFileSourceBase'
import { useStrings } from 'framework/strings'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { ConfigFilesToConnectorMap } from '@pipeline/components/ConfigFilesSelection/ConfigFilesHelper'
import { TextFieldInputSetView } from '@pipeline/components/InputSetView/TextFieldInputSetView/TextFieldInputSetView'
import type { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { isFieldRuntime } from '@cd/components/PipelineSteps/K8sServiceSpec/K8sServiceSpecHelper'
import { isFieldfromTriggerTabDisabled } from '@cd/components/PipelineSteps/K8sServiceSpec/ArtifactSource/artifactSourceUtils'
import MultiTypeListOrFileSelectList from '@cd/components/PipelineSteps/K8sServiceSpec/ManifestSource/MultiTypeListOrFileSelectList'
import { isExecutionTimeFieldDisabled } from '@pipeline/utils/runPipelineUtils'
import css from './GitConfigFileRuntimeField.module.scss'

const GitConfigFileStoreRuntimeFields = (props: ConfigFileSourceRenderProps): React.ReactElement => {
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const {
    template,
    initialValues,
    path,
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
    stepViewType,
    configFilePath,
    configFile
  } = props

  const isFieldDisabled = (fieldName: string): boolean => {
    // /* instanbul ignore else */
    if (readonly) {
      return true
    }
    return isFieldfromTriggerTabDisabled(fieldName, formik, stageIdentifier, fromTrigger)
  }
  return (
    <>
      {isFieldRuntime(`${configFilePath}.spec.store.spec.connectorRef`, template) && (
        <div data-name="connectorRefContainer" className={css.verticalSpacingInput}>
          <FormMultiTypeConnectorField
            disabled={isFieldDisabled(`${configFilePath}.spec.store.spec.connectorRef`)}
            name={`${path}.${configFilePath}.spec.store.spec.connectorRef`}
            selected={get(initialValues, `${configFilePath}.spec.store.spec.connectorRef`, '')}
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
            type={ConfigFilesToConnectorMap[defaultTo(configFile?.spec.store.type, '')]}
            gitScope={{
              repo: defaultTo(repoIdentifier, ''),
              branch: defaultTo(branch, ''),
              getDefaultFromOtherRepo: true
            }}
          />
        </div>
      )}
      {isFieldRuntime(`${configFilePath}.spec.store.spec.repoName`, template) && (
        <TextFieldInputSetView
          className={cx(css.fieldAndOptionsWidth, css.verticalSpacingInput)}
          name={`${path}.${configFilePath}.spec.store.spec.repoName`}
          label={getString('common.repositoryName')}
          disabled={isFieldDisabled(`${configFilePath}.spec.store.spec.repoName`)}
          multiTextInputProps={{
            expressions,
            allowableTypes
          }}
          fieldPath={`${configFilePath}.spec.store.spec.repoName`}
          template={template}
          configureOptionsProps={{
            isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType as StepViewType)
          }}
        />
      )}

      {isFieldRuntime(`${configFilePath}.spec.store.spec.branch`, template) && (
        <TextFieldInputSetView
          disabled={isFieldDisabled(`${configFilePath}.spec.store.spec.branch`)}
          name={`${path}.${configFilePath}.spec.store.spec.branch`}
          multiTextInputProps={{
            expressions,
            allowableTypes
          }}
          label={getString('pipelineSteps.deploy.inputSet.branch')}
          fieldPath={`${configFilePath}.spec.store.spec.branch`}
          template={template}
          className={cx(css.fieldAndOptionsWidth, css.verticalSpacingInput)}
        />
      )}
      {isFieldRuntime(`${configFilePath}.spec.store.spec.commitId`, template) && (
        <TextFieldInputSetView
          className={cx(css.fieldAndOptionsWidth, css.verticalSpacingInput)}
          name={`${path}.${configFilePath}.spec.store.spec.commitId`}
          label={getString('pipelineSteps.commitIdValue')}
          disabled={isFieldDisabled(`${configFilePath}.spec.store.spec.commitId`)}
          multiTextInputProps={{
            expressions,
            allowableTypes
          }}
          fieldPath={`${configFilePath}.spec.store.spec.commitId`}
          template={template}
          configureOptionsProps={{
            isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType as StepViewType)
          }}
        />
      )}
      {isFieldRuntime(`${configFilePath}.spec.store.spec.paths`, template) && (
        <div className={css.verticalSpacingInput}>
          <MultiTypeListOrFileSelectList
            allowableTypes={allowableTypes}
            name={`${path}.${configFilePath}.spec.store.spec.paths`}
            label={getString('pipeline.manifestType.pathPlaceholder')}
            placeholder={getString('pipeline.manifestType.pathPlaceholder')}
            disabled={isFieldDisabled(`${configFilePath}.spec.store.spec.paths`)}
            formik={formik}
            isNameOfArrayType
          />
        </div>
      )}
    </>
  )
}
export default GitConfigFileStoreRuntimeFields
