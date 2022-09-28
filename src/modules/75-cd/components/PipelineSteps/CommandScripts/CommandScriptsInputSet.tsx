/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { isEmpty } from 'lodash-es'
import { AllowedTypes, FormikForm, getMultiTypeFromValue, MultiTypeInputType } from '@harness/uicore'

import { useStrings } from 'framework/strings'
import { TimeoutFieldInputSetView } from '@pipeline/components/InputSetView/TimeoutFieldInputSetView/TimeoutFieldInputSetView'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import type { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { InputOutputVariablesInputSet } from '../Common/InputOutputVariablesInputSet/InputOutputVariablesInputSet'
import type { CommandScriptsData, CommandScriptsFormData } from './CommandScriptsTypes'
import { CommandListInputSet } from './CommandListInputSet'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

interface CommandScriptsInputSetProps {
  initialValues: CommandScriptsFormData
  stepViewType: StepViewType
  allowableTypes: AllowedTypes
  inputSetData: {
    template?: CommandScriptsData
    path?: string
    readonly?: boolean
  }
}

export function CommandScriptsInputSet(props: CommandScriptsInputSetProps): React.ReactElement {
  const { initialValues, inputSetData, allowableTypes, stepViewType } = props

  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()

  return (
    <FormikForm data-testid="command-scripts-input-set-form">
      {getMultiTypeFromValue(inputSetData.template?.timeout) === MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.sm)}>
          <TimeoutFieldInputSetView
            name={`${isEmpty(inputSetData.path) ? '' : `${inputSetData.path}.`}timeout`}
            label={getString('pipelineSteps.timeoutLabel')}
            multiTypeDurationProps={{
              enableConfigureOptions: false,
              allowableTypes,
              expressions,
              disabled: inputSetData.readonly
            }}
            disabled={inputSetData.readonly}
            fieldPath={'timeout'}
            template={inputSetData?.template}
          />
        </div>
      )}

      {inputSetData.template?.spec?.commandUnits && inputSetData.template?.spec?.commandUnits?.length > 0 ? (
        <CommandListInputSet
          initialValues={initialValues}
          allowableTypes={allowableTypes}
          stepViewType={stepViewType}
          path={inputSetData.path}
          readonly={inputSetData.readonly}
          template={inputSetData.template}
        />
      ) : null}

      <InputOutputVariablesInputSet
        allowableTypes={allowableTypes}
        path={inputSetData.path}
        template={inputSetData.template}
        readonly={inputSetData.readonly}
      />
    </FormikForm>
  )
}
