import React from 'react'
import { FormInput, getMultiTypeFromValue, MultiTypeInputType } from '@harness/uicore'
import { defaultTo, get } from 'lodash-es'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import type { ConfigFileSourceRenderProps } from '@cd/factory/ConfigFileSourceFactory/ConfigFileSourceBase'
import { useStrings } from 'framework/strings'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { ConfigFilesToConnectorMap } from '@pipeline/components/ConfigFilesSelection/ConfigFilesHelper'
import { TextFieldInputSetView } from '@pipeline/components/InputSetView/TextFieldInputSetView/TextFieldInputSetView'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
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
      <div className={css.inputFieldLayout}>
        {isFieldRuntime(`${configFilePath}.spec.store.spec.repoName`, template) && (
          <div className={css.verticalSpacingInput}>
            <FormInput.MultiTextInput
              disabled={isFieldDisabled(`${configFilePath}.spec.store.spec.repoName`)}
              name={`${path}.${configFilePath}.spec.store.spec.repoName`}
              multiTextInputProps={{
                expressions,
                allowableTypes
              }}
              label={getString('common.repositoryName')}
            />
          </div>
        )}
        {getMultiTypeFromValue(get(formik?.values, `${path}.${configFilePath}.spec.store.spec.repoName`)) ===
          MultiTypeInputType.RUNTIME && (
          <ConfigureOptions
            className={css.configureOptions}
            style={{ alignSelf: 'center' }}
            value={get(formik?.values, `${path}.${configFilePath}.spec.store.spec.repoName`)}
            type="String"
            variableName="repoName"
            showRequiredField={false}
            showDefaultField={true}
            isExecutionTimeFieldDisabled={isExecutionTimeFieldDisabled(stepViewType as StepViewType)}
            onChange={value => {
              formik.setFieldValue(`${path}.${configFilePath}.spec.store.spec.repoName`, value)
            }}
          />
        )}
      </div>

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
          className={css.inputFieldLayout}
        />
      )}
      <div className={css.inputFieldLayout}>
        {isFieldRuntime(`${configFilePath}.spec.store.spec.commitId`, template) && (
          <div className={css.verticalSpacingInput}>
            <FormInput.MultiTextInput
              disabled={isFieldDisabled(`${configFilePath}.spec.store.spec.commitId`)}
              name={`${path}.${configFilePath}.spec.store.spec.commitId`}
              multiTextInputProps={{
                expressions,
                allowableTypes
              }}
              label={getString('pipelineSteps.commitIdValue')}
            />
          </div>
        )}
        {getMultiTypeFromValue(get(formik?.values, `${path}.${configFilePath}.spec.store.spec.commitId`)) ===
          MultiTypeInputType.RUNTIME && (
          <ConfigureOptions
            className={css.configureOptions}
            style={{ alignSelf: 'center' }}
            value={get(formik?.values, `${path}.${configFilePath}.spec.store.spec.commitId`)}
            type="String"
            variableName="commitId"
            showRequiredField={false}
            showDefaultField={true}
            isExecutionTimeFieldDisabled={isExecutionTimeFieldDisabled(stepViewType as StepViewType)}
            onChange={value => {
              formik.setFieldValue(`${path}.${configFilePath}.spec.store.spec.commitId`, value)
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
      </div>
    </>
  )
}
export default GitConfigFileStoreRuntimeFields
