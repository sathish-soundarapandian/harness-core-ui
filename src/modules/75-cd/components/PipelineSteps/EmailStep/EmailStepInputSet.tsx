/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { getMultiTypeFromValue, MultiTypeInputType, AllowedTypes } from '@wings-software/uicore'
import { isEmpty } from 'lodash-es'
import cx from 'classnames'
import { useStrings } from 'framework/strings'
import type { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { FormMultiTypeTextAreaField } from '@common/components/MultiTypeTextArea/MultiTypeTextArea'
import { TimeoutFieldInputSetView } from '@pipeline/components/InputSetView/TimeoutFieldInputSetView/TimeoutFieldInputSetView'
import { TextFieldInputSetView } from '@pipeline/components/InputSetView/TextFieldInputSetView/TextFieldInputSetView'
import type { EmailStepData } from './emailStepTypes'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export interface EmailStepInputSetProps {
  initialValues: EmailStepData
  stepViewType?: StepViewType
  readonly?: boolean
  template?: EmailStepData
  path: string
  allowableTypes: AllowedTypes
}

export default function EmailStepInputSet(props: EmailStepInputSetProps): React.ReactElement {
  const { template, path, readonly, allowableTypes } = props
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const prefix = isEmpty(path) ? '' : `${path}.`

  return (
    <React.Fragment>
      {getMultiTypeFromValue(template?.timeout) === MultiTypeInputType.RUNTIME ? (
        <div className={cx(stepCss.formGroup, stepCss.sm)}>
          <TimeoutFieldInputSetView
            label={getString('pipelineSteps.timeoutLabel')}
            name={`${prefix}timeout`}
            multiTypeDurationProps={{
              enableConfigureOptions: false,
              expressions,
              disabled: readonly,
              allowableTypes
            }}
            disabled={readonly}
            fieldPath={'timeout'}
            template={template}
          />
        </div>
      ) : null}
      {getMultiTypeFromValue(template?.spec?.to) === MultiTypeInputType.RUNTIME ? (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <TextFieldInputSetView
            placeholder={getString('pipeline.utilitiesStep.to')}
            label={getString('common.smtp.labelTo')}
            name={`${prefix}spec.to`}
            multiTextInputProps={{
              expressions,
              disabled: readonly,
              allowableTypes
            }}
            disabled={readonly}
            template={template}
            fieldPath={'spec.to'}
          />
        </div>
      ) : null}
      {getMultiTypeFromValue(template?.spec?.cc) === MultiTypeInputType.RUNTIME ? (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <TextFieldInputSetView
            placeholder={getString('pipeline.utilitiesStep.cc')}
            label={getString('cd.steps.emailStep.ccOptionalLabel')}
            name={`${prefix}spec.cc`}
            multiTextInputProps={{
              expressions,
              disabled: readonly,
              allowableTypes
            }}
            disabled={readonly}
            template={template}
            fieldPath={'spec.cc'}
          />
        </div>
      ) : null}
      {getMultiTypeFromValue(template?.spec?.subject) === MultiTypeInputType.RUNTIME ? (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <FormMultiTypeTextAreaField
            placeholder={getString('pipeline.utilitiesStep.subject')}
            label={getString('common.smtp.labelSubject')}
            name={`${prefix}spec.subject`}
            multiTypeTextArea={{
              enableConfigureOptions: false,
              expressions,
              disabled: readonly,
              allowableTypes
            }}
            disabled={readonly}
          />
        </div>
      ) : null}
      {getMultiTypeFromValue(template?.spec?.body) === MultiTypeInputType.RUNTIME ? (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <FormMultiTypeTextAreaField
            placeholder={getString('pipeline.utilitiesStep.requestBody')}
            label={getString('common.smtp.labelBody')}
            name={`${prefix}spec.body`}
            multiTypeTextArea={{
              enableConfigureOptions: false,
              expressions,
              disabled: readonly,
              allowableTypes
            }}
            disabled={readonly}
          />
        </div>
      ) : null}
    </React.Fragment>
  )
}
