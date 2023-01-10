/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { connect } from 'formik'
import { getMultiTypeFromValue, MultiTypeInputType, FormikForm } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import StepCommonFieldsInputSet from '@ci/components/PipelineSteps/StepCommonFields/StepCommonFieldsInputSet'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { shouldRenderRunTimeInputView } from '@pipeline/utils/CIUtils'
import type { GHAPluginStepProps } from './GHAPluginStep'
import { CIStep } from '../CIStep/CIStep'
import { CIStepOptionalConfig } from '../CIStep/CIStepOptionalConfig'
import css from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export const GHAPluginStepInputSetBasic: React.FC<GHAPluginStepProps> = ({
  template,
  path,
  readonly,
  stepViewType,
  formik
}) => {
  const { getString } = useStrings()

  const { expressions } = useVariablesExpression()

  return (
    <FormikForm className={css.removeBpPopoverWrapperTopMargin}>
      <CIStep
        readonly={readonly}
        stepViewType={stepViewType}
        enableFields={{
          ...(getMultiTypeFromValue(template?.description) === MultiTypeInputType.RUNTIME && {
            description: {}
          }),
          ...(getMultiTypeFromValue(template?.spec?.uses) === MultiTypeInputType.RUNTIME && {
            'spec.uses': {
              tooltipId: 'pluginUsesInfo',
              multiTextInputProps: {
                placeholder: getString('ci.GHAPluginUsesPlaceholder'),
                disabled: readonly,
                multiTextInputProps: {
                  expressions,
                  allowableTypes: [MultiTypeInputType.EXPRESSION, MultiTypeInputType.FIXED]
                }
              }
            }
          })
        }}
        path={path || ''}
        isInputSetView={true}
        template={template}
      />
      <CIStepOptionalConfig
        readonly={readonly}
        enableFields={{
          ...(shouldRenderRunTimeInputView(template?.spec?.with) && {
            'spec.with': {
              tooltipId: 'pluginStep_with',
              placeholder: [
                getString('ci.GHAPluginWithKeyPlaceholder'),
                getString('ci.getStartedWithCI.carousel.labels.harnessCIFeatures')
              ]
            }
          }),
          ...(shouldRenderRunTimeInputView(template?.spec?.env) && {
            'spec.env': {
              tooltipId: 'pluginStep_env',
              placeholder: [getString('ci.pluginEnvKeyPlaceholder'), getString('ci.pluginEnvValuePlaceholder')]
            }
          })
        }}
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
        stepViewType={stepViewType}
        disableRunAsUser
      />
    </FormikForm>
  )
}

export const GHAPluginStepInputSet = connect(GHAPluginStepInputSetBasic)
