import {
  AllowedTypes,
  Container,
  FormInput,
  getMultiTypeFromValue,
  Icon,
  Label,
  Layout,
  MultiTypeInputType
} from '@harness/uicore'
import { get } from 'lodash-es'
import React from 'react'
import { useParams } from 'react-router-dom'
import cx from 'classnames'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import type { DeploymentStageConfig, ExecutionWrapperConfig, StepElementConfig } from 'services/cd-ng'
import MultiTypeDelegateSelector from '@common/components/MultiTypeDelegateSelector/MultiTypeDelegateSelector'
import type { TemplateStepNode } from 'services/pipeline-ng'
import { TEMPLATE_INPUT_PATH } from '@pipeline/utils/templateUtils'
import type { StepViewType } from '../AbstractSteps/Step'
import type { CommandFlags } from '../ManifestSelection/ManifestInterface'
import { useVariablesExpression } from '../PipelineStudio/PiplineHooks/useVariablesExpression'
import { StepWidget } from '../AbstractSteps/StepWidget'
import type { StepType } from '../PipelineSteps/PipelineStepInterface'
import { ConditionalExecutionForm, StrategyForm } from './StageAdvancedInputSetForm'
import factory from '../PipelineSteps/PipelineStepFactory'
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
  }
}): JSX.Element {
  const { getString } = useStrings()
  const { projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { expressions } = useVariablesExpression()
  const renderCommandFlags = (commandFlagPath: string): React.ReactElement => {
    const commandFlags = get(template, commandFlagPath)
    return commandFlags?.map((commandFlag: CommandFlags, flagIdx: number) => {
      if (
        getMultiTypeFromValue(get(template, `step.spec.commandFlags[${flagIdx}].flag`)) === MultiTypeInputType.RUNTIME
      ) {
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
      {getMultiTypeFromValue((template?.step as StepElementConfig)?.spec?.delegateSelectors) ===
        MultiTypeInputType.RUNTIME && (
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
      {getMultiTypeFromValue((template?.step as StepElementConfig)?.when?.condition) === MultiTypeInputType.RUNTIME && (
        <Container className={cx(stepCss.formGroup, stepCss.md)}>
          <ConditionalExecutionForm
            readonly={readonly}
            path={`${path}.when.condition`}
            allowableTypes={allowableTypes}
          />
        </Container>
      )}
      {(template?.step as any)?.strategy && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <StrategyForm path={`${path}.strategy`} readonly={readonly} />
        </div>
      )}
      {renderCommandFlags('step.spec.commandFlags')}
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
