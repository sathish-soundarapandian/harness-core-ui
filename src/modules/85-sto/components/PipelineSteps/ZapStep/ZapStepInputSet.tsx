/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { getMultiTypeFromValue, MultiTypeInputType, FormikForm } from '@harness/uicore'
import { connect } from 'formik'
import { isEmpty } from 'lodash-es'
import StepCommonFieldsInputSet from '@ci/components/PipelineSteps/StepCommonFields/StepCommonFieldsInputSet'
import { CIStep } from '@ci/components/PipelineSteps/CIStep/CIStep'
import {
  CIStepOptionalConfig,
  CIStepOptionalConfigProps
} from '@ci/components/PipelineSteps/CIStep/CIStepOptionalConfig'
import { shouldRenderRunTimeInputView } from '@pipeline/utils/CIUtils'
import { useStrings } from 'framework/strings'
import type { ZapStepProps } from './ZapStep'
import SecurityField from '../SecurityField'
import { getInputSetFieldName, inputSetFields } from '../constants'
import css from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export const ZapStepInputSetBasic: React.FC<ZapStepProps> = ({
  template,
  path,
  readonly,
  stepViewType,
  allowableTypes,
  formik
}) => {
  const prefix = isEmpty(path) ? '' : `${path}.`
  const { getString } = useStrings()

  const enableFields: CIStepOptionalConfigProps['enableFields'] = {
    ...(shouldRenderRunTimeInputView(template?.spec?.settings) && {
      [getInputSetFieldName(prefix, 'spec.settings')]: {}
    })
  }

  return (
    <FormikForm className={css.removeBpPopoverWrapperTopMargin}>
      <CIStep
        readonly={readonly}
        stepViewType={stepViewType}
        allowableTypes={allowableTypes}
        enableFields={{
          ...(getMultiTypeFromValue(template?.description) === MultiTypeInputType.RUNTIME && {
            description: {}
          })
        }}
        path={path || ''}
      />
      <SecurityField
        stepViewType={stepViewType}
        allowableTypes={allowableTypes}
        formik={formik}
        enableFields={inputSetFields(getString, prefix, template)}
      />
      <CIStepOptionalConfig
        readonly={readonly}
        enableFields={enableFields}
        allowableTypes={allowableTypes}
        stepViewType={stepViewType}
        path={path || ''}
        formik={formik}
        isInputSetView={true}
        template={template}
      />
      <StepCommonFieldsInputSet
        path={path}
        readonly={readonly}
        template={template}
        allowableTypes={allowableTypes}
        stepViewType={stepViewType}
      />
    </FormikForm>
  )
}

const ZapStepInputSet = connect(ZapStepInputSetBasic)
export { ZapStepInputSet }
