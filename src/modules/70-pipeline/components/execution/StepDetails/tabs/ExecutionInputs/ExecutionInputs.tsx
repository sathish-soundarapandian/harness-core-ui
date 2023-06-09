/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { defaultTo, get, isEmpty } from 'lodash-es'
import {
  MultiTypeInputType,
  Formik,
  FormikForm,
  Layout,
  Button,
  ButtonVariation,
  useToaster,
  Text,
  useToggleOpen,
  ConfirmationDialog
} from '@harness/uicore'
import { Intent, Spinner } from '@blueprintjs/core'
import type { FormikErrors } from 'formik'
import cx from 'classnames'

import {
  ExecutionGraph,
  ExecutionNode,
  PipelineInfoConfig,
  PipelineStageConfig,
  StageElementConfig,
  StageElementWrapperConfig,
  useGetExecutionInputTemplate,
  useHandleInterrupt,
  useSubmitExecutionInput
} from 'services/pipeline-ng'
import { useStrings } from 'framework/strings'
import type { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { StepWidget } from '@pipeline/components/AbstractSteps/StepWidget'
import pipelineFactory from '@pipeline/components/PipelineSteps/PipelineStepFactory'
import type { AbstractStepFactory } from '@pipeline/components/AbstractSteps/AbstractStepFactory'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { parse, stringify } from '@common/utils/YamlHelperMethods'
import type { StepElementConfig } from 'services/cd-ng'
import useRBACError, { RBACError } from '@rbac/utils/useRBACError/useRBACError'
import { clearRuntimeInput } from '@pipeline/utils/runPipelineUtils'
import { StepNodeType, NonSelectableStepNodes } from '@pipeline/utils/executionUtils'
import { StageForm, StageFormInternal } from '@pipeline/components/PipelineInputSetForm/PipelineInputSetForm'
import { getStageFromPipeline, validateStage } from '@pipeline/components/PipelineStudio/StepUtil'
import { isExecutionComplete } from '@pipeline/utils/statusHelpers'
import css from './ExecutionInputs.module.scss'

export interface ExecutionInputsProps {
  step: ExecutionNode
  executionMetadata: ExecutionGraph['executionMetadata']
  factory?: AbstractStepFactory
  className?: string
  onSuccess?(): void
  onError?(): void
}

export function ExecutionInputs(props: ExecutionInputsProps): React.ReactElement {
  const { step, factory = pipelineFactory, executionMetadata, className, onSuccess, onError } = props
  const { accountId, projectIdentifier, orgIdentifier, planExecutionId } = defaultTo(executionMetadata, {})
  const { getString } = useStrings()
  const { showSuccess, showError } = useToaster()
  const { getRBACErrorMessage } = useRBACError()
  const [hasSubmitted, setHasSubmitted] = useState(false)

  const nodeExecutionId = defaultTo(step.uuid, '')
  const { data, loading } = useGetExecutionInputTemplate({
    nodeExecutionId,
    queryParams: { accountIdentifier: accountId, projectIdentifier, orgIdentifier },
    lazy: !step.uuid
  })

  const { mutate: submitInput } = useSubmitExecutionInput({
    nodeExecutionId,
    queryParams: { accountIdentifier: accountId, projectIdentifier, orgIdentifier },
    requestOptions: {
      headers: {
        'content-type': 'application/yaml'
      }
    }
  })

  const stepType = step.stepType as StepType
  const isStageForm = NonSelectableStepNodes.includes(step.stepType as StepNodeType)
  const template = parse<{ step: StepElementConfig; stage: StageElementConfig }>(
    defaultTo(get(data, 'data.inputTemplate'), '{}')
  )
  const userInput = parse<{ step: StepElementConfig; stage: StageElementConfig }>(
    defaultTo(get(data, 'data.userInput'), '{}')
  )
  const fieldYaml = parse<{ step: StepElementConfig; stage: StageElementConfig }>(
    defaultTo(get(data, 'data.fieldYaml'), '{}')
  )
  const isDone = !isEmpty(userInput) || isExecutionComplete(step.status)

  const finalUserInput = defaultTo(isStageForm ? userInput : userInput.step, {})
  const parsedStep = defaultTo(template.step, {})
  const parsedStage = defaultTo(template, {}) as StageElementWrapperConfig
  const initialValues = isDone ? finalUserInput : clearRuntimeInput(isStageForm ? parsedStage : parsedStep, true)

  const stepDef = factory.getStep<Partial<StepElementConfig>>(stepType)
  const {
    isOpen: isAbortConfirmationOpen,
    open: openAbortConfirmation,
    close: closeAbortConfirmation
  } = useToggleOpen()
  const { mutate: abortPipeline } = useHandleInterrupt({
    planExecutionId,
    queryParams: {
      accountIdentifier: accountId,
      projectIdentifier,
      orgIdentifier,
      interruptType: 'AbortAll'
    }
  })
  function handleValidation(
    formData: Partial<StepElementConfig | StageElementWrapperConfig>
  ): FormikErrors<Partial<StepElementConfig | StageElementWrapperConfig>> {
    if (isStageForm) {
      const errors = validateStage({
        stage: (formData as Required<StageElementWrapperConfig>).stage,
        template: parsedStage.stage,
        viewType: StepViewType.DeploymentForm,
        originalStage: fieldYaml.stage,
        resolvedStage: fieldYaml.stage,
        getString
      })

      return isEmpty(errors) ? {} : ({ stage: errors } as FormikErrors<StageElementWrapperConfig>)
    }

    return (
      stepDef?.validateInputSet({
        data: formData as StepElementConfig,
        template: parsedStep,
        viewType: StepViewType.DeploymentForm,
        getString
      }) || {}
    )
  }

  async function handleSubmit(
    formData: Partial<StepElementConfig | StageElementWrapperConfig>
  ): Promise<Partial<StepElementConfig | StageElementWrapperConfig>> {
    try {
      await submitInput(stringify(isStageForm ? formData : { step: formData }))
      setHasSubmitted(true)
      showSuccess(getString('common.dataSubmitSuccess'))
      onSuccess?.()
    } catch (e: unknown) {
      showError(getRBACErrorMessage(e as RBACError))
      onError?.()
    }

    return formData
  }

  async function onAbortConfirmationClose(isConfirmed: boolean): Promise<void> {
    // istanbul ignore else
    if (isConfirmed) {
      try {
        await abortPipeline({} as never)
        showSuccess(getString('pipeline.execution.pipelineActionMessages.abortedMessage'))
        onSuccess?.()
      } catch (e: unknown) {
        showError(getRBACErrorMessage(e as RBACError))
        onError?.()
      }
    }

    closeAbortConfirmation()
  }

  React.useEffect(() => {
    // reset on step change
    setHasSubmitted(false)
  }, [nodeExecutionId])

  // https://github.com/harness/harness-core-ui/blob/8b2acdbdb7b6ca71f79fc2e3f76c4b55734b392e/src/modules/70-pipeline/components/PipelineStudio/StepUtil.ts#L184

  const parsedPipelineStage = (parsedStage?.stage?.spec as PipelineStageConfig)?.inputs as PipelineInfoConfig
  const isTemplateParsedPipelineStage = !!parsedPipelineStage?.template
  const finalTemplateParsedPipelineStage = isTemplateParsedPipelineStage
    ? (parsedPipelineStage?.template?.templateInputs as PipelineInfoConfig)
    : parsedPipelineStage
  const parsedStagePath = isTemplateParsedPipelineStage
    ? 'stage.spec.inputs.template.templateInputs'
    : 'stage.spec.inputs'

  let content: React.ReactElement | null = null

  if (loading) {
    content = <Spinner />
  } else if (hasSubmitted) {
    content = <Text>{getString('pipeline.runtimeInputsSubmittedMsg')}</Text>
  } else {
    content = (
      <Formik<Partial<StepElementConfig | StageElementWrapperConfig>>
        formName="execution-input"
        validate={handleValidation}
        initialValues={initialValues}
        onSubmit={handleSubmit}
      >
        <FormikForm>
          {isStageForm ? (
            step.stepType === StepNodeType.PIPELINE_STAGE ? (
              finalTemplateParsedPipelineStage?.stages?.map((stageObj, index) => {
                const childPipelineFieldYaml = isTemplateParsedPipelineStage
                  ? ((fieldYaml?.stage?.spec as PipelineStageConfig)?.inputs?.template
                      ?.templateInputs as PipelineInfoConfig)
                  : ((fieldYaml?.stage?.spec as PipelineStageConfig)?.inputs as PipelineInfoConfig)
                if (stageObj.stage) {
                  const allValues = getStageFromPipeline(stageObj.stage?.identifier || '', childPipelineFieldYaml)
                  return (
                    <Layout.Vertical key={stageObj.stage?.identifier || index}>
                      <StageForm
                        template={stageObj}
                        path={`${parsedStagePath}.stages[${index}].stage`}
                        readonly={isDone}
                        viewType={StepViewType.DeploymentForm}
                        allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION]}
                        stageClassName={css.childStage}
                        allValues={allValues}
                      />
                    </Layout.Vertical>
                  )
                } else if (stageObj.parallel) {
                  return stageObj.parallel.map((stageP, indexp) => {
                    const allValues = getStageFromPipeline(stageP.stage?.identifier || '', childPipelineFieldYaml)
                    return (
                      <Layout.Vertical key={`${stageObj?.stage?.identifier}-${stageP.stage?.identifier}-${indexp}`}>
                        <StageForm
                          template={stageP}
                          path={`${parsedStagePath}.stages[${index}].parallel[${indexp}].stage`}
                          readonly={isDone}
                          viewType={StepViewType.DeploymentForm}
                          allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION]}
                          stageClassName={css.childStage}
                          allValues={allValues}
                        />
                      </Layout.Vertical>
                    )
                  })
                }
              })
            ) : (
              <StageFormInternal
                template={parsedStage}
                path="stage"
                readonly={isDone}
                viewType={StepViewType.DeploymentForm}
                allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION]}
                stageClassName={css.stage}
                allValues={fieldYaml}
              />
            )
          ) : (
            <StepWidget<Partial<StepElementConfig>>
              factory={factory}
              type={stepType}
              allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION]}
              stepViewType={StepViewType.DeploymentForm}
              initialValues={initialValues}
              template={parsedStep}
              readonly={isDone}
              allValues={fieldYaml.step}
            />
          )}
          {isDone ? null : (
            <Layout.Horizontal spacing="medium">
              <Button type="submit" data-testid="submit" variation={ButtonVariation.PRIMARY}>
                {getString('submit')}
              </Button>
              <Button
                intent="danger"
                data-testid="abort"
                variation={ButtonVariation.PRIMARY}
                onClick={openAbortConfirmation}
              >
                {getString('pipeline.execution.actions.abortPipeline')}
              </Button>
              <ConfirmationDialog
                isOpen={isAbortConfirmationOpen}
                cancelButtonText={getString('cancel')}
                contentText={getString('pipeline.execution.dialogMessages.abortExecution')}
                titleText={getString('pipeline.execution.dialogMessages.abortTitle')}
                confirmButtonText={getString('confirm')}
                intent={Intent.WARNING}
                onClose={onAbortConfirmationClose}
              />
            </Layout.Horizontal>
          )}
        </FormikForm>
      </Formik>
    )
  }

  return <div className={cx(css.main, className)}>{content}</div>
}
