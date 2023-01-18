/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { getMultiTypeFromValue, MultiTypeInputType, FormikForm, AllowedTypes } from '@harness/uicore'
import { isEmpty } from 'lodash-es'
import cx from 'classnames'
import { useStrings } from 'framework/strings'
import type { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { TimeoutFieldInputSetView } from '@pipeline/components/InputSetView/TimeoutFieldInputSetView/TimeoutFieldInputSetView'
import { TextFieldInputSetView } from '@pipeline/components/InputSetView/TextFieldInputSetView/TextFieldInputSetView'
import type { ElastigroupSetupData } from './ElastigroupSetupTypes'

import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export interface ElastigroupSetupInputSetProps {
  initialValues: ElastigroupSetupData
  onUpdate?: (data: ElastigroupSetupData) => void
  onChange?: (data: ElastigroupSetupData) => void
  allowableTypes: AllowedTypes
  stepViewType?: StepViewType
  readonly?: boolean
  template?: ElastigroupSetupData
  path?: string
}

export default function ElastigroupSetupInputSet(props: ElastigroupSetupInputSetProps): React.ReactElement {
  const { template, path, readonly, allowableTypes } = props
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const prefix = isEmpty(path) ? '' : `${path}.`

  return (
    <FormikForm>
      {getMultiTypeFromValue(template?.timeout) === MultiTypeInputType.RUNTIME && (
        <TimeoutFieldInputSetView
          multiTypeDurationProps={{
            enableConfigureOptions: false,
            allowableTypes,
            expressions,
            disabled: readonly
          }}
          label={getString('pipelineSteps.timeoutLabel')}
          name={`${prefix}timeout`}
          disabled={readonly}
          fieldPath={'timeout'}
          template={template}
          className={cx(stepCss.formGroup, stepCss.sm)}
        />
      )}
      {getMultiTypeFromValue(template?.spec?.name) === MultiTypeInputType.RUNTIME && (
        <TextFieldInputSetView
          name={`${path}.spec.name`}
          disabled={readonly}
          placeholder={getString('cd.ElastigroupStep.appName')}
          label={getString('cd.ElastigroupStep.appName')}
          multiTextInputProps={{
            expressions,
            allowableTypes
          }}
          template={template}
          fieldPath={'spec.name'}
          className={cx(stepCss.formGroup, stepCss.md)}
        />
      )}
      {getMultiTypeFromValue(template?.spec?.instances?.spec?.min) === MultiTypeInputType.RUNTIME && (
        <TextFieldInputSetView
          name={`${path}.spec.instances.spec.min`}
          disabled={readonly}
          placeholder={getString('cd.ElastigroupStep.minInstances')}
          label={getString('cd.ElastigroupStep.minInstances')}
          multiTextInputProps={{
            expressions,
            allowableTypes,
            textProps: { type: 'number' }
          }}
          template={template}
          fieldPath={'spec.instances.spec.min'}
          className={cx(stepCss.formGroup, stepCss.md)}
        />
      )}
      {getMultiTypeFromValue(template?.spec?.instances?.spec?.desired) === MultiTypeInputType.RUNTIME && (
        <TextFieldInputSetView
          name={`${path}.spec.instances.spec.desired`}
          disabled={readonly}
          placeholder={getString('cd.ElastigroupStep.desiredInstances')}
          label={getString('cd.ElastigroupStep.desiredInstances')}
          multiTextInputProps={{
            expressions,
            allowableTypes,
            textProps: { type: 'number' }
          }}
          template={template}
          fieldPath={'spec.instances.spec.desired'}
          className={cx(stepCss.formGroup, stepCss.md)}
        />
      )}
      {getMultiTypeFromValue(template?.spec?.instances?.spec?.max) === MultiTypeInputType.RUNTIME && (
        <TextFieldInputSetView
          name={`${path}.spec.instances.spec.max`}
          disabled={readonly}
          placeholder={getString('cd.ElastigroupStep.maxInstances')}
          label={getString('cd.ElastigroupStep.maxInstances')}
          multiTextInputProps={{
            expressions,
            allowableTypes,
            textProps: { type: 'number' }
          }}
          template={template}
          fieldPath={'spec.instances.spec.max'}
          className={cx(stepCss.formGroup, stepCss.md)}
        />
      )}
    </FormikForm>
  )
}
