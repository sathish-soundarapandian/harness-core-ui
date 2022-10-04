/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { isEmpty } from 'lodash-es'
import { AllowedTypes, getMultiTypeFromValue, MultiTypeInputType } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import { TimeoutFieldInputSetView } from '@pipeline/components/InputSetView/TimeoutFieldInputSetView/TimeoutFieldInputSetView'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import type { WaitStepData } from './WaitStepTypes'

import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export default function WaitInputSetStep(props: {
  readonly?: boolean
  template?: WaitStepData
  path?: string
  allowableTypes: AllowedTypes
}): React.ReactElement {
  const { readonly, template, path } = props
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const prefix = isEmpty(path) ? '' : `${path}.`

  return (
    <>
      {getMultiTypeFromValue(/* istanbul ignore next */ template?.spec?.duration) === MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.lg)}>
          <TimeoutFieldInputSetView
            name={`${prefix}spec.duration`}
            label={getString('pipeline.duration')}
            disabled={readonly}
            className={stepCss.duration}
            multiTypeDurationProps={{
              enableConfigureOptions: false,
              expressions,
              disabled: readonly
            }}
            template={template}
            fieldPath={'spec.duration'}
          />
        </div>
      )}
    </>
  )
}
