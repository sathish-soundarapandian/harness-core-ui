/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { IconName, getMultiTypeFromValue, MultiTypeInputType, AllowedTypes, MultiSelectOption } from '@harness/uicore'
import * as Yup from 'yup'
import { connect, FormikErrors, yupToFormErrors } from 'formik'
import { cloneDeep } from 'lodash-es'
import type { StepProps, ValidateInputSetProps } from '@pipeline/components/AbstractSteps/Step'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { PipelineStep } from '@pipeline/components/PipelineSteps/PipelineStep'
import type {
  MultiTypeMapUIType,
  MultiTypeListUIType,
  MultiTypeConnectorRef
} from '@pipeline/components/PipelineSteps/Steps/StepsTypes'
import type { StringsMap } from 'stringTypes'
import { getDurationValidationSchema } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { SyncStepBaseWithRef } from './SyncStepBase'
import { SyncStepSpec, SyncStepData, POLICY_OPTIONS, applicationListItemInterface } from './types'
import { SyncStepVariables, SyncStepVariablesProps } from './SyncStepVariables'
import SyncStepInputSet from './SyncStepInputSet'

const SyncStepInputSetBasic = connect(SyncStepInputSet)

export interface SyncStepSpecUI
  extends Omit<SyncStepSpec, 'connectorRef' | 'tags' | 'labels' | 'buildArgs' | 'pull' | 'resources'> {
  connectorRef: MultiTypeConnectorRef
  tags: MultiTypeListUIType
  labels?: MultiTypeMapUIType
  buildArgs?: MultiTypeMapUIType
}

// Interface for the form
export interface SyncStepDataUI extends Omit<SyncStepData, 'spec'> {
  spec: SyncStepSpecUI
}

export interface SyncStepProps {
  initialValues: SyncStepData
  template?: SyncStepData
  path?: string
  readonly?: boolean
  isNewStep?: boolean
  stepViewType: StepViewType
  onUpdate?: (data: SyncStepData) => void
  onChange?: (data: SyncStepData) => void
  allowableTypes: AllowedTypes
  formik?: any
}

export class SyncStep extends PipelineStep<SyncStepData> {
  constructor() {
    super()
    this._hasStepVariables = true
    this._hasDelegateSelectionVisible = true
    this.invocationMap = new Map()
  }

  protected type = StepType.GitOpsSync
  protected stepName = 'GitOpsSync'
  protected stepIcon: IconName = 'refresh'
  // to be edited in strings.en.yaml file in future
  protected stepDescription: keyof StringsMap = 'pipeline.stepDescription.GitOpsSync'
  protected stepPaletteVisible = false

  protected defaultValues: SyncStepData = {
    identifier: '',
    type: StepType.GitOpsSync as string,
    name: '',
    timeout: '10m',
    spec: {
      prune: false,
      dryRun: false,
      applyOnly: false,
      forceApply: false,
      applicationsList: [],
      retryStrategy: {
        limit: 2,
        baseBackoffDuration: '5s',
        increaseBackoffByFactor: 2,
        maxBackoffDuration: '3m5s'
      },
      retry: false,
      syncOptions: {
        skipSchemaValidation: false,
        autoCreateNamespace: false,
        pruneResourcesAtLast: false,
        applyOutOfSyncOnly: false,
        replaceResources: false,
        prunePropagationPolicy: POLICY_OPTIONS.FOREGROUND
      }
    }
  }

  /* istanbul ignore next */
  processFormData(values: SyncStepData): SyncStepData {
    const clonedValues: SyncStepData = cloneDeep(values)
    if (clonedValues?.spec?.applicationsList && typeof clonedValues?.spec?.applicationsList !== 'string') {
      clonedValues.spec.applicationsList = (clonedValues.spec.applicationsList as MultiSelectOption[]).map(
        (item: MultiSelectOption) => {
          const appName = item.value as string
          return {
            applicationName: appName?.split('/')?.[0],
            agentId: appName?.split('/')?.[1]
          }
        }
      )
    }
    if (clonedValues.spec && !clonedValues.spec?.prune) {
      clonedValues.spec.prune = false
    }
    if (clonedValues.spec && !clonedValues.spec?.dryRun) {
      clonedValues.spec.dryRun = false
    }
    if (clonedValues.spec && !clonedValues.spec?.applyOnly) {
      clonedValues.spec.applyOnly = false
    }
    if (clonedValues.spec && !clonedValues.spec?.forceApply) {
      clonedValues.spec.forceApply = false
    }
    if (clonedValues.spec?.syncOptions && !clonedValues.spec?.syncOptions?.applyOutOfSyncOnly) {
      clonedValues.spec.syncOptions.applyOutOfSyncOnly = false
    }
    if (clonedValues.spec?.syncOptions && !clonedValues.spec?.syncOptions?.skipSchemaValidation) {
      clonedValues.spec.syncOptions.skipSchemaValidation = false
    }
    if (clonedValues.spec?.syncOptions && !clonedValues.spec?.syncOptions?.autoCreateNamespace) {
      clonedValues.spec.syncOptions.autoCreateNamespace = false
    }
    if (clonedValues.spec?.syncOptions && !clonedValues.spec?.syncOptions?.pruneResourcesAtLast) {
      clonedValues.spec.syncOptions.pruneResourcesAtLast = false
    }
    if (clonedValues.spec?.syncOptions && !clonedValues.spec?.syncOptions?.replaceResources) {
      clonedValues.spec.syncOptions.replaceResources = false
    }
    if (values?.spec?.retry !== true) {
      delete clonedValues.spec?.retryStrategy?.limit
      delete clonedValues.spec?.retryStrategy?.baseBackoffDuration
      delete clonedValues.spec?.retryStrategy?.increaseBackoffByFactor
      delete clonedValues.spec?.retryStrategy?.maxBackoffDuration
    }
    return clonedValues
  }

  private getInitialValues(initialValues: SyncStepData): SyncStepData {
    const clonedValues: SyncStepData = cloneDeep(initialValues)
    if (clonedValues?.spec?.applicationsList && typeof clonedValues?.spec?.applicationsList !== 'string') {
      clonedValues.spec.applicationsList = (
        clonedValues?.spec?.applicationsList as applicationListItemInterface[]
      )?.map((app: applicationListItemInterface) => {
        return {
          label: `${app?.applicationName} (${app?.agentId})`,
          value: `${app?.applicationName}/${app?.agentId}`
        }
      })
    }
    return clonedValues
  }

  validateInputSet({ data, template, getString }: ValidateInputSetProps<SyncStepData>): FormikErrors<SyncStepData> {
    const errors: FormikErrors<SyncStepData> = {}
    if (getMultiTypeFromValue(template?.timeout) === MultiTypeInputType.RUNTIME) {
      const timeout = Yup.object().shape({
        timeout: getDurationValidationSchema({ minimum: '10s' }).required(getString?.('validation.timeout10SecMinimum'))
      })

      try {
        timeout.validateSync(data)
      } catch (e) {
        /* istanbul ignore else */
        if (e instanceof Yup.ValidationError) {
          const err = yupToFormErrors(e)
          Object.assign(errors, err)
        }
      }
    }

    return errors
  }

  renderStep(props: StepProps<SyncStepData>): JSX.Element {
    const {
      initialValues,
      onUpdate,
      stepViewType,
      formikRef,
      inputSetData,
      isNewStep,
      readonly,
      onChange,
      allowableTypes,
      customStepProps
    } = props

    if (this.isTemplatizedView(stepViewType)) {
      return (
        <SyncStepInputSetBasic
          initialValues={initialValues}
          template={inputSetData?.template}
          path={inputSetData?.path || ''}
          inputSetData={inputSetData}
          readonly={!!inputSetData?.readonly}
          stepViewType={stepViewType}
          onUpdate={(values: any) => onUpdate?.(values)}
          onChange={(values: any) => onChange?.(values)}
          ref={formikRef}
          allowableTypes={allowableTypes}
        />
      )
    } else if (stepViewType === StepViewType.InputVariable) {
      return (
        <SyncStepVariables
          {...(customStepProps as SyncStepVariablesProps)}
          initialValues={initialValues}
          onUpdate={(values: any) => onUpdate?.(this.processFormData(values))}
        />
      )
    }

    return (
      <SyncStepBaseWithRef
        initialValues={this.getInitialValues(initialValues)}
        allowableTypes={allowableTypes}
        onChange={(values: any) => onChange?.(this.processFormData(values))}
        stepViewType={stepViewType || StepViewType.Edit}
        onUpdate={(values: any) => onUpdate?.(this.processFormData(values))}
        ref={formikRef}
        isNewStep={isNewStep}
        readonly={readonly}
      />
    )
  }
}
