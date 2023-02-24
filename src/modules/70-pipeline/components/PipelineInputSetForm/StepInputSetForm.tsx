/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { AllowedTypes, Container, FormInput, Icon, Label, Layout, Text } from '@harness/uicore'
import { get } from 'lodash-es'
import { Color } from '@harness/design-system'
import React from 'react'
import { useParams } from 'react-router-dom'
import cx from 'classnames'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import type { DeploymentStageConfig, ExecutionWrapperConfig, StepElementConfig } from 'services/cd-ng'
import MultiTypeDelegateSelector from '@common/components/MultiTypeDelegateSelector/MultiTypeDelegateSelector'
import type { PipelineInfoConfig, TemplateStepNode } from 'services/pipeline-ng'
import { TEMPLATE_INPUT_PATH } from '@pipeline/utils/templateUtils'
import type { StageType } from '@pipeline/utils/stageHelpers'
import { isValueRuntimeInput } from '@common/utils/utils'
import { StepMode } from '@pipeline/utils/stepUtils'
import { StepViewType } from '../AbstractSteps/Step'
import type { CommandFlags } from '../ManifestSelection/ManifestInterface'
import { useVariablesExpression } from '../PipelineStudio/PiplineHooks/useVariablesExpression'
import { StepWidget } from '../AbstractSteps/StepWidget'
import type { StepType } from '../PipelineSteps/PipelineStepInterface'
import { StrategyForm } from './StageAdvancedInputSetForm/StageAdvancedInputSetForm'
import { ConditionalExecutionForm } from './StageAdvancedInputSetForm/ConditionalExecutionForm'
import factory from '../PipelineSteps/PipelineStepFactory'
import MultiTypePolicySetSelector from '../PipelineSteps/Common/PolicySets/MultiTypePolicySetSelector/MultiTypePolicySetSelector'
import { FailureStrategiesInputSetForm } from './StageAdvancedInputSetForm/FailureStrategiesInputSetForm'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

function StepFormInternal({
  template,
  allValues,
  values,
  onUpdate,
  readonly,
  viewType,
  path,
  allowableTypes,
  customStepProps
}: {
  template?: ExecutionWrapperConfig
  allValues?: ExecutionWrapperConfig
  values?: ExecutionWrapperConfig
  onUpdate: (data: any) => void
  readonly?: boolean
  viewType?: StepViewType
  path: string
  allowableTypes: AllowedTypes
  customStepProps?: {
    stageIdentifier: string
    selectedStage?: DeploymentStageConfig
    stageType?: StageType
  }
}): JSX.Element {
  const { getString } = useStrings()
  const { projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { expressions } = useVariablesExpression()
  const renderCommandFlags = (commandFlagPath: string): React.ReactElement => {
    const commandFlags = get(template, commandFlagPath)
    return commandFlags?.map((commandFlag: CommandFlags, flagIdx: number) => {
      if (isValueRuntimeInput(get(template, `step.spec.commandFlags[${flagIdx}].flag`))) {
        return (
          <div className={cx(stepCss.formGroup, stepCss.md)} key={flagIdx}>
            <FormInput.MultiTextInput
              disabled={readonly}
              name={`${path}.spec.commandFlags[${flagIdx}].flag`}
              multiTextInputProps={{
                expressions,
                allowableTypes
              }}
              label={`${commandFlag.commandType}: ${getString('flag')}`}
            />
          </div>
        )
      }
    })
  }
  return (
    <div>
      <StepWidget<Partial<StepElementConfig>>
        factory={factory}
        readonly={readonly}
        path={path}
        allowableTypes={allowableTypes}
        template={template?.step}
        initialValues={values?.step || {}}
        allValues={allValues?.step || {}}
        type={(allValues?.step as StepElementConfig)?.type as StepType}
        onUpdate={onUpdate}
        stepViewType={viewType}
        customStepProps={
          customStepProps
            ? {
                ...customStepProps,
                selectedStage: {
                  stage: {
                    spec: customStepProps?.selectedStage
                  }
                }
              }
            : null
        }
      />
      {isValueRuntimeInput(template?.step?.spec?.delegateSelectors) && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <MultiTypeDelegateSelector
            expressions={expressions}
            inputProps={{ projectIdentifier, orgIdentifier }}
            allowableTypes={allowableTypes}
            label={getString('delegate.DelegateSelector')}
            name={`${path}.spec.delegateSelectors`}
            disabled={readonly}
          />
        </div>
      )}
      {template?.step?.when && (
        <Container className={cx(stepCss.formGroup)}>
          <ConditionalExecutionForm
            isReadonly={!!readonly}
            path={`${path}.when`}
            allowableTypes={allowableTypes}
            mode={StepMode.STEP}
            viewType={viewType}
            template={template?.step?.when}
          />
        </Container>
      )}
      {template?.step?.strategy && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <StrategyForm path={`${path}.strategy`} readonly={readonly} />
        </div>
      )}
      {isValueRuntimeInput(template?.step?.failureStrategies as unknown as string) && (
        <div className={cx(stepCss.formGroup, { [stepCss.md]: viewType !== StepViewType.TemplateUsage })}>
          <FailureStrategiesInputSetForm
            stageType={customStepProps?.stageType as StageType}
            path={`${path}.failureStrategies`}
            readonly={readonly}
            viewType={viewType}
          />
        </div>
      )}
      {renderCommandFlags('step.spec.commandFlags')}
      {isValueRuntimeInput((template?.step as StepElementConfig)?.enforce?.policySets) && (
        <Container width={'55%'}>
          <Text
            color={Color.GREY_600}
            font={{ size: 'small', weight: 'bold' }}
            margin={{ bottom: 'small', top: 'xsmall' }}
          >
            {getString('pipeline.policyEnforcement.title')}
          </Text>
          <MultiTypePolicySetSelector<PipelineInfoConfig>
            name={`${path}.enforce.policySets`}
            label={getString('common.policy.policysets')}
            expressions={expressions}
            allowableTypes={allowableTypes}
            disabled={readonly}
          />
        </Container>
      )}
    </div>
  )
}

export function StepForm({
  template,
  allValues,
  values,
  onUpdate,
  readonly,
  viewType,
  path,
  allowableTypes,
  hideTitle = false,
  customStepProps
}: {
  template?: ExecutionWrapperConfig
  allValues?: ExecutionWrapperConfig
  values?: ExecutionWrapperConfig
  onUpdate: (data: any) => void
  readonly?: boolean
  viewType?: StepViewType
  path: string
  allowableTypes: AllowedTypes
  hideTitle?: boolean
  customStepProps?: {
    stageIdentifier: string
    selectedStage?: DeploymentStageConfig
    stageType?: StageType
  }
}): JSX.Element {
  const { getString } = useStrings()
  const isTemplateStep = (template?.step as unknown as TemplateStepNode)?.template
  const type = isTemplateStep
    ? ((template?.step as unknown as TemplateStepNode)?.template.templateInputs as StepElementConfig)?.type
    : ((template?.step as StepElementConfig)?.type as StepType)
  const iconColor = factory.getStepIconColor(type)

  return (
    <Layout.Vertical spacing="medium" padding={{ top: 'medium' }}>
      {!hideTitle && (
        <Label>
          <Icon
            padding={{ right: 'small' }}
            {...(iconColor ? { color: iconColor } : {})}
            style={{ color: iconColor }}
            name={factory.getStepIcon(type)}
          />
          {getString('pipeline.execution.stepTitlePrefix')}
          {getString('pipeline.stepLabel', allValues?.step)}
        </Label>
      )}
      <StepFormInternal
        template={
          isTemplateStep
            ? { step: (template?.step as unknown as TemplateStepNode)?.template?.templateInputs as StepElementConfig }
            : template
        }
        allValues={
          (allValues?.step as unknown as TemplateStepNode)?.template
            ? { step: (allValues?.step as unknown as TemplateStepNode)?.template?.templateInputs as StepElementConfig }
            : allValues
        }
        values={
          isTemplateStep
            ? { step: (values?.step as unknown as TemplateStepNode)?.template?.templateInputs as StepElementConfig }
            : values
        }
        path={isTemplateStep ? `${path}.${TEMPLATE_INPUT_PATH}` : path}
        readonly={readonly}
        viewType={viewType}
        allowableTypes={allowableTypes}
        onUpdate={onUpdate}
        customStepProps={customStepProps}
      />
    </Layout.Vertical>
  )
}
