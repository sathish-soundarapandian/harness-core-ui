/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { isEmpty } from 'lodash-es'
import { FormikForm, Label, Text, FormInput, Container } from '@harness/uicore'
import { Color } from '@harness/design-system'
import type { FormikContextType } from 'formik'
import { useStrings } from 'framework/strings'
import List from '@common/components/List/List'
import { MonacoTextField } from '@common/components/MonacoTextField/MonacoTextField'
import MultiTypeFieldSelector from '@common/components/MultiTypeFieldSelector/MultiTypeFieldSelector'
import { isValueRuntimeInput } from '@common/utils/utils'
import { TimeoutFieldInputSetView } from '@pipeline/components/InputSetView/TimeoutFieldInputSetView/TimeoutFieldInputSetView'
import { TextFieldInputSetView } from '@pipeline/components/InputSetView/TextFieldInputSetView/TextFieldInputSetView'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { isExecutionTimeFieldDisabled } from '@pipeline/utils/runPipelineUtils'
import type { TerragruntData, TerragruntProps } from '../TerragruntInterface'
import ConfigInputs from './ConfigSection'
import { TerraformStoreTypes } from '../../Terraform/TerraformInterfaces'
import TgRemoteSection from './TGRemoteSection'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export default function TerragruntInputStep<T extends TerragruntData = TerragruntData>(
  props: TerragruntProps<T> & { formik?: FormikContextType<any> }
): React.ReactElement {
  const { getString } = useStrings()
  const { inputSetData, readonly, path, allowableTypes, stepViewType, onUpdate, onChange } = props
  const { expressions } = useVariablesExpression()
  const config = inputSetData?.template?.spec?.configuration
  /* istanbul ignore next */
  const onUpdateRef = (arg: TerragruntData): void => {
    onUpdate?.(arg as T)
  }
  /* istanbul ignore next */
  const onChangeRef = (arg: TerragruntData): void => {
    onChange?.(arg as T)
  }
  return (
    <FormikForm>
      {isValueRuntimeInput(inputSetData?.template?.timeout) && (
        <div className={cx(stepCss.formGroup, stepCss.sm)}>
          <TimeoutFieldInputSetView
            label={getString('pipelineSteps.timeoutLabel')}
            name={`${isEmpty(inputSetData?.path) ? '' : `${inputSetData?.path}.`}timeout`}
            disabled={readonly}
            multiTypeDurationProps={{
              configureOptionsProps: {
                isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
              },
              allowableTypes,
              expressions,
              disabled: readonly
            }}
            fieldPath={'timeout'}
            template={inputSetData?.template}
          />
        </div>
      )}
      {isValueRuntimeInput((inputSetData?.template as TerragruntData)?.spec?.provisionerIdentifier) && (
        <TextFieldInputSetView
          name={`${path}.spec.provisionerIdentifier`}
          placeholder={getString('pipeline.terraformStep.provisionerIdentifier')}
          label={getString('pipelineSteps.provisionerIdentifier')}
          disabled={readonly}
          className={cx(stepCss.formGroup, stepCss.md)}
          multiTextInputProps={{
            expressions,
            allowableTypes
          }}
          configureOptionsProps={{
            isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
          }}
          fieldPath={'spec.provisionerIdentifier'}
          template={inputSetData?.template}
        />
      )}

      {isValueRuntimeInput(config?.spec?.moduleConfig?.path) && (
        <TextFieldInputSetView
          placeholder={'Enter path'}
          label={getString('common.path')}
          name={`${path}.spec.configuration.spec.moduleConfig.path`}
          disabled={readonly}
          className={cx(stepCss.formGroup, stepCss.md)}
          template={inputSetData?.template}
          fieldPath={'spec.configuration.spec.moduleConfig.path'}
          multiTextInputProps={{
            expressions,
            allowableTypes
          }}
        />
      )}

      <ConfigInputs {...props} onUpdate={onUpdateRef} onChange={onChangeRef} />
      {config?.spec?.varFiles?.length && (
        <Label style={{ color: Color.GREY_900, paddingBottom: 'var(--spacing-medium)' }}>
          {getString('cd.terraformVarFiles')}
        </Label>
      )}
      {config?.spec?.varFiles?.map((varFile: any, index) => {
        if (varFile?.varFile?.type === TerraformStoreTypes.Inline) {
          return (
            <React.Fragment key={`${path}.spec.configuration.spec.varFiles[${index}]`}>
              <Container flex width={120} padding={{ bottom: 'small' }}>
                <Text font={{ weight: 'bold' }}>{getString('cd.varFile')}:</Text>
                {varFile?.varFile?.identifier}
              </Container>

              {isValueRuntimeInput(varFile?.varFile?.spec?.content) && (
                <div className={cx(stepCss.formGroup, stepCss.md)}>
                  <FormInput.MultiTextInput
                    name={`${path}.spec.configuration.spec.varFiles[${index}].varFile.spec.content`}
                    label={getString('pipelineSteps.content')}
                    multiTextInputProps={{
                      expressions,
                      allowableTypes
                    }}
                  />
                </div>
              )}
            </React.Fragment>
          )
        } else if (varFile.varFile?.type === TerraformStoreTypes.Remote) {
          return (
            <TgRemoteSection
              remoteVar={varFile}
              index={index}
              {...props}
              onUpdate={onUpdateRef}
              onChange={onChangeRef}
            />
          )
        }
        return <></>
      })}

      {isValueRuntimeInput(config?.spec?.workspace) && (
        <TextFieldInputSetView
          name={`${path}.spec.configuration.spec.workspace`}
          placeholder={getString('pipeline.terraformStep.workspace')}
          label={getString('pipelineSteps.workspace')}
          disabled={readonly}
          multiTextInputProps={{
            expressions,
            allowableTypes
          }}
          configureOptionsProps={{
            isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
          }}
          template={inputSetData?.template}
          className={cx(stepCss.formGroup, stepCss.md)}
          fieldPath={`spec.configuration.spec.workspace`}
        />
      )}

      {isValueRuntimeInput(config?.spec?.backendConfig?.spec?.content) && (
        <div
          className={cx(stepCss.formGroup, stepCss.md)}
          onKeyDown={e => {
            e.stopPropagation()
          }}
        >
          <MultiTypeFieldSelector
            name={`${path}.spec.configuration.spec.backendConfig.spec.content`}
            label={getString('cd.backEndConfig')}
            defaultValueToReset=""
            allowedTypes={allowableTypes}
            skipRenderValueInExpressionLabel
            disabled={readonly}
            expressionRender={
              /* istanbul ignore next */ () => {
                return (
                  <MonacoTextField
                    name={`${path}.spec.configuration.backendConfig.spec.content`}
                    expressions={expressions}
                    height={300}
                    disabled={readonly}
                    fullScreenAllowed
                    fullScreenTitle={getString('tagsLabel')}
                  />
                )
              }
            }
          >
            <MonacoTextField
              name={`${path}.spec.configuration.backendConfig.spec.content`}
              expressions={expressions}
              height={300}
              fullScreenAllowed
              fullScreenTitle={getString('tagsLabel')}
            />
          </MultiTypeFieldSelector>
        </div>
      )}
      <ConfigInputs {...props} isBackendConfig={true} onUpdate={onUpdateRef} onChange={onChangeRef} />
      {isValueRuntimeInput(config?.spec?.targets as string) && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <List
            name={`${path}.spec.configuration.spec.targets`}
            label={<Text style={{ display: 'flex', alignItems: 'center' }}>{getString('pipeline.targets.title')}</Text>}
            disabled={readonly}
            style={{ marginBottom: 'var(--spacing-small)' }}
            expressions={expressions}
            isNameOfArrayType
          />
        </div>
      )}
    </FormikForm>
  )
}
