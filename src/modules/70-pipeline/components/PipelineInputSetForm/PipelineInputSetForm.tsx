/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import {
  Layout,
  getMultiTypeFromValue,
  MultiTypeInputType,
  Text,
  Icon,
  IconName,
  AllowedTypes
} from '@wings-software/uicore'
import { isEmpty, get, defaultTo, set } from 'lodash-es'
import { Color } from '@harness/design-system'
import cx from 'classnames'
import { useParams } from 'react-router-dom'
import produce from 'immer'
import type { DeploymentStageConfig } from 'services/cd-ng'
import type { PipelineInfoConfig, StageElementWrapperConfig, StageElementConfig } from 'services/pipeline-ng'
import { useStrings } from 'framework/strings'
import type { AllNGVariables } from '@pipeline/utils/types'
import type { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import DelegateSelectorPanel from '@pipeline/components/PipelineSteps/AdvancedSteps/DelegateSelectorPanel/DelegateSelectorPanel'
import { FormMultiTypeDurationField } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { PubSubPipelineActions } from '@pipeline/factories/PubSubPipelineAction'
import { PipelineActions } from '@pipeline/factories/PubSubPipelineAction/types'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { useDeepCompareEffect } from '@common/hooks'
import { TEMPLATE_INPUT_PATH } from '@pipeline/utils/templateUtils'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { StageFormContextProvider } from '@pipeline/context/StageFormContext'
import { isMultiTypeRuntime } from '@common/utils/utils'
import { StageInputSetForm } from './StageInputSetForm'
import { StageAdvancedInputSetForm } from './StageAdvancedInputSetForm'
import { CICodebaseInputSetForm } from './CICodebaseInputSetForm'
import { StepWidget } from '../AbstractSteps/StepWidget'
import factory from '../PipelineSteps/PipelineStepFactory'
import type {
  CustomVariablesData,
  CustomVariableInputSetExtraProps
} from '../PipelineSteps/Steps/CustomVariables/CustomVariableInputSet'
import type { AbstractStepFactory } from '../AbstractSteps/AbstractStepFactory'
import { StepType } from '../PipelineSteps/PipelineStepInterface'
import { getStageFromPipeline, getTemplatePath } from '../PipelineStudio/StepUtil'
import { useVariablesExpression } from '../PipelineStudio/PiplineHooks/useVariablesExpression'
import type { StageSelectionData } from '../../utils/runPipelineUtils'
import css from './PipelineInputSetForm.module.scss'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export interface PipelineInputSetFormProps {
  originalPipeline: PipelineInfoConfig
  template: PipelineInfoConfig
  path?: string
  executionIdentifier?: string
  readonly?: boolean
  maybeContainerClass?: string
  viewType: StepViewType
  isRunPipelineForm?: boolean
  listOfSelectedStages?: string[]
  isRetryFormStageSelected?: boolean
  allowableTypes: AllowedTypes
  viewTypeMetadata?: Record<string, boolean>
  gitAwareForTriggerEnabled?: boolean
  selectedStageData?: StageSelectionData
}

export const stageTypeToIconMap: Record<string, IconName> = {
  Deployment: 'cd-main',
  CI: 'ci-main',
  Pipeline: 'pipeline',
  Custom: 'custom-stage-icon',
  Approval: 'approval-stage-icon'
}

export function StageFormInternal({
  allValues,
  path,
  template,
  readonly,
  viewType,
  stageClassName = '',
  allowableTypes,
  executionIdentifier
}: {
  allValues?: StageElementWrapperConfig
  template?: StageElementWrapperConfig
  path: string
  readonly?: boolean
  viewType: StepViewType
  stageClassName?: string
  allowableTypes: AllowedTypes
  executionIdentifier?: string
}): JSX.Element {
  const { getString } = useStrings()
  return (
    <div className={cx(css.topAccordion, stageClassName)}>
      {template?.stage?.variables && (
        <div id={`Stage.${allValues?.stage?.identifier}.Variables`} className={cx(css.accordionSummary)}>
          <Text font={{ weight: 'semi-bold' }} padding={{ top: 'medium', bottom: 'medium' }}>
            {getString('common.variables')}
          </Text>
          <div className={css.nestedAccordions}>
            <StepWidget<CustomVariablesData, CustomVariableInputSetExtraProps>
              factory={factory as unknown as AbstractStepFactory}
              initialValues={{
                variables: (allValues?.stage?.variables || []) as AllNGVariables[],
                canAddVariable: true
              }}
              allowableTypes={
                (allowableTypes as MultiTypeInputType[]).filter(
                  allowedType => !isMultiTypeRuntime(allowedType)
                ) as AllowedTypes
              }
              type={StepType.CustomVariable}
              readonly={readonly}
              stepViewType={viewType}
              customStepProps={{
                template: { variables: template?.stage?.variables as AllNGVariables[] },
                path,
                executionIdentifier,
                allValues: { variables: (allValues?.stage?.variables || []) as AllNGVariables[] }
              }}
            />
          </div>
        </div>
      )}
      {template?.stage?.spec && (
        <StageInputSetForm
          stageIdentifier={allValues?.stage?.identifier}
          path={`${path}.spec`}
          deploymentStageTemplate={template?.stage?.spec as DeploymentStageConfig}
          deploymentStage={allValues?.stage?.spec as DeploymentStageConfig}
          readonly={readonly}
          viewType={viewType}
          executionIdentifier={executionIdentifier}
          allowableTypes={allowableTypes}
        />
      )}
      {(!isEmpty(template?.stage?.when) ||
        !isEmpty(template?.stage?.delegateSelectors) ||
        !isEmpty(template?.stage?.strategy) ||
        !isEmpty(template?.stage?.skipInstances)) && (
        <StageAdvancedInputSetForm
          stageIdentifier={allValues?.stage?.identifier}
          path={path}
          deploymentStageTemplate={(template as StageElementWrapperConfig).stage}
          readonly={readonly}
          allowableTypes={allowableTypes}
          delegateSelectors={template?.stage?.delegateSelectors}
          skipInstances={template?.stage?.skipInstances}
        />
      )}
    </div>
  )
}

export function StageForm({
  allValues,
  path,
  template,
  readonly,
  viewType,
  hideTitle = false,
  stageClassName = '',
  allowableTypes,
  executionIdentifier
}: {
  allValues?: StageElementWrapperConfig
  template?: StageElementWrapperConfig
  path: string
  readonly?: boolean
  viewType: StepViewType
  hideTitle?: boolean
  stageClassName?: string
  executionIdentifier?: string
  allowableTypes: AllowedTypes
}): JSX.Element {
  const [stageFormTemplate, setStageFormTemplate] = React.useState(template)
  const isTemplateStage = !!stageFormTemplate?.stage?.template
  const type = isTemplateStage
    ? (stageFormTemplate?.stage?.template?.templateInputs as StageElementConfig)?.type
    : stageFormTemplate?.stage?.type

  function getStageFormTemplate<T>(pathToUpdate: string): T | PipelineInfoConfig {
    const templatePath = getTemplatePath(pathToUpdate, path)
    return get(stageFormTemplate, `stage.${templatePath}`)
  }

  function updateStageFormTemplate<T>(updatedData: T, pathToUpdate: string): void {
    const templatePath = getTemplatePath(pathToUpdate, path)
    setStageFormTemplate(
      produce(stageFormTemplate, draft => {
        if (draft) {
          set(draft, `stage.${templatePath}`, updatedData)
        }
      })
    )
  }

  return (
    <div id={`Stage.${allValues?.stage?.identifier}`}>
      {!hideTitle && (
        <Layout.Horizontal spacing="small" padding={{ top: 'medium', left: 'large', right: 0, bottom: 0 }}>
          {type && <Icon name={stageTypeToIconMap[type]} size={18} />}
          <Text color={Color.BLACK_100} font={{ weight: 'semi-bold' }}>
            Stage: {defaultTo(allValues?.stage?.name, '')}
          </Text>
        </Layout.Horizontal>
      )}
      <StageFormContextProvider
        getStageFormTemplate={getStageFormTemplate}
        updateStageFormTemplate={updateStageFormTemplate}
      >
        <StageFormInternal
          template={
            isTemplateStage
              ? { stage: stageFormTemplate?.stage?.template?.templateInputs as StageElementConfig }
              : stageFormTemplate
          }
          allValues={
            allValues?.stage?.template
              ? { stage: allValues?.stage?.template?.templateInputs as StageElementConfig }
              : allValues
          }
          path={isTemplateStage ? `${path}.${TEMPLATE_INPUT_PATH}` : path}
          readonly={readonly}
          viewType={viewType}
          allowableTypes={allowableTypes}
          stageClassName={stageClassName}
          executionIdentifier={executionIdentifier}
        />
      </StageFormContextProvider>
    </div>
  )
}

export function PipelineInputSetFormInternal(props: PipelineInputSetFormProps): React.ReactElement {
  const {
    originalPipeline,
    template,
    path = '',
    readonly,
    viewType,
    maybeContainerClass = '',
    executionIdentifier,
    viewTypeMetadata,
    allowableTypes,
    selectedStageData
  } = props
  const { getString } = useStrings()
  const isTemplatePipeline = !!template.template
  const finalTemplate = isTemplatePipeline ? (template?.template?.templateInputs as PipelineInfoConfig) : template
  const finalPath = isTemplatePipeline
    ? !isEmpty(path)
      ? `${path}.template.templateInputs`
      : 'template.templateInputs'
    : path

  const { expressions } = useVariablesExpression()

  const isInputStageDisabled = (stageId: string): boolean => {
    /* In retry pipeline form all the fields are disabled until any stage is selected,
      and once the stage is selected, the stage before the selected stage should be disabled */

    if (props.isRetryFormStageSelected) {
      return !!props.listOfSelectedStages?.includes(stageId)
    } else if (props.isRetryFormStageSelected === false) {
      return !props.listOfSelectedStages?.length
    }
    return readonly as boolean
  }

  return (
    <Layout.Vertical spacing="medium" className={cx(css.container, maybeContainerClass)}>
      {getMultiTypeFromValue(finalTemplate?.timeout) === MultiTypeInputType.RUNTIME ? (
        <div className={cx(stepCss.formGroup, stepCss.sm)}>
          <FormMultiTypeDurationField
            multiTypeDurationProps={{
              enableConfigureOptions: false,
              allowableTypes,
              expressions,
              disabled: readonly
            }}
            className={stepCss.checkbox}
            label={getString('pipelineSteps.timeoutLabel')}
            name={!isEmpty(finalPath) ? `${finalPath}.timeout` : 'timeout'}
            disabled={readonly}
          />
        </div>
      ) : null}
      {getMultiTypeFromValue(finalTemplate?.delegateSelectors) === MultiTypeInputType.RUNTIME ? (
        <div className={cx(stepCss.formGroup, stepCss.sm, stepCss.delegate)}>
          <DelegateSelectorPanel
            isReadonly={readonly || false}
            allowableTypes={allowableTypes}
            name={!isEmpty(finalPath) ? `${finalPath}.delegateSelectors` : 'delegateSelectors'}
          />
        </div>
      ) : null}
      {finalTemplate?.variables && finalTemplate?.variables?.length > 0 && (
        <>
          <Layout.Horizontal spacing="small" padding={{ top: 'medium', left: 'large', right: 0, bottom: 0 }}>
            <Text
              color={Color.BLACK_100}
              font={{ weight: 'semi-bold' }}
              icon={'pipeline-variables'}
              iconProps={{ size: 18, color: Color.PRIMARY_7 }}
            >
              {getString('customVariables.pipelineVariablesTitle')}
            </Text>
          </Layout.Horizontal>
          <StepWidget<CustomVariablesData, CustomVariableInputSetExtraProps>
            factory={factory as unknown as AbstractStepFactory}
            initialValues={{
              variables: (originalPipeline.variables || []) as AllNGVariables[],
              canAddVariable: true
            }}
            // pipeline varibales do not support execution time inputs
            allowableTypes={
              (allowableTypes as MultiTypeInputType[]).filter(type => !isMultiTypeRuntime(type)) as AllowedTypes
            }
            readonly={readonly}
            type={StepType.CustomVariable}
            stepViewType={viewType}
            customStepProps={{
              template: { variables: (finalTemplate?.variables || []) as AllNGVariables[] },
              path: finalPath,
              executionIdentifier,
              allValues: { variables: (originalPipeline?.variables || []) as AllNGVariables[] }
            }}
          />
        </>
      )}
      <CICodebaseInputSetForm
        path={finalPath}
        readonly={readonly}
        originalPipeline={props.originalPipeline}
        template={template}
        viewType={viewType}
        viewTypeMetadata={viewTypeMetadata}
        selectedStageData={selectedStageData}
      />
      {
        <>
          {finalTemplate?.stages?.map((stageObj, index) => {
            const pathPrefix = !isEmpty(finalPath) ? `${finalPath}.` : ''
            if (stageObj.stage) {
              const allValues = getStageFromPipeline(stageObj?.stage?.identifier || '', originalPipeline)

              return (
                <Layout.Vertical key={stageObj?.stage?.identifier || index}>
                  <StageForm
                    template={stageObj}
                    allValues={allValues}
                    path={`${pathPrefix}stages[${index}].stage`}
                    readonly={isInputStageDisabled(stageObj?.stage?.identifier)}
                    viewType={viewType}
                    allowableTypes={allowableTypes}
                    executionIdentifier={executionIdentifier}
                  />
                </Layout.Vertical>
              )
            } else if (stageObj.parallel) {
              return stageObj.parallel.map((stageP, indexp) => {
                const allValues = getStageFromPipeline(stageP?.stage?.identifier || '', originalPipeline)
                return (
                  <Layout.Vertical key={`${stageObj?.stage?.identifier}-${stageP.stage?.identifier}-${indexp}`}>
                    <StageForm
                      template={stageP}
                      allValues={allValues}
                      path={`${pathPrefix}stages[${index}].parallel[${indexp}].stage`}
                      readonly={isInputStageDisabled(stageP?.stage?.identifier as string)}
                      viewType={viewType}
                      allowableTypes={allowableTypes}
                    />
                  </Layout.Vertical>
                )
              })
            } else {
              return null
            }
          })}
        </>
      }
    </Layout.Vertical>
  )
}
export function PipelineInputSetForm(props: Omit<PipelineInputSetFormProps, 'allowableTypes'>): React.ReactElement {
  const [template, setTemplate] = React.useState(props.template)
  const accountPathProps = useParams<AccountPathProps>()
  const { NG_EXECUTION_INPUT } = useFeatureFlags()

  useDeepCompareEffect(() => {
    if (props.isRunPipelineForm) {
      PubSubPipelineActions.publish(PipelineActions.RunPipeline, {
        pipeline: props.originalPipeline,
        accountPathProps,
        template: props.template
      }).then(data => {
        setTemplate(Object.assign(props.template, ...data))
      })
    }
  }, [props?.template])

  return (
    <PipelineInputSetFormInternal
      {...props}
      template={template}
      allowableTypes={
        NG_EXECUTION_INPUT
          ? [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION, MultiTypeInputType.EXECUTION_TIME]
          : [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION]
      }
    />
  )
}
