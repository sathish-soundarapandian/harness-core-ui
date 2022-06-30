/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { MultiTypeInputType } from '@wings-software/uicore'
import cx from 'classnames'
import { FormMultiTypeCheckboxField } from '@common/components'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { useStrings } from 'framework/strings'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

function OptionalConfiguration(props: { readonly?: boolean; allowableTypes: MultiTypeInputType[] }) {
  const { readonly, allowableTypes } = props
  const { expressions } = useVariablesExpression()
  const { getString } = useStrings()
  return (
    <>
      <div className={cx(stepCss.formGroup)}>
        <FormMultiTypeCheckboxField
          name="spec.unstableStatusAsSuccess"
          label={getString('pipeline.jenkinsStep.unstableStatusAsSuccess')}
          multiTypeTextbox={{ expressions, disabled: readonly, allowableTypes }}
          disabled={readonly}
        />
      </div>
      <div className={cx(stepCss.formGroup)}>
        <FormMultiTypeCheckboxField
          name="spec.captureEnvironmentVariable"
          label={getString('pipeline.jenkinsStep.captureEnvironmentVariable')}
          multiTypeTextbox={{ expressions, disabled: readonly, allowableTypes }}
          disabled={readonly}
        />
      </div>
    </>
  )
}

export default OptionalConfiguration
