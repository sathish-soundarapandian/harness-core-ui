/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { get, isEmpty } from 'lodash-es'
import List from '@common/components/List/List'
import { getMultiTypeFromValue, MultiTypeInputType, FormikForm, Label, Color, Text } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import { TimeoutFieldInputSetView } from '@pipeline/components/InputSetView/TimeoutFieldInputSetView/TimeoutFieldInputSetView'
import { TextFieldInputSetView } from '@pipeline/components/InputSetView/TextFieldInputSetView/TextFieldInputSetView'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { isExecutionTimeFieldDisabled } from '@pipeline/utils/runPipelineUtils'
import ConfigInputs from '../Terraform/InputSteps/ConfigSection'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
import type { TerragruntData, TerragruntProps } from './TerragruntInterface'
import MultiTypeFieldSelector from '@common/components/MultiTypeFieldSelector/MultiTypeFieldSelector'
import { TFMonaco } from '../Terraform/Editview/TFMonacoEditor'
import type { FormikContextType } from 'formik'

export default function TerragruntInputStep<T extends TerragruntData = TerragruntData>(
  props: TerragruntProps<T> & { formik?: FormikContextType<any> }
): React.ReactElement {
  const { getString } = useStrings()
  const { inputSetData, readonly, path, allowableTypes, stepViewType, onUpdate, onChange, formik } = props
  const { expressions } = useVariablesExpression()
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
      {getMultiTypeFromValue(inputSetData?.template?.timeout) === MultiTypeInputType.RUNTIME && (
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
      {getMultiTypeFromValue((inputSetData?.template as TerragruntData)?.spec?.provisionerIdentifier) ===
        MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
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
          />
        </div>
      )}
      {getMultiTypeFromValue(get(inputSetData?.template, 'spec.configuration.spec.moduleConfig.path')) ===
        MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <TextFieldInputSetView
            placeholder={'Enter path'}
            label={'Path'}
            name={`${path}.spec.configuration.spec.moduleConfig.path`}
            disabled={readonly}
            template={inputSetData?.template}
            fieldPath={'spec.configuration.spec.moduleConfig.path'}
            multiTextInputProps={{
              expressions,
              allowableTypes
            }}
          />
        </div>
      )}
      <ConfigInputs {...props} onUpdate={onUpdateRef} onChange={onChangeRef} />
      {inputSetData?.template?.spec?.configuration?.spec?.varFiles?.length && (
        <Label style={{ color: Color.GREY_900, paddingBottom: 'var(--spacing-medium)' }}>
          {getString('cd.terraformVarFiles')}
        </Label>
      )}

      {getMultiTypeFromValue(get(inputSetData?.template, 'spec.configuration.spec.backendConfig.spec.content')) ===
        MultiTypeInputType.RUNTIME && (
        <div
          className={cx(stepCss.formGroup, stepCss.md)}
          // needed to prevent the run pipeline to get triggered on pressing enter within TFMonaco editor
          onKeyDown={e => {
            e.stopPropagation()
          }}
        >
          <MultiTypeFieldSelector
            name={`${path}.spec.configuration.backendConfig.spec.content`}
            label={getString('cd.backEndConfig')}
            defaultValueToReset=""
            allowedTypes={allowableTypes}
            skipRenderValueInExpressionLabel
            disabled={readonly}
            expressionRender={() => {
              /* istanbul ignore next */
              return (
                <TFMonaco
                  name={`${path}.spec.configuration.backendConfig.spec.content`}
                  formik={formik!}
                  expressions={expressions}
                  title={getString('tagsLabel')}
                />
              )
            }}
          >
            <TFMonaco
              name={`${path}.spec.configuration.backendConfig.spec.content`}
              formik={formik!}
              expressions={expressions}
              title={getString('tagsLabel')}
            />
          </MultiTypeFieldSelector>
        </div>
      )}
      <ConfigInputs {...props} isBackendConfig={true} onUpdate={onUpdateRef} onChange={onChangeRef} />
      {getMultiTypeFromValue(inputSetData?.template?.spec?.configuration?.spec?.targets as string) ===
        MultiTypeInputType.RUNTIME && (
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
