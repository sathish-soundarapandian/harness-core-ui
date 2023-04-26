/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { FormikErrors, yupToFormErrors } from 'formik'
import { getMultiTypeFromValue, MultiTypeInputType } from '@harness/uicore'
import { isEmpty, has, set, isBoolean, get, pick, defaultTo } from 'lodash-es'
import * as Yup from 'yup'
import type { K8sDirectInfraYaml } from 'services/ci'
import type { DeploymentStageConfig, Infrastructure, ServiceYamlV2 } from 'services/cd-ng'

import type { UseStringsReturn } from 'framework/strings'
import { getDurationValidationSchema } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import {
  TemplateStepNode,
  StageElementWrapperConfig,
  StepElementConfig,
  PipelineInfoConfig,
  ExecutionWrapperConfig,
  StageElementConfig,
  PipelineStageConfig,
  ResponsePMSPipelineResponseDTO,
  getPipelinePromise
} from 'services/pipeline-ng'
import { getStepTypeByDeploymentType, StageType } from '@pipeline/utils/stageHelpers'
import { getPrCloneStrategyOptions } from '@pipeline/utils/constants'
import { CodebaseTypes, isCloneCodebaseEnabledAtLeastOneStage } from '@pipeline/utils/CIUtils'
import { isValueRuntimeInput } from '@common/utils/utils'
import type { AccountPathProps, GitQueryParams } from '@common/interfaces/RouteInterfaces'
import factory from '../PipelineSteps/PipelineStepFactory'
import { StepType } from '../PipelineSteps/PipelineStepInterface'
// eslint-disable-next-line no-restricted-imports
import '@cd/components/PipelineSteps'
// eslint-disable-next-line no-restricted-imports
import '@ci/components/PipelineSteps'
// eslint-disable-next-line no-restricted-imports
import '@sto/components/PipelineSteps'
import { StepViewType } from '../AbstractSteps/Step'
import type { StageSelectionData } from '../../utils/runPipelineUtils'
import { getSelectedStagesFromPipeline } from './CommonUtils/CommonUtils'
import type { DeployServiceEntityData } from '../PipelineInputSetForm/ServicesInputSetForm/ServicesInputSetForm'
import { validateOutputPanelInputSet } from '../CommonPipelineStages/PipelineStage/PipelineStageOutputSection/utils'
import { getFailureStrategiesValidationSchema } from '../PipelineSteps/AdvancedSteps/FailureStrategyPanel/validation'

interface childPipelineMetadata {
  pipelineId: string
  orgId: string
  projectId: string
}

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

export function getStageFromPipeline(
  stageId: string,
  pipeline?: PipelineInfoConfig
): StageElementWrapperConfig | undefined {
  if (pipeline?.stages) {
    let responseStage: StageElementWrapperConfig | undefined = undefined
    pipeline.stages.forEach(item => {
      if (item.stage && item.stage.identifier === stageId) {
        responseStage = item
      } else if (item.parallel) {
        return item.parallel.forEach(node => {
          if (node.stage?.identifier === stageId) {
            responseStage = node
          }
        })
      }
    })
    return responseStage
  }
  return
}

export function getChildPipelinesMetadata(pipeline?: PipelineInfoConfig): childPipelineMetadata[] {
  const childPipelinesMetaData: childPipelineMetadata[] = []
  if (pipeline?.stages) {
    pipeline.stages.forEach(item => {
      if (item.stage) {
        const childPipelineSpecData = get(item, 'stage.spec')
        if (item.stage.type === StageType.PIPELINE && !isEmpty(childPipelineSpecData)) {
          const {
            pipeline: pipelineId,
            org: orgId,
            project: projectId
          } = pick(childPipelineSpecData, ['pipeline', 'org', 'project'])
          childPipelinesMetaData.push({
            pipelineId,
            orgId,
            projectId
          })
        }
      } else if (item.parallel) {
        item.parallel.forEach(node => {
          const childPipelineSpecData = get(node, 'stage.spec')
          if (node.stage?.type === StageType.PIPELINE && !isEmpty(childPipelineSpecData)) {
            const {
              pipeline: pipelineId,
              org: orgId,
              project: projectId
            } = pick(childPipelineSpecData, ['pipeline', 'org', 'project'])
            childPipelinesMetaData.push({
              pipelineId,
              orgId,
              projectId
            })
          }
        })
      }
    })
  }
  return childPipelinesMetaData
}

export function getPromisesForChildPipeline(
  params: AccountPathProps & GitQueryParams,
  childPipelinesMetaData: childPipelineMetadata[]
): Promise<ResponsePMSPipelineResponseDTO>[] {
  const { accountId, repoIdentifier, branch, connectorRef } = params
  const promises = childPipelinesMetaData.map(({ pipelineId, orgId, projectId }) => {
    return getPipelinePromise({
      pipelineIdentifier: pipelineId,
      queryParams: {
        accountIdentifier: accountId,
        orgIdentifier: orgId,
        projectIdentifier: projectId,
        repoIdentifier,
        branch,
        getTemplatesResolvedPipeline: true,
        parentEntityConnectorRef: connectorRef,
        parentEntityRepoName: repoIdentifier
      },
      requestOptions: { headers: { 'Load-From-Cache': 'true' } }
    })
  })
  return promises
}

export interface ValidateStepProps {
  step: StepElementConfig | TemplateStepNode
  getString: UseStringsReturn['getString']
  viewType: StepViewType
  template?: StepElementConfig | TemplateStepNode
  originalStep?: ExecutionWrapperConfig
}

export const validateStep = ({
  step,
  template,
  originalStep,
  getString,
  viewType
}: ValidateStepProps): FormikErrors<StepElementConfig> => {
  const errors = {}
  const isTemplateStep = !!(originalStep?.step as unknown as TemplateStepNode)?.template
  const stepType = isTemplateStep ? StepType.Template : (originalStep?.step as StepElementConfig)?.type
  const pipelineStep = factory.getStep(stepType)
  const delegateSelectorPath = 'spec.delegateSelectors'
  const failureStrategySchema = getFailureStrategiesValidationSchema(getString)
  const failureStrategy = Yup.object().shape({
    failureStrategies: failureStrategySchema
  })

  const errorResponse = defaultTo(
    pipelineStep?.validateInputSet({
      data: step,
      template: template,
      getString,
      viewType
    }),
    {}
  )
  if (get(template, delegateSelectorPath) && isEmpty(get(step, delegateSelectorPath))) {
    set(
      errors,
      `step.${delegateSelectorPath}`,
      getString?.('common.validation.fieldIsRequired', { name: getString('delegate.DelegateSelector') })
    )
  }

  try {
    failureStrategy.validateSync(step)
  } catch (error) {
    if (error instanceof Yup.ValidationError) {
      const failureStrategyFormErrors = yupToFormErrors(error)
      Object.assign(errorResponse, failureStrategyFormErrors)
    }
  }

  if (!isEmpty(errorResponse)) {
    const suffix = isTemplateStep ? '.template.templateInputs' : ''
    set(errors, `step${suffix}`, errorResponse)
  }
  return errors
}

export interface ValidateStepsProps {
  steps: ExecutionWrapperConfig[]
  getString: UseStringsReturn['getString']
  viewType: StepViewType
  template?: ExecutionWrapperConfig[]
  originalSteps?: ExecutionWrapperConfig[]
}

export const validateSteps = ({
  steps,
  template,
  originalSteps,
  getString,
  viewType
}: ValidateStepsProps): FormikErrors<ExecutionWrapperConfig> => {
  const errors = {}
  const failureStrategySchema = getFailureStrategiesValidationSchema(getString)
  const failureStrategy = Yup.object().shape({
    failureStrategies: failureStrategySchema
  })
  steps.forEach((stepObj, index) => {
    if (stepObj.step) {
      const errorResponse = validateStep({
        step: stepObj.step,
        template: template?.[index].step,
        originalStep: getStepFromStage(stepObj.step.identifier, originalSteps),
        getString,
        viewType
      })
      if (!isEmpty(errorResponse)) {
        set(errors, `steps[${index}]`, errorResponse)
      }
    } else if (stepObj.parallel) {
      stepObj.parallel.forEach((stepParallel, indexP) => {
        if (stepParallel.step) {
          const errorResponse = validateStep({
            step: stepParallel.step,
            template: template?.[index]?.parallel?.[indexP]?.step,
            originalStep: getStepFromStage(stepParallel.step.identifier, originalSteps),
            getString,
            viewType
          })
          if (!isEmpty(errorResponse)) {
            set(errors, `steps[${index}].parallel[${indexP}]`, errorResponse)
          }
        }
        if (stepParallel?.stepGroup) {
          if (stepParallel?.stepGroup?.steps) {
            const errorResponse = validateSteps({
              steps: stepParallel?.stepGroup?.steps,
              template: template?.[index]?.parallel?.[indexP]?.stepGroup?.steps,
              originalSteps: getStepFromStage(stepParallel.stepGroup.identifier, originalSteps)?.stepGroup?.steps,
              getString,
              viewType
            })
            try {
              failureStrategy.validateSync(stepParallel?.stepGroup)
            } catch (error) {
              if (error instanceof Yup.ValidationError) {
                const failureStrategyFormErrors = yupToFormErrors(error)
                Object.assign(errorResponse, failureStrategyFormErrors)
              }
            }
            if (!isEmpty(errorResponse)) {
              set(errors, `steps[${index}].parallel[${indexP}].stepGroup`, errorResponse)
            }
          }
          if (stepParallel?.stepGroup?.template?.templateInputs?.steps) {
            const errorResponse = validateSteps({
              steps: stepParallel?.stepGroup?.template?.templateInputs?.steps,
              template: template?.[index]?.parallel?.[indexP]?.stepGroup?.template?.templateInputs?.steps,
              originalSteps: getStepFromStage(stepParallel.stepGroup.identifier, originalSteps)?.stepGroup?.template
                ?.templateInputs?.steps,
              getString,
              viewType
            })
            try {
              failureStrategy.validateSync(stepParallel?.stepGroup?.template?.templateInputs)
            } catch (error) {
              if (error instanceof Yup.ValidationError) {
                const failureStrategyFormErrors = yupToFormErrors(error)
                Object.assign(errorResponse, failureStrategyFormErrors)
              }
            }
            if (!isEmpty(errorResponse)) {
              set(errors, `steps[${index}].parallel[${indexP}].stepGroup.template.templateInputs`, errorResponse)
            }
          }
        }
      })
    } else if (stepObj.stepGroup) {
      const originalStepGroup = getStepFromStage(stepObj.stepGroup.identifier, originalSteps)
      if (stepObj.stepGroup.steps) {
        const errorResponse = validateSteps({
          steps: stepObj.stepGroup.steps,
          template: template?.[index]?.stepGroup?.steps,
          originalSteps: originalStepGroup?.stepGroup?.steps,
          getString,
          viewType
        })
        try {
          failureStrategy.validateSync(stepObj?.stepGroup)
        } catch (error) {
          if (error instanceof Yup.ValidationError) {
            const failureStrategyFormErrors = yupToFormErrors(error)
            Object.assign(errorResponse, failureStrategyFormErrors)
          }
        }
        if (!isEmpty(errorResponse)) {
          set(errors, `steps[${index}].stepGroup`, errorResponse)
        }
      }
      if (stepObj.stepGroup?.template?.templateInputs?.steps) {
        const errorResponse = validateSteps({
          steps: stepObj.stepGroup?.template?.templateInputs?.steps,
          template: template?.[index]?.stepGroup?.template?.templateInputs?.steps,
          originalSteps: originalStepGroup?.stepGroup?.template?.templateInputs?.steps,
          getString,
          viewType
        })
        try {
          failureStrategy.validateSync(stepObj.stepGroup?.template?.templateInputs)
        } catch (error) {
          if (error instanceof Yup.ValidationError) {
            const failureStrategyFormErrors = yupToFormErrors(error)
            Object.assign(errorResponse, failureStrategyFormErrors)
          }
        }
        if (!isEmpty(errorResponse)) {
          set(errors, `steps[${index}].stepGroup.template.templateInputs`, errorResponse)
        }
      }
    }
  })

  return errors
}

interface ValidateStageProps {
  stage: StageElementConfig
  getString: UseStringsReturn['getString']
  viewType: StepViewType
  template?: StageElementConfig
  originalStage?: StageElementConfig
}

export const validateStage = ({
  stage,
  template,
  viewType,
  originalStage,
  getString
}: ValidateStageProps): FormikErrors<StageElementConfig> => {
  if (originalStage?.template) {
    const errors = validateStage({
      stage: stage.template?.templateInputs as StageElementConfig,
      template: template?.template?.templateInputs as StageElementConfig,
      viewType,
      originalStage: originalStage.template.templateInputs as StageElementConfig,
      getString
    })
    if (!isEmpty(errors)) {
      return set({}, 'template.templateInputs', errors)
    } else {
      return {}
    }
  } else {
    const errors = {}

    // Validation for infrastructure namespace
    // For CD spec is DeploymentStageConfig
    const stageConfig = stage.spec as DeploymentStageConfig | undefined
    const templateStageConfig = template?.spec as DeploymentStageConfig | undefined
    const originalStageConfig = originalStage?.spec as DeploymentStageConfig | undefined
    if (
      viewType !== StepViewType.InputSet && // no fields are required on InputSet creation
      isEmpty((stageConfig?.infrastructure as Infrastructure)?.spec?.namespace) &&
      getMultiTypeFromValue((templateStageConfig?.infrastructure as Infrastructure)?.spec?.namespace) ===
        MultiTypeInputType.RUNTIME
    ) {
      set(
        errors,
        'spec.infrastructure.spec.namespace',
        getString?.('fieldRequired', { field: getString?.('pipelineSteps.build.infraSpecifications.namespace') })
      )
    }
    if (stage.type === 'Deployment' && templateStageConfig?.serviceConfig?.serviceRef) {
      const step = factory.getStep(StepType.DeployService)
      const errorsResponse = step?.validateInputSet({
        data: stageConfig?.serviceConfig,
        template: templateStageConfig?.serviceConfig,
        getString,
        viewType
      })
      if (!isEmpty(errorsResponse)) {
        set(errors, 'spec.serviceConfig', errorsResponse)
      }
    }

    if (stage.type === 'Deployment' && templateStageConfig?.service) {
      const currentStep = factory.getStep(StepType.DeployServiceEntity)
      const stepErrorsResponse = currentStep?.validateInputSet({
        data: stageConfig,
        template: templateStageConfig,
        getString,
        viewType
      }) as FormikErrors<Required<DeployServiceEntityData>>

      if (!isEmpty(stepErrorsResponse)) {
        set(errors, 'spec.service.serviceRef', stepErrorsResponse?.service?.serviceRef)
      }
      const serviceInputs = stageConfig?.service?.serviceInputs
      if (serviceInputs && !isValueRuntimeInput(templateStageConfig?.service?.serviceInputs as unknown as string)) {
        const serviceStep = factory.getStep(getStepTypeByDeploymentType(serviceInputs?.serviceDefinition?.type))
        const serviceStepErrorResponse = serviceStep?.validateInputSet({
          data: serviceInputs.serviceDefinition.spec,
          template: templateStageConfig?.service?.serviceInputs?.serviceDefinition.spec,
          getString,
          viewType
        })
        if (!isEmpty(serviceStepErrorResponse)) {
          set(errors, `spec.service.serviceInputs.serviceDefinition.spec`, serviceStepErrorResponse)
        }
      }
    }
    if (stage.type === 'Deployment' && templateStageConfig?.services) {
      const currentStep = factory.getStep(StepType.DeployServiceEntity)
      const stepErrorsResponse = currentStep?.validateInputSet({
        data: stageConfig,
        template: templateStageConfig,
        getString,
        viewType
      }) as FormikErrors<Required<DeployServiceEntityData>>

      if (!isEmpty(stepErrorsResponse)) {
        set(errors, 'spec.services', stepErrorsResponse?.services)
      }
      const serviceInputs = stageConfig?.services?.values
      if (serviceInputs && !isValueRuntimeInput(templateStageConfig?.services?.values as unknown as string)) {
        serviceInputs.forEach((serviceInput: ServiceYamlV2, index: number) => {
          const serviceStep = factory.getStep(
            getStepTypeByDeploymentType(serviceInput?.serviceInputs?.serviceDefinition?.type)
          )
          const serviceStepErrorResponse = serviceStep?.validateInputSet({
            data: serviceInput.serviceInputs?.serviceDefinition.spec,
            template: templateStageConfig?.services?.values?.[index]?.serviceInputs?.serviceDefinition?.spec,
            getString,
            viewType
          })
          if (!isEmpty(serviceStepErrorResponse)) {
            set(errors, `spec.services.values[${index}].serviceInputs.serviceDefinition.spec`, serviceStepErrorResponse)
          }
        })
      }
    }

    if (stage.type === 'Deployment' && templateStageConfig?.infrastructure?.environmentRef) {
      const step = factory.getStep(StepType.DeployEnvironment)
      const errorsResponse = step?.validateInputSet({
        data: stageConfig?.infrastructure,
        template: templateStageConfig?.infrastructure,
        getString,
        viewType
      })
      if (!isEmpty(errorsResponse)) {
        set(errors, 'spec.infrastructure', errorsResponse)
      }
    }
    if (
      stageConfig?.infrastructure?.infrastructureDefinition?.spec &&
      originalStageConfig?.infrastructure?.infrastructureDefinition?.type
    ) {
      const step = factory.getStep(originalStageConfig.infrastructure.infrastructureDefinition.type)
      const errorsResponse = step?.validateInputSet({
        data: stageConfig?.infrastructure?.infrastructureDefinition?.spec,
        template: templateStageConfig?.infrastructure?.infrastructureDefinition?.spec,
        getString,
        viewType
      })
      if (!isEmpty(errorsResponse)) {
        set(errors, 'spec.infrastructure.infrastructureDefinition.spec', errorsResponse)
      }
    }
    // CI validation
    if (
      viewType !== StepViewType.InputSet &&
      isEmpty((stageConfig?.infrastructure as K8sDirectInfraYaml)?.spec?.connectorRef) &&
      (stageConfig?.infrastructure as K8sDirectInfraYaml)?.type === 'KubernetesDirect' &&
      getMultiTypeFromValue((templateStageConfig?.infrastructure as Infrastructure)?.spec?.connectorRef) ===
        MultiTypeInputType.RUNTIME
    ) {
      set(
        errors,
        'spec.infrastructure.spec.connectorRef',
        getString?.('fieldRequired', {
          field: getString?.('connectors.title.k8sCluster')
        })
      )
    }
    if (
      viewType !== StepViewType.InputSet &&
      isEmpty((stageConfig?.infrastructure as Infrastructure)?.spec?.spec?.poolName) &&
      (stageConfig?.infrastructure as K8sDirectInfraYaml)?.type === 'VM' &&
      getMultiTypeFromValue((templateStageConfig?.infrastructure as Infrastructure)?.spec?.spec?.poolName) ===
        MultiTypeInputType.RUNTIME
    ) {
      set(
        errors,
        'spec.infrastructure.spec.spec.poolName',
        getString?.('fieldRequired', {
          field: getString?.('pipeline.buildInfra.poolName')
        })
      )
    }

    if (stage?.failureStrategies && stage.failureStrategies?.length > 0) {
      const failureStrategySchema = getFailureStrategiesValidationSchema(getString)
      const failureStrategy = Yup.object().shape({
        failureStrategies: failureStrategySchema
      })

      try {
        failureStrategy.validateSync(stage)
      } catch (error) {
        if (error instanceof Yup.ValidationError) {
          const failureStrategyFormErrors = yupToFormErrors(error)
          Object.assign(errors, failureStrategyFormErrors)
        }
      }
    }

    if (stageConfig?.serviceConfig?.serviceDefinition?.type) {
      const step = factory.getStep(getStepTypeByDeploymentType(stageConfig?.serviceConfig?.serviceDefinition?.type))
      const errorsResponse = step?.validateInputSet({
        data: stageConfig?.serviceConfig?.serviceDefinition?.spec,
        template: templateStageConfig?.serviceConfig?.serviceDefinition?.spec,
        getString,
        viewType
      })

      if (!isEmpty(errorsResponse)) {
        set(errors, 'spec.serviceConfig.serviceDefinition.spec', errorsResponse)
      }
    }

    if (stageConfig?.execution?.steps) {
      const errorsResponse = validateSteps({
        steps: stageConfig.execution.steps as ExecutionWrapperConfig[],
        template: templateStageConfig?.execution?.steps,
        originalSteps: originalStageConfig?.execution?.steps,
        getString,
        viewType
      })
      if (!isEmpty(errorsResponse)) {
        set(errors, 'spec.execution', errorsResponse)
      }
    }
    if (stageConfig?.execution?.rollbackSteps) {
      const errorsResponse = validateSteps({
        steps: stageConfig.execution.rollbackSteps as ExecutionWrapperConfig[],
        template: templateStageConfig?.execution?.rollbackSteps,
        originalSteps: originalStageConfig?.execution?.rollbackSteps,
        getString,
        viewType
      })
      if (!isEmpty(errorsResponse)) {
        set(errors, 'spec.execution.rollbackSteps', errorsResponse)
      }
    }
    // IACM validation
    if (
      viewType !== StepViewType.InputSet &&
      isEmpty((stageConfig as DeploymentStageConfig & { stackID: string; workflow: string })?.workflow) &&
      getMultiTypeFromValue(
        (templateStageConfig as DeploymentStageConfig & { stackID: string; workflow: string })?.workflow
      ) === MultiTypeInputType.RUNTIME
    ) {
      set(
        errors,
        'spec.workflow',
        getString?.('fieldRequired', {
          field: getString('pipeline.iacm.workflow')
        })
      )
    }
    if (
      viewType !== StepViewType.InputSet &&
      isEmpty((stageConfig as DeploymentStageConfig & { stackID: string; workflow: string })?.stackID) &&
      getMultiTypeFromValue(
        (templateStageConfig as DeploymentStageConfig & { stackID: string; workflow: string })?.stackID
      ) === MultiTypeInputType.RUNTIME
    ) {
      set(
        errors,
        'spec.stackID',
        getString?.('fieldRequired', {
          field: getString('pipeline.iacm.resourceStack')
        })
      )
    }

    return errors
  }
}

interface ValidatePipelineProps {
  pipeline: PipelineInfoConfig
  viewType: StepViewType
  getString: UseStringsReturn['getString']
  template?: PipelineInfoConfig
  originalPipeline?: PipelineInfoConfig
  resolvedPipeline?: PipelineInfoConfig
  path?: string
  viewTypeMetadata?: { [key: string]: boolean }
  selectedStageData?: StageSelectionData
  stagesToExecute?: string[]
}

/**
 * Validation for CI Codebase
 */
export const validateCICodebase = ({
  pipeline,
  template,
  originalPipeline,
  resolvedPipeline, // used when originalPipeline is a template and we need to check clone codebase
  getString,
  viewTypeMetadata,
  selectedStageData
}: ValidatePipelineProps): FormikErrors<PipelineInfoConfig> => {
  const errors = {}
  const requiresConnectorRuntimeInputValue =
    template?.properties?.ci?.codebase?.connectorRef && !pipeline?.properties?.ci?.codebase?.connectorRef

  let pipelineHasCloneCodebase = isCloneCodebaseEnabledAtLeastOneStage(resolvedPipeline || originalPipeline)
  if (selectedStageData && !selectedStageData.allStagesSelected) {
    pipelineHasCloneCodebase = getSelectedStagesFromPipeline(
      resolvedPipeline || originalPipeline,
      selectedStageData
    )?.some(
      stage =>
        get(stage, 'stage.spec.cloneCodebase') ||
        stage?.parallel?.some(parallelStage => get(parallelStage, 'stage.spec.cloneCodebase'))
    )
  }
  const shouldValidateCICodebase =
    pipelineHasCloneCodebase &&
    (!requiresConnectorRuntimeInputValue ||
      (requiresConnectorRuntimeInputValue && !isEmpty(pipeline?.properties?.ci?.codebase?.connectorRef))) // ci codebase field is hidden until connector is selected
  const shouldValidate = !Object.keys(viewTypeMetadata || {}).includes('isTemplateBuilder')
  const isInputSetForm = viewTypeMetadata?.isInputSet // should not require any values
  const isCodebaseBuildEmpty =
    has(originalPipeline, 'properties') &&
    has(originalPipeline?.properties, 'ci') &&
    isEmpty(get(originalPipeline, 'properties.ci.codebase.build') || get(pipeline, 'properties.ci.codebase.build'))
  if (shouldValidate && shouldValidateCICodebase && !isInputSetForm && isCodebaseBuildEmpty && getString) {
    set(errors, 'properties.ci.codebase', getString('fieldRequired', { field: getString('ciCodebase') }))
  }

  if (
    shouldValidateCICodebase &&
    getMultiTypeFromValue((template as PipelineInfoConfig)?.properties?.ci?.codebase?.build as unknown as string) ===
      MultiTypeInputType.RUNTIME
  ) {
    // connectorRef required to display build type
    if (
      isEmpty(pipeline?.properties?.ci?.codebase?.build?.type) &&
      !isInputSetForm &&
      (!requiresConnectorRuntimeInputValue ||
        (requiresConnectorRuntimeInputValue && pipeline?.properties?.ci?.codebase?.connectorRef)) &&
      pipelineHasCloneCodebase
    ) {
      set(
        errors,
        'properties.ci.codebase.build.type',
        getString?.('fieldRequired', { field: getString?.('pipeline.ciCodebase.ciCodebaseBuildType') })
      )
    }

    if (
      pipeline?.properties?.ci?.codebase?.build?.type === CodebaseTypes.BRANCH &&
      isEmpty(pipeline?.properties?.ci?.codebase?.build?.spec?.branch) &&
      !isInputSetForm
    ) {
      set(
        errors,
        'properties.ci.codebase.build.spec.branch',
        getString?.('fieldRequired', { field: getString?.('gitBranch') })
      )
    }

    if (
      pipeline?.properties?.ci?.codebase?.build?.type === CodebaseTypes.TAG &&
      isEmpty(pipeline?.properties?.ci?.codebase?.build?.spec?.tag) &&
      !isInputSetForm
    ) {
      set(errors, 'properties.ci.codebase.build.spec.tag', getString?.('fieldRequired', { field: getString('gitTag') }))
    }

    if (pipeline?.properties?.ci?.codebase?.build?.type === CodebaseTypes.PR && !isInputSetForm) {
      if (
        getMultiTypeFromValue(pipeline?.properties?.ci?.codebase?.build?.spec?.number) !==
          MultiTypeInputType.EXPRESSION &&
        (isNaN(pipeline?.properties?.ci?.codebase?.build?.spec?.number) ||
          !Number.isInteger(parseFloat(pipeline?.properties?.ci?.codebase?.build?.spec?.number)) ||
          parseFloat(pipeline?.properties?.ci?.codebase?.build?.spec?.number) < 1)
      ) {
        set(
          errors,
          'properties.ci.codebase.build.spec.number',
          getString?.('pipeline.ciCodebase.validation.pullRequestNumber')
        )
      }
      if (isEmpty(pipeline?.properties?.ci?.codebase?.build?.spec?.number)) {
        set(
          errors,
          'properties.ci.codebase.build.spec.number',
          getString?.('fieldRequired', { field: getString?.('pipeline.gitPullRequestNumber') })
        )
      }
    }
  }

  if (shouldValidate) {
    if (requiresConnectorRuntimeInputValue && pipelineHasCloneCodebase && !isInputSetForm) {
      set(
        errors,
        'properties.ci.codebase.connectorRef',
        getString?.('fieldRequired', { field: getString?.('connector') })
      )
    }

    if (
      template?.properties?.ci?.codebase?.repoName &&
      pipeline?.properties?.ci?.codebase?.repoName?.trim() === '' &&
      !isInputSetForm
    ) {
      // connector with account url type will remove repoName requirement
      set(
        errors,
        'properties.ci.codebase.repoName',
        getString?.('fieldRequired', { field: getString?.('common.repositoryName') })
      )
    }

    if (template?.properties?.ci?.codebase?.depth) {
      const depth = pipeline?.properties?.ci?.codebase?.depth
      if (
        (depth || depth === ('' as any) || depth === 0) &&
        ((typeof depth === 'number' && depth < 1) ||
          typeof depth !== 'number' ||
          (typeof depth === 'string' && parseInt(depth) < 1))
      ) {
        set(errors, 'properties.ci.codebase.depth', getString?.('pipeline.ciCodebase.validation.optionalDepth'))
      }
    }

    if (template?.properties?.ci?.codebase?.sslVerify && pipelineHasCloneCodebase) {
      const sslVerify = pipeline?.properties?.ci?.codebase?.sslVerify
      if (sslVerify === ('' as any) || !isBoolean(sslVerify)) {
        set(errors, 'properties.ci.codebase.sslVerify', getString?.('pipeline.ciCodebase.validation.optionalSslVerify'))
      }
    }

    if (template?.properties?.ci?.codebase?.prCloneStrategy) {
      // error will appear in yaml view
      const prCloneStrategy = pipeline?.properties?.ci?.codebase?.prCloneStrategy
      const prCloneStrategyOptions = (getString && getPrCloneStrategyOptions(getString)) || []
      const prCloneStrategyOptionsValues = prCloneStrategyOptions.map(option => option.value)
      if (
        prCloneStrategy === ('' as any) ||
        (prCloneStrategy && !prCloneStrategyOptionsValues.some(value => value === prCloneStrategy))
      ) {
        set(
          errors,
          'properties.ci.codebase.prCloneStrategy',
          getString?.('pipeline.ciCodebase.validation.optionalPrCloneStrategy', {
            values: prCloneStrategyOptionsValues.join(', ')
          })
        )
      }
    }

    if (template?.properties?.ci?.codebase?.resources?.limits?.memory) {
      const memoryLimit = pipeline?.properties?.ci?.codebase?.resources?.limits?.memory
      const pattern = /^\d+(\.\d+)?$|^\d+(\.\d+)?(G|M|Gi|Mi|MiB)$|^$/
      if (
        memoryLimit === '' ||
        (memoryLimit && (!pattern.test(memoryLimit) || !isNaN(memoryLimit as unknown as number)))
      ) {
        set(
          errors,
          'properties.ci.codebase.resources.limits.memory',
          getString?.('pipeline.ciCodebase.validation.optionalLimitMemory')
        )
      }
    }

    if (template?.properties?.ci?.codebase?.resources?.limits?.cpu) {
      const cpuLimit = pipeline?.properties?.ci?.codebase?.resources?.limits?.cpu
      const pattern = /^\d+(\.\d+)?$|^\d+m$|^$/
      if (cpuLimit === '' || (cpuLimit && (!pattern.test(cpuLimit) || !isNaN(cpuLimit as unknown as number)))) {
        set(
          errors,
          'properties.ci.codebase.resources.limits.cpu',
          getString?.('pipeline.ciCodebase.validation.optionalLimitCPU')
        )
      }
    }
  }
  return errors
}

export const validatePipeline = ({
  pipeline,
  template,
  originalPipeline,
  resolvedPipeline,
  viewType,
  getString,
  path,
  viewTypeMetadata,
  selectedStageData,
  stagesToExecute
}: ValidatePipelineProps): FormikErrors<PipelineInfoConfig> => {
  if (template?.template) {
    const errors = validatePipeline({
      pipeline: pipeline.template?.templateInputs as PipelineInfoConfig,
      template: template.template?.templateInputs as PipelineInfoConfig,
      viewType,
      originalPipeline: originalPipeline?.template?.templateInputs as PipelineInfoConfig,
      resolvedPipeline,
      getString,
      viewTypeMetadata
    })
    if (!isEmpty(errors)) {
      return set({}, 'template.templateInputs', errors)
    } else {
      return {}
    }
  } else {
    const errors = validateCICodebase({
      pipeline,
      template,
      originalPipeline,
      resolvedPipeline,
      viewType,
      getString,
      path,
      viewTypeMetadata,
      selectedStageData
    })

    if (getMultiTypeFromValue(template?.timeout) === MultiTypeInputType.RUNTIME) {
      let timeoutSchema = getDurationValidationSchema({ minimum: '10s' })
      if (viewType === StepViewType.DeploymentForm) {
        timeoutSchema = timeoutSchema.required(getString?.('validation.timeout10SecMinimum'))
      }
      const timeout = Yup.object().shape({
        timeout: timeoutSchema
      })

      try {
        timeout.validateSync(pipeline)
      } catch (e) {
        /* istanbul ignore else */
        if (e instanceof Yup.ValidationError) {
          const err = yupToFormErrors(e)

          Object.assign(errors, err)
        }
      }
    }
    const stages = stagesToExecute?.length
      ? pipeline?.stages?.filter(stage => stage && stage.stage && stagesToExecute.includes(stage.stage.identifier))
      : pipeline?.stages

    const templateStages = stagesToExecute?.length
      ? template?.stages?.filter(stage => stage && stage.stage && stagesToExecute.includes(stage.stage.identifier))
      : template?.stages

    const filteredTemplate = {
      ...template,
      stages: {
        ...templateStages
      }
    }
    stages?.forEach((stageObj, index) => {
      if (stageObj.stage) {
        const originalStage = getStageFromPipeline(stageObj.stage.identifier, originalPipeline)
        if (stageObj.stage.type === StageType.PIPELINE) {
          const chainedPipeline = (stageObj.stage?.spec as PipelineStageConfig)?.inputs as PipelineInfoConfig
          const chainedPipelineTemplate = (filteredTemplate?.stages?.[index]?.stage?.spec as PipelineStageConfig)
            ?.inputs as PipelineInfoConfig
          const _originalPipeline = (originalPipeline?.stages?.[index]?.stage?.spec as PipelineStageConfig)
            ?.inputs as PipelineInfoConfig

          const chainedPipelineOutputErrorsResponse = validateOutputPanelInputSet({
            data: { outputs: get(stageObj.stage?.spec as PipelineStageConfig, 'outputs', []) },
            template: {
              outputs: get(filteredTemplate?.stages?.[index]?.stage?.spec as PipelineStageConfig, 'outputs', [])
            },
            getString
          })
          if (!isEmpty(chainedPipelineOutputErrorsResponse.outputs)) {
            set(
              errors,
              `${isEmpty(path) ? '' : `${path}.`}stages[${index}].stage.spec.outputs`,
              chainedPipelineOutputErrorsResponse.outputs
            )
          }

          const chainedPipelineErrorsResponse = validatePipeline({
            pipeline: chainedPipeline,
            template: chainedPipelineTemplate,
            originalPipeline: _originalPipeline,
            resolvedPipeline,
            viewType,
            getString,
            path,
            viewTypeMetadata,
            selectedStageData
          })
          if (!isEmpty(chainedPipelineErrorsResponse)) {
            set(
              errors,
              `${isEmpty(path) ? '' : `${path}.`}stages[${index}].stage.spec.inputs`,
              chainedPipelineErrorsResponse
            )
          }
        } else {
          const errorsResponse = validateStage({
            stage: stageObj.stage as StageElementConfig,
            template: filteredTemplate?.stages?.[index]?.stage,
            originalStage: originalStage?.stage,
            getString,
            viewType
          })
          if (!isEmpty(errorsResponse)) {
            set(errors, `${isEmpty(path) ? '' : `${path}.`}stages[${index}].stage`, errorsResponse)
          }
        }
      }
      if (stageObj.parallel) {
        stageObj.parallel.forEach((stageP, indexP: number) => {
          if (stageP.stage) {
            const originalStage = getStageFromPipeline(stageP.stage.identifier, originalPipeline)
            if (stageP.stage.type === StageType.PIPELINE) {
              const chainedPipeline = (stageP.stage?.spec as PipelineStageConfig)?.inputs as PipelineInfoConfig
              const chainedPipelineTemplate = (
                filteredTemplate?.stages?.[index]?.parallel?.[indexP]?.stage?.spec as PipelineStageConfig
              )?.inputs as PipelineInfoConfig
              const _originalPipeline = (
                originalPipeline?.stages?.[index]?.parallel?.[indexP]?.stage?.spec as PipelineStageConfig
              )?.inputs as PipelineInfoConfig

              const chainedPipelineOutputErrorsResponse = validateOutputPanelInputSet({
                data: { outputs: get(stageP.stage?.spec as PipelineStageConfig, 'outputs', []) },
                template: {
                  outputs: get(
                    filteredTemplate?.stages?.[index]?.parallel?.[indexP]?.stage?.spec as PipelineStageConfig,
                    'outputs',
                    []
                  )
                },
                getString
              })
              if (!isEmpty(chainedPipelineOutputErrorsResponse.outputs)) {
                set(
                  errors,
                  `${isEmpty(path) ? '' : `${path}.`}stages[${index}].parallel[${indexP}].stage.spec.outputs`,
                  chainedPipelineOutputErrorsResponse.outputs
                )
              }

              const chainedPipelineErrorsResponse = validatePipeline({
                pipeline: chainedPipeline,
                template: chainedPipelineTemplate,
                originalPipeline: _originalPipeline,
                resolvedPipeline,
                viewType,
                getString,
                path,
                viewTypeMetadata,
                selectedStageData
              })
              if (!isEmpty(chainedPipelineErrorsResponse)) {
                set(
                  errors,
                  `${isEmpty(path) ? '' : `${path}.`}stages[${index}].parallel[${indexP}].stage.spec.inputs`,
                  chainedPipelineErrorsResponse
                )
              }
            } else {
              const errorsResponse = validateStage({
                stage: stageP.stage as StageElementConfig,
                template: filteredTemplate?.stages?.[index].parallel?.[indexP]?.stage,
                originalStage: originalStage?.stage,
                getString,
                viewType
              })
              if (!isEmpty(errorsResponse)) {
                set(
                  errors,
                  `${isEmpty(path) ? '' : `${path}.`}stages[${index}].parallel[${indexP}].stage`,
                  errorsResponse
                )
              }
            }
          }
        })
      }
    })

    return errors
  }
}

export const validateCICodebaseConfiguration = ({ pipeline, getString }: Partial<ValidatePipelineProps>): string => {
  const shouldValidateCICodebase = isCloneCodebaseEnabledAtLeastOneStage(pipeline)
  if (
    shouldValidateCICodebase &&
    !has(pipeline, 'properties') &&
    !has(pipeline?.properties, 'ci') &&
    isEmpty(get(pipeline, 'properties.ci.codebase.build')) &&
    getString
  ) {
    return getString?.('pipeline.runPipeline.ciCodebaseConfig')
  }
  return ''
}
export const getTemplatePath = (path: string, parentPath: string): string => {
  if (!isEmpty(parentPath)) {
    return path.replace(`${parentPath}.`, '')
  }
  return path
}
