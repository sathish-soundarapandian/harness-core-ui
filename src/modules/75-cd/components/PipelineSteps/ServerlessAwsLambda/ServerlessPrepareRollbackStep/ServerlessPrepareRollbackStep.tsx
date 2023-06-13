/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { isEmpty } from 'lodash-es'
import type { FormikErrors } from 'formik'
import type { IconName, AllowedTypes } from '@harness/uicore'

import type { VariableMergeServiceResponse } from 'services/pipeline-ng'
import type { StringsMap } from 'framework/strings/StringsContext'
import { StepViewType, StepProps, ValidateInputSetProps, InputSetData } from '@pipeline/components/AbstractSteps/Step'
import { VariablesListTable } from '@pipeline/components/VariablesListTable/VariablesListTable'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { PipelineStep } from '@pipeline/components/PipelineSteps/PipelineStep'
import type { ServerlessPrepareRollbackStepInitialValues } from '@pipeline/utils/types'
import { ConnectorRefFormValueType, getConnectorRefValue } from '@cd/utils/connectorUtils'
import { validateGenericFields } from '../../Common/GenericExecutionStep/utils'
import { ServerlessPrepareRollbackStepInputSetMode } from './ServerlessPrepareRollbackStepInputSet'
import {
  ServerlessPrepareRollbackStepEditRef,
  ServerlessPrepareRollbackStepFormikValues
} from './ServerlessPrepareRollbackStepEdit'
import pipelineVariableCss from '@pipeline/components/PipelineStudio/PipelineVariables/PipelineVariables.module.scss'

export interface ServerlessPrepareRollbackStepEditProps {
  initialValues: ServerlessPrepareRollbackStepInitialValues
  onUpdate?: (data: ServerlessPrepareRollbackStepInitialValues) => void
  stepViewType?: StepViewType
  onChange?: (data: ServerlessPrepareRollbackStepInitialValues) => void
  allowableTypes: AllowedTypes
  readonly?: boolean
  isNewStep?: boolean
  inputSetData: {
    template?: ServerlessPrepareRollbackStepInitialValues
    path?: string
    readonly?: boolean
  }
}

export interface ServerlessPrepareRollbackVariableStepProps {
  initialValues: ServerlessPrepareRollbackStepInitialValues
  stageIdentifier: string
  onUpdate?(data: ServerlessPrepareRollbackStepInitialValues): void
  metadataMap: Required<VariableMergeServiceResponse>['metadataMap']
  variablesData: ServerlessPrepareRollbackStepInitialValues
}

export class ServerlessPrepareRollbackStep extends PipelineStep<ServerlessPrepareRollbackStepInitialValues> {
  protected type = StepType.ServerlessPrepareRollback
  protected stepName = 'Serverless Prepare Rollback Step'
  protected stepIcon: IconName = 'serverless-deploy-step'
  protected stepDescription: keyof StringsMap = 'pipeline.stepDescription.ServerlessPrepareRollback'
  protected isHarnessSpecific = false
  protected referenceId = 'ServerlessPrepareRollbackStep'

  protected defaultValues: ServerlessPrepareRollbackStepInitialValues = {
    identifier: '',
    name: '',
    type: StepType.ServerlessPrepareRollback,
    timeout: '10m',
    spec: {
      connectorRef: ''
    }
  }

  constructor() {
    super()
    this._hasStepVariables = true
    this._hasDelegateSelectionVisible = true
  }

  renderStep(props: StepProps<ServerlessPrepareRollbackStepInitialValues>): JSX.Element {
    const {
      initialValues,
      stepViewType,
      inputSetData,
      customStepProps,
      isNewStep,
      readonly,
      allowableTypes,
      onUpdate,
      formikRef
    } = props

    if (this.isTemplatizedView(stepViewType)) {
      return (
        <ServerlessPrepareRollbackStepInputSetMode
          initialValues={initialValues}
          allowableTypes={allowableTypes}
          inputSetData={inputSetData as InputSetData<ServerlessPrepareRollbackStepInitialValues>}
        />
      )
    } else if (stepViewType === StepViewType.InputVariable) {
      const { variablesData, metadataMap } = customStepProps as ServerlessPrepareRollbackVariableStepProps
      return (
        <VariablesListTable
          className={pipelineVariableCss.variablePaddingL3}
          data={variablesData}
          originalData={initialValues}
          metadataMap={metadataMap}
        />
      )
    }

    return (
      <ServerlessPrepareRollbackStepEditRef
        initialValues={initialValues}
        onUpdate={(formData: ServerlessPrepareRollbackStepFormikValues) => onUpdate?.(this.processFormData(formData))}
        isNewStep={isNewStep}
        allowableTypes={allowableTypes}
        stepViewType={stepViewType}
        ref={formikRef}
        readonly={readonly}
      />
    )
  }

  validateInputSet({
    data,
    template,
    getString,
    viewType
  }: ValidateInputSetProps<ServerlessPrepareRollbackStepInitialValues>): FormikErrors<ServerlessPrepareRollbackStepInitialValues> {
    const errors = validateGenericFields({
      data,
      template,
      getString,
      viewType
    }) as FormikErrors<ServerlessPrepareRollbackStepInitialValues>

    if (isEmpty(errors.spec)) {
      delete errors.spec
    }

    return errors
  }

  processFormData(formData: any) {
    return {
      ...formData,
      spec: {
        ...formData.spec,
        connectorRef: getConnectorRefValue(formData.spec.connectorRef as ConnectorRefFormValueType)
      }
    }
  }
}
