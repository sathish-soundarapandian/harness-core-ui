/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { FormInput } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

function OptionalConfiguration(props: { readonly?: boolean }): React.ReactElement {
  const { readonly } = props
  const { getString } = useStrings()
  return (
    <div className={stepCss.stepPanel}>
      <div className={cx(stepCss.formGroup)}>
        <FormInput.CheckBox
          name="spec.unstableStatusAsSuccess"
          label={getString('pipeline.jenkinsStep.unstableStatusAsSuccess')}
          disabled={readonly}
        />
      </div>
      <div className={cx(stepCss.formGroup)}>
        <FormInput.CheckBox
          name="spec.useConnectorUrlForJobExecution"
          label={getString('pipeline.jenkinsStep.useConnectorUrlForJobExecution')}
          disabled={readonly}
        />
      </div>
    </div>
  )
}

export default OptionalConfiguration
