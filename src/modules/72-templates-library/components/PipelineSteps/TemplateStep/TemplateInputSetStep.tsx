/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { AllowedTypes, getMultiTypeFromValue, MultiTypeInputType } from '@wings-software/uicore'
import cx from 'classnames'
import { isEmpty } from 'lodash-es'
import { useParams } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import type { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StepWidget } from '@pipeline/components/AbstractSteps/StepWidget'
import type { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import MultiTypeDelegateSelector from '@common/components/MultiTypeDelegateSelector/MultiTypeDelegateSelector'
import type { StepElementConfig } from 'services/cd-ng'
import factory from '@pipeline/components/PipelineSteps/PipelineStepFactory'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import type { TemplateStepNode } from 'services/pipeline-ng'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export interface TemplateInputSetStepProps {
  initialValues: TemplateStepNode
  onUpdate?: (data: TemplateStepNode) => void
  onChange?: (data: TemplateStepNode) => void
  allowableTypes: AllowedTypes
  stepViewType?: StepViewType
  readonly?: boolean
  template?: TemplateStepNode
  path?: string
}

export default function TemplateInputSetStep(props: TemplateInputSetStepProps): React.ReactElement {
  const { template, path, readonly, initialValues, allowableTypes, stepViewType } = props
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const { orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const prefix = isEmpty(path) ? '' : `${path}.`

  return (
    <>
      <StepWidget<Partial<StepElementConfig>>
        factory={factory}
        initialValues={initialValues.template?.templateInputs as StepElementConfig}
        template={template?.template.templateInputs as Partial<StepElementConfig>}
        readonly={readonly}
        type={(initialValues.template?.templateInputs as StepElementConfig)?.type as StepType}
        path={`${prefix}template.templateInputs`}
        stepViewType={stepViewType}
        allowableTypes={allowableTypes}
      />
      {getMultiTypeFromValue((template?.template.templateInputs as StepElementConfig)?.spec?.delegateSelectors) ===
        MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.sm)}>
          <MultiTypeDelegateSelector
            expressions={expressions}
            inputProps={{ projectIdentifier, orgIdentifier }}
            allowableTypes={allowableTypes}
            label={getString('delegate.DelegateSelector')}
            name={`${prefix}template.templateInputs.spec.delegateSelectors`}
            disabled={readonly}
          />
        </div>
      )}
    </>
  )
}
