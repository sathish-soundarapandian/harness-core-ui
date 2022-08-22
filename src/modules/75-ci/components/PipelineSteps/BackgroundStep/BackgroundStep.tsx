/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { AllowedTypes, IconName } from '@wings-software/uicore'
import { parse } from 'yaml'
import get from 'lodash-es/get'
import type { FormikErrors } from 'formik'
import type { StepProps, ValidateInputSetProps } from '@pipeline/components/AbstractSteps/Step'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { PipelineStep } from '@pipeline/components/PipelineSteps/PipelineStep'
import { validateInputSet } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import { getFormValuesInCorrectFormat } from '@pipeline/components/PipelineSteps/Steps/StepsTransformValuesUtils'
import type {
  MultiTypeSelectOption,
  MultiTypeMapType,
  MultiTypeMapUIType,
  MultiTypeListType,
  MultiTypeListUIType,
  MultiTypeConnectorRef,
  Resources
} from '@pipeline/components/PipelineSteps/Steps/StepsTypes'
import type { CompletionItemInterface } from '@common/interfaces/YAMLBuilderProps'
import { loggerFor } from 'framework/logging/logging'
import { ModuleName } from 'framework/types/ModuleName'
import type { StringsMap } from 'stringTypes'
import { BackgroundStepBaseWithRef } from './BackgroundStepBase'
import { BackgroundStepInputSet } from './BackgroundStepInputSet'
import { BackgroundStepVariables, BackgroundStepVariablesProps } from './BackgroundStepVariables'
import { getInputSetViewValidateFieldsConfig, transformValuesFieldsConfig } from './BackgroundStepFunctionConfigs'
import { getConnectorSuggestions } from '../EditorSuggestionUtils'

const logger = loggerFor(ModuleName.CI)

const stepConnectorRegEx = /^.+step\.spec\.connectorRef$/
const ciPropsConRegEx = /^pipeline\.properties\.ci\.codebase\.connectorRef$/
const infrastructureConRegEx = /stage\.spec\.infrastructure\.spec\.connectorRef$/
const serviceDepConRegEx = /stage\.spec\.serviceDependencies\.spec\.connectorRef$/

export interface BackgroundStepSpec {
  connectorRef: string
  image: string
  command: string
  privileged?: boolean
  reports?: {
    type: 'JUnit'
    spec: {
      paths: MultiTypeListType
    }
  }
  envVariables?: MultiTypeMapType
  entrypoint?: MultiTypeListUIType
  imagePullPolicy?: MultiTypeSelectOption
  shell?: MultiTypeSelectOption
  runAsUser?: string
  resources?: Resources
  portBindings?: MultiTypeMapType
}

export interface BackgroundStepData {
  identifier: string
  name?: string
  description?: string
  type: string
  timeout?: string
  spec: BackgroundStepSpec
}

export interface BackgroundStepSpecUI
  extends Omit<BackgroundStepSpec, 'connectorRef' | 'reports' | 'envVariables' | 'entrypoint' | 'resources'> {
  connectorRef: MultiTypeConnectorRef
  reportPaths?: MultiTypeListUIType
  envVariables?: MultiTypeMapUIType
  entrypoint?: MultiTypeListUIType
  imagePullPolicy?: MultiTypeSelectOption
  shell?: MultiTypeSelectOption
  limitMemory?: string
  limitCPU?: string
}

// Interface for the form
export interface BackgroundStepDataUI extends Omit<BackgroundStepData, 'spec'> {
  spec: BackgroundStepSpecUI
}

export interface BackgroundStepProps {
  initialValues: BackgroundStepData
  template?: BackgroundStepData
  path?: string
  readonly?: boolean
  stepViewType: StepViewType
  isNewStep?: boolean
  onUpdate?: (data: BackgroundStepData) => void
  onChange?: (data: BackgroundStepData) => void
  allowableTypes: AllowedTypes
  formik?: any
}

export class BackgroundStep extends PipelineStep<BackgroundStepData> {
  constructor() {
    super()
    this._hasStepVariables = true
    this.invocationMap = new Map()
    this.invocationMap.set(stepConnectorRegEx, this.getConnectorList.bind(this, undefined))
    this.invocationMap.set(
      ciPropsConRegEx,
      this.getConnectorList.bind(this, ['Github', 'Gitlab', 'Bitbucket', 'Codecommit'])
    )
    this.invocationMap.set(infrastructureConRegEx, this.getConnectorList.bind(this, ['K8sCluster']))
    this.invocationMap.set(
      serviceDepConRegEx,
      this.getConnectorList.bind(this, ['Gcp', 'Aws', 'DockerRegistry', 'Azure'])
    )
  }

  protected type = StepType.Background
  protected stepName = 'Configure Background Step'
  protected stepIcon: IconName = 'background-step'
  protected stepIconColor = '#4F5162'
  protected stepDescription: keyof StringsMap = 'pipeline.stepDescription.Background'
  protected stepPaletteVisible = false

  protected defaultValues: BackgroundStepData = {
    identifier: '',
    type: StepType.Background as string,
    spec: {
      connectorRef: '',
      image: '',
      command: '',
      shell: 'Sh'
    }
  }

  /* istanbul ignore next */
  protected async getConnectorList(
    connectorTypes: string[] | undefined,
    path: string,
    yaml: string,
    params: Record<string, unknown>
  ): Promise<CompletionItemInterface[]> {
    if (connectorTypes?.length) {
      return getConnectorSuggestions(params, connectorTypes)
    }
    let pipelineObj
    try {
      pipelineObj = parse(yaml)
    } catch (err) {
      logger.error('Error while parsing the yaml', err)
    }
    if (pipelineObj) {
      const obj = get(pipelineObj, path.replace('.spec.connectorRef', ''))
      if (obj.type === StepType.Background || obj.type === StepType.Plugin) {
        return getConnectorSuggestions(params, ['Gcp', 'Aws', 'DockerRegistry', 'Azure'])
      }
    }
    return []
  }

  /* istanbul ignore next */
  processFormData<T>(data: T): BackgroundStepData {
    return getFormValuesInCorrectFormat<T, BackgroundStepData>(data, transformValuesFieldsConfig)
  }

  validateInputSet({
    data,
    template,
    getString,
    viewType
  }: ValidateInputSetProps<BackgroundStepData>): FormikErrors<BackgroundStepData> {
    const isRequired = viewType === StepViewType.DeploymentForm || viewType === StepViewType.TriggerForm
    if (getString) {
      return validateInputSet(data, template, getInputSetViewValidateFieldsConfig(isRequired), { getString }, viewType)
    }

    return {}
  }

  renderStep(props: StepProps<BackgroundStepData>): JSX.Element {
    const {
      initialValues,
      onUpdate,
      stepViewType,
      inputSetData,
      formikRef,
      customStepProps,
      readonly,
      isNewStep,
      onChange,
      allowableTypes
    } = props

    if (stepViewType === StepViewType.InputSet || stepViewType === StepViewType.DeploymentForm) {
      return (
        <BackgroundStepInputSet
          initialValues={initialValues}
          template={inputSetData?.template}
          path={inputSetData?.path || ''}
          readonly={!!inputSetData?.readonly}
          stepViewType={stepViewType}
          onUpdate={onUpdate}
          onChange={onChange}
          allowableTypes={allowableTypes}
        />
      )
    } else if (stepViewType === StepViewType.InputVariable) {
      return (
        <BackgroundStepVariables
          {...(customStepProps as BackgroundStepVariablesProps)}
          initialValues={initialValues}
          onUpdate={onUpdate}
        />
      )
    }

    return (
      <BackgroundStepBaseWithRef
        initialValues={initialValues}
        allowableTypes={allowableTypes}
        onChange={onChange}
        stepViewType={stepViewType || StepViewType.Edit}
        onUpdate={onUpdate}
        readonly={readonly}
        isNewStep={isNewStep}
        ref={formikRef}
      />
    )
  }
}
