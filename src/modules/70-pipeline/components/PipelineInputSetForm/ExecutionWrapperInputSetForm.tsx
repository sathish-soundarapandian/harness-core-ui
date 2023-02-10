/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { identity, pickBy, set, isEmpty } from 'lodash-es'
import type { AllowedTypes } from '@harness/uicore'
import type { StageType } from '@pipeline/utils/stageHelpers'
import type { DeploymentStageConfig, ExecutionWrapperConfig, StepElementConfig } from 'services/cd-ng'
import type { StepViewType } from '../AbstractSteps/Step'
import { CollapseForm } from './CollapseForm'
import type { StageInputSetFormProps } from './StageInputSetForm'
import { StepForm } from './StepInputSetForm'

export function getStepFromStage(stepId: string, steps?: ExecutionWrapperConfig[]): ExecutionWrapperConfig | undefined {
  let responseStep: ExecutionWrapperConfig | undefined = undefined
  steps?.forEach(item => {
    if (item.step?.identifier === stepId) {
      responseStep = item
    } else if (item.stepGroup?.identifier === stepId) {
      responseStep = item
    } else if (item.parallel) {
      return item.parallel.forEach(node => {
        if (node.step?.identifier === stepId || node.stepGroup?.identifier === stepId) {
          responseStep = node
        }
      })
    }
  })
  return responseStep
}

export function ExecutionWrapperInputSetForm(props: {
  stepsTemplate?: ExecutionWrapperConfig[]
  formik: StageInputSetFormProps['formik']
  path: string
  allValues?: ExecutionWrapperConfig[]
  values?: ExecutionWrapperConfig[]
  readonly?: boolean
  viewType: StepViewType
  allowableTypes: AllowedTypes
  executionIdentifier?: string
  customStepProps?: {
    stageIdentifier: string
    selectedStage?: DeploymentStageConfig
    stageType?: StageType
  }
}): JSX.Element {
  const {
    stepsTemplate,
    allValues,
    values,
    path,
    formik,
    readonly,
    viewType,
    allowableTypes,
    executionIdentifier,
    customStepProps
  } = props
  return (
    <>
      {stepsTemplate?.map((item, index) => {
        /* istanbul ignore else */ if (item.step) {
          const originalStep = getStepFromStage(item.step?.identifier || /* istanbul ignore next */ '', allValues)
          const initialValues = getStepFromStage(item.step?.identifier || /* istanbul ignore next */ '', values)
          return originalStep && /* istanbul ignore next */ originalStep.step ? (
            /* istanbul ignore next */ <StepForm
              key={item.step.identifier || index}
              template={item}
              allValues={originalStep}
              values={initialValues}
              path={`${path}[${index}].step`}
              readonly={readonly}
              viewType={viewType}
              allowableTypes={allowableTypes}
              customStepProps={customStepProps}
              onUpdate={data => {
                /* istanbul ignore next */
                if (initialValues) {
                  if (!initialValues.step) {
                    initialValues.step = {
                      identifier: originalStep.step?.identifier || '',
                      name: originalStep.step?.name || '',
                      type: (originalStep.step as StepElementConfig)?.type || ''
                    }
                  }

                  const execObj = {
                    ...data,
                    spec: {
                      ...pickBy(data.spec, identity)
                    }
                  }

                  initialValues.step = {
                    ...execObj,
                    identifier: originalStep.step?.identifier || '',
                    name: originalStep.step?.name || '',
                    type: (originalStep.step as StepElementConfig)?.type || ''
                  }

                  formik?.setValues(set(formik?.values, `${path}[${index}].step`, initialValues.step))
                }
              }}
            />
          ) : null
        } else if (item.parallel) {
          return item.parallel.map((nodep, indexp) => {
            if (nodep.step) {
              const originalStep = getStepFromStage(nodep.step?.identifier || '', allValues)
              const initialValues = getStepFromStage(nodep.step?.identifier || '', values)
              return originalStep && originalStep.step ? (
                <StepForm
                  key={nodep.step.identifier || index}
                  template={nodep}
                  allValues={originalStep}
                  values={initialValues}
                  readonly={readonly}
                  viewType={viewType}
                  path={`${path}[${index}].parallel[${indexp}].step`}
                  allowableTypes={allowableTypes}
                  customStepProps={customStepProps}
                  onUpdate={data => {
                    if (initialValues) {
                      if (!initialValues.step) {
                        initialValues.step = {
                          identifier: originalStep.step?.identifier || '',
                          name: originalStep.step?.name || '',
                          type: (originalStep.step as StepElementConfig)?.type || '',
                          timeout: '10m'
                        }
                      }
                      initialValues.step = {
                        ...data,
                        identifier: originalStep.step?.identifier || '',
                        name: originalStep.step?.name || '',
                        type: (originalStep.step as StepElementConfig)?.type || '',
                        timeout: '10m'
                      }
                      formik?.setValues(
                        set(formik?.values, `${path}[${index}].parallel[${indexp}].step`, initialValues.step)
                      )
                    }
                  }}
                />
              ) : null
            } else if (nodep.stepGroup) {
              const isTemplateStepGroup = !isEmpty(nodep.stepGroup?.template?.templateInputs)
              const stepGroup = getStepFromStage(nodep.stepGroup.identifier, allValues)
              const initialValues = getStepFromStage(nodep.stepGroup?.identifier || '', values)
              return (
                <>
                  <CollapseForm
                    header={isTemplateStepGroup ? nodep.stepGroup?.identifier : stepGroup?.stepGroup?.name || ''}
                    headerProps={{ font: { size: 'normal' } }}
                    headerColor="var(--black)"
                  >
                    <ExecutionWrapperInputSetForm
                      executionIdentifier={executionIdentifier}
                      stepsTemplate={
                        isTemplateStepGroup ? nodep.stepGroup?.template?.templateInputs?.steps : nodep.stepGroup.steps
                      }
                      formik={formik}
                      readonly={readonly}
                      path={
                        isTemplateStepGroup
                          ? `${path}[${index}].parallel[${indexp}].stepGroup.template.templateInputs.steps`
                          : `${path}[${index}].parallel[${indexp}].stepGroup.steps`
                      }
                      allValues={
                        isTemplateStepGroup
                          ? nodep.stepGroup?.template?.templateInputs?.steps
                          : stepGroup?.stepGroup?.steps
                      }
                      values={
                        isTemplateStepGroup
                          ? nodep.stepGroup?.template?.templateInputs?.steps
                          : initialValues?.stepGroup?.steps
                      }
                      viewType={viewType}
                      allowableTypes={allowableTypes}
                      customStepProps={customStepProps}
                    />
                  </CollapseForm>
                </>
              )
            } else {
              return null
            }
          })
        } else if (item.stepGroup) {
          const isTemplateStepGroup = !isEmpty(item?.stepGroup?.template?.templateInputs)
          const stepGroup = getStepFromStage(item.stepGroup.identifier, allValues)
          const initialValues = getStepFromStage(item.stepGroup?.identifier || '', values)
          return (
            <>
              <CollapseForm
                header={stepGroup?.stepGroup?.name || stepGroup?.stepGroup?.identifier || ''}
                headerProps={{ font: { size: 'normal' } }}
                headerColor="var(--black)"
              >
                <ExecutionWrapperInputSetForm
                  executionIdentifier={executionIdentifier}
                  stepsTemplate={
                    isTemplateStepGroup ? item.stepGroup?.template?.templateInputs?.steps : item.stepGroup.steps
                  }
                  formik={formik}
                  readonly={readonly}
                  path={
                    isTemplateStepGroup
                      ? `${path}[${index}].stepGroup.template.templateInputs.steps`
                      : `${path}[${index}].stepGroup.steps`
                  }
                  allValues={
                    isTemplateStepGroup
                      ? initialValues?.stepGroup?.template?.templateInputs?.steps
                      : initialValues?.stepGroup?.steps
                  }
                  values={
                    isTemplateStepGroup
                      ? initialValues?.stepGroup?.template?.templateInputs?.steps
                      : initialValues?.stepGroup?.steps
                  }
                  viewType={viewType}
                  allowableTypes={allowableTypes}
                  customStepProps={customStepProps}
                />
              </CollapseForm>
            </>
          )
        } else {
          return null
        }
      })}
    </>
  )
}
