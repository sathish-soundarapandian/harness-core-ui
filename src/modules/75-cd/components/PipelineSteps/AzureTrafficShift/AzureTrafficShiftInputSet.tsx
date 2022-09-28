/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { isEmpty } from 'lodash-es'
import cx from 'classnames'
import { FormikForm, MultiTypeInputType, getMultiTypeFromValue } from '@harness/uicore'
import { connect, FormikContextType } from 'formik'
import { useStrings } from 'framework/strings'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { TimeoutFieldInputSetView } from '@pipeline/components/InputSetView/TimeoutFieldInputSetView/TimeoutFieldInputSetView'
import { TextFieldInputSetView } from '@pipeline/components/InputSetView/TextFieldInputSetView/TextFieldInputSetView'
import type { AzureTrafficShiftData, AzureTrafficShiftProps } from './AzureTrafficShiftInterface.types'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

const isRuntime = (value: string): boolean => getMultiTypeFromValue(value) === MultiTypeInputType.RUNTIME

export function AzureTrafficShiftInputSetRef<T extends AzureTrafficShiftData = AzureTrafficShiftData>(
  props: AzureTrafficShiftProps<T> & { formik?: FormikContextType<any> }
): React.ReactElement {
  const { inputSetData, readonly, allowableTypes } = props
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()

  return (
    <FormikForm>
      {
        /* istanbul ignore next */
        isRuntime(inputSetData?.template?.timeout as string) && (
          <div className={cx(stepCss.formGroup, stepCss.md)}>
            <TimeoutFieldInputSetView
              label={getString('pipelineSteps.timeoutLabel')}
              name={`${isEmpty(inputSetData?.path) ? '' : `${inputSetData?.path}.`}timeout`}
              disabled={readonly}
              multiTypeDurationProps={{
                enableConfigureOptions: false,
                allowableTypes,
                expressions,
                disabled: readonly
              }}
              template={inputSetData?.template}
              fieldPath={'timeout'}
            />
          </div>
        )
      }
      {
        /* istanbul ignore next */
        isRuntime(inputSetData?.template?.spec?.traffic as string) && (
          <div className={cx(stepCss.formGroup, stepCss.md)}>
            <TextFieldInputSetView
              label={getString('pipeline.trafficPercentage')}
              name={`${isEmpty(inputSetData?.path) ? '' : `${inputSetData?.path}.`}spec.traffic`}
              disabled={readonly}
              multiTextInputProps={{
                expressions,
                disabled: readonly,
                allowableTypes
              }}
              fieldPath={'spec.traffic'}
              template={inputSetData?.template}
            />
          </div>
        )
      }
    </FormikForm>
  )
}

const AzureTrafficShiftInputSet = connect(AzureTrafficShiftInputSetRef)
export default AzureTrafficShiftInputSet
