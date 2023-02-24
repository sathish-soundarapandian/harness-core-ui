import React from 'react'
import { isEmpty } from 'lodash-es'
import cx from 'classnames'
import { getMultiTypeFromValue, MultiTypeInputType } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { FormMultiTypeDurationField } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { isExecutionTimeFieldDisabled } from '@pipeline/utils/runPipelineUtils'
import { FormMultiTypeCheckboxField } from '@common/components'
import type { AsgSwapServiceProps } from './AsgSwapServiceStep'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export const AsgSwapServiceInputStep: React.FC<AsgSwapServiceProps> = ({
  template,
  readonly,
  path,
  allowableTypes,
  stepViewType
}) => {
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const prefix = isEmpty(path) ? '' : `${path}.`
  return (
    <>
      {getMultiTypeFromValue(template?.timeout) === MultiTypeInputType.RUNTIME ? (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <FormMultiTypeDurationField
            multiTypeDurationProps={{
              configureOptionsProps: {
                isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
              },
              allowableTypes,
              expressions,
              disabled: readonly
            }}
            label={getString('pipelineSteps.timeoutLabel')}
            name={`${prefix}timeout`}
            disabled={readonly}
          />
        </div>
      ) : null}
      {getMultiTypeFromValue(template?.spec?.downsizeOldAsg) === MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <FormMultiTypeCheckboxField
            multiTypeTextbox={{
              expressions,
              allowableTypes
            }}
            name={`${prefix}spec.downsizeOldAsg`}
            label={getString('cd.downsizeOldAsg')}
            disabled={readonly}
            setToFalseWhenEmpty={true}
          />
        </div>
      )}
    </>
  )
}
