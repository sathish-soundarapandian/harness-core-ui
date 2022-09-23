/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { shouldRenderRunTimeInputView } from '@pipeline/utils/CIUtils'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import StepCommonFieldsInputSet from '../StepCommonFields/StepCommonFieldsInputSet'
import { CIStepOptionalConfig, CIStepOptionalConfigProps } from './CIStepOptionalConfig'

export const RunAndRunTestStepInputCommonFields: React.FC<Omit<CIStepOptionalConfigProps, 'enableFields'>> = props => {
  const { stepViewType, readonly, path, formik, template, stepType } = props
  return (
    <>
      <CIStepOptionalConfig
        stepViewType={stepViewType}
        readonly={readonly}
        enableFields={{
          ...(stepType !== StepType.RunTests &&
            shouldRenderRunTimeInputView(template?.spec?.reports?.spec?.paths) && {
              'spec.reportPaths': {}
            }),
          ...(shouldRenderRunTimeInputView(template?.spec?.outputVariables) && {
            'spec.outputVariables': {}
          }),
          ...(shouldRenderRunTimeInputView(template?.spec?.envVariables) && {
            'spec.envVariables': {}
          })
        }}
        path={path || ''}
        formik={formik}
        isInputSetView={true}
        template={template}
      />
      <StepCommonFieldsInputSet path={path} readonly={readonly} template={template} stepViewType={stepViewType} />
    </>
  )
}
