/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { get, isEmpty } from 'lodash-es'
import { getMultiTypeFromValue, MultiTypeInputType, FormikForm, Text, Label, FormInput } from '@harness/uicore'
import { Color } from '@harness/design-system'
import type { FormikContextType } from 'formik'
import type {
  TerraformBackendConfigSpec,
  TerraformCliOptionFlag,
  TerraformStepConfiguration,
  TerraformVarFileWrapper
} from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import List from '@common/components/List/List'
import { TimeoutFieldInputSetView } from '@pipeline/components/InputSetView/TimeoutFieldInputSetView/TimeoutFieldInputSetView'
import { TextFieldInputSetView } from '@pipeline/components/InputSetView/TextFieldInputSetView/TextFieldInputSetView'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { isExecutionTimeFieldDisabled } from '@pipeline/utils/runPipelineUtils'
import MultiTypeFieldSelector from '@common/components/MultiTypeFieldSelector/MultiTypeFieldSelector'
import { isValueRuntimeInput } from '@common/utils/utils'
import { FormMultiTypeCheckboxField } from '@common/components'
import { TerraformData, TerraformProps, TerraformStoreTypes } from './TerraformInterfaces'
import ConfigInputs from './InputSteps/ConfigSection'
import TFRemoteSection from './InputSteps/TFRemoteSection'
import { TFMonaco } from './Editview/TFMonacoEditor'
import InlineVarFileInputSet from '../VarFile/InlineVarFileInputSet'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export default function TerraformInputStep<T extends TerraformData = TerraformData>(
  props: TerraformProps<T> & { formik?: FormikContextType<any> }
): React.ReactElement {
  const { getString } = useStrings()
  const { inputSetData, readonly, path, allowableTypes, onUpdate, onChange, stepViewType, formik } = props
  const { expressions } = useVariablesExpression()
  /* istanbul ignore next */
  const onUpdateRef = (arg: TerraformData): void => {
    onUpdate?.(arg as T)
  }
  /* istanbul ignore next */
  const onChangeRef = (arg: TerraformData): void => {
    onChange?.(arg as T)
  }
  const fieldPath = inputSetData?.template?.spec?.configuration ? 'configuration' : 'cloudCliConfiguration'
  const inputSetDataSpec = get(inputSetData?.template?.spec, `${fieldPath}`)
  return (
    <FormikForm>
      {getMultiTypeFromValue((inputSetData?.template as TerraformData)?.spec?.provisionerIdentifier) ===
        MultiTypeInputType.RUNTIME && (
        <TextFieldInputSetView
          name={`${path}.spec.provisionerIdentifier`}
          placeholder={getString('pipeline.terraformStep.provisionerIdentifier')}
          label={getString('pipelineSteps.provisionerIdentifier')}
          disabled={readonly}
          multiTextInputProps={{
            expressions,
            allowableTypes
          }}
          configureOptionsProps={{
            isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
          }}
          fieldPath={'spec.provisionerIdentifier'}
          template={inputSetData?.template}
          className={cx(stepCss.formGroup, stepCss.md)}
        />
      )}
      {getMultiTypeFromValue(inputSetData?.template?.timeout) === MultiTypeInputType.RUNTIME && (
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
          className={cx(stepCss.formGroup, stepCss.sm)}
        />
      )}
      <ConfigInputs {...props} onUpdate={onUpdateRef} onChange={onChangeRef} />
      {inputSetDataSpec?.spec?.varFiles?.length && (
        <Label style={{ color: Color.GREY_900, paddingBottom: 'var(--spacing-medium)' }}>
          {getString('cd.terraformVarFiles')}
        </Label>
      )}
      {inputSetDataSpec?.spec?.varFiles?.map((varFile: TerraformVarFileWrapper, index: number) => {
        if (varFile?.varFile?.type === TerraformStoreTypes.Inline) {
          return (
            <InlineVarFileInputSet<TerraformVarFileWrapper>
              readonly={readonly}
              stepViewType={stepViewType}
              allowableTypes={allowableTypes}
              varFilePath={`${path}.spec.${fieldPath}.spec.varFiles[${index}]`}
              inlineVarFile={varFile}
            />
          )
        } else if (varFile.varFile?.type === TerraformStoreTypes.Remote) {
          return (
            <TFRemoteSection
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

      {getMultiTypeFromValue((inputSetDataSpec?.spec?.backendConfig as TerraformBackendConfigSpec)?.spec?.content) ===
        MultiTypeInputType.RUNTIME && (
        <div
          className={cx(stepCss.formGroup, stepCss.md)}
          // needed to prevent the run pipeline to get triggered on pressing enter within TFMonaco editor
          onKeyDown={e => {
            e.stopPropagation()
          }}
        >
          <MultiTypeFieldSelector
            name={`${path}.spec.${fieldPath}.spec.backendConfig.spec.content`}
            label={getString('cd.backEndConfig')}
            defaultValueToReset=""
            allowedTypes={allowableTypes}
            skipRenderValueInExpressionLabel
            disabled={readonly}
            expressionRender={() => {
              /* istanbul ignore next */
              return (
                <TFMonaco
                  name={`${path}.spec.${fieldPath}.spec.backendConfig.spec.content`}
                  formik={formik!}
                  expressions={expressions}
                  title={getString('tagsLabel')}
                />
              )
            }}
          >
            <TFMonaco
              name={`${path}.spec.${fieldPath}.spec.backendConfig.spec.content`}
              formik={formik!}
              expressions={expressions}
              title={getString('tagsLabel')}
            />
          </MultiTypeFieldSelector>
        </div>
      )}

      <ConfigInputs {...props} isBackendConfig={true} onUpdate={onUpdateRef} onChange={onChangeRef} />

      {getMultiTypeFromValue(inputSetDataSpec?.spec?.targets as string) === MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <List
            name={`${path}.spec.${fieldPath}.spec.targets`}
            label={<Text style={{ display: 'flex', alignItems: 'center' }}>{getString('pipeline.targets.title')}</Text>}
            disabled={readonly}
            style={{ marginBottom: 'var(--spacing-small)' }}
            expressions={expressions}
            isNameOfArrayType
          />
        </div>
      )}

      {isValueRuntimeInput((inputSetDataSpec as TerraformStepConfiguration)?.skipRefreshCommand) && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <FormMultiTypeCheckboxField
            name={`${isEmpty(inputSetData?.path) ? '' : `${inputSetData?.path}.`}spec.configuration.skipRefreshCommand`}
            label={getString('cd.skipRefreshCommand')}
            multiTypeTextbox={{ expressions, allowableTypes }}
            enableConfigureOptions={true}
            configureOptionsProps={{
              isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
            }}
          />
        </div>
      )}

      {inputSetDataSpec?.commandFlags?.map((terraformCommandFlag: TerraformCliOptionFlag, terraformFlagIdx: number) => {
        if (
          isValueRuntimeInput(get(inputSetData?.template, `spec.${fieldPath}.commandFlags[${terraformFlagIdx}].flag`))
        ) {
          return (
            <div className={cx(stepCss.formGroup, stepCss.md)} key={terraformFlagIdx}>
              <FormInput.MultiTextInput
                name={`${
                  isEmpty(inputSetData?.path) ? '' : `${inputSetData?.path}.`
                }spec.${fieldPath}.commandFlags[${terraformFlagIdx}].flag`}
                multiTextInputProps={{
                  expressions,
                  allowableTypes
                }}
                label={`${terraformCommandFlag.commandType}: ${getString('flag')}`}
              />
            </div>
          )
        }
      })}
    </FormikForm>
  )
}
