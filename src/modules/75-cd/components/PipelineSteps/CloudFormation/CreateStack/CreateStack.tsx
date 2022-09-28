/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { forwardRef } from 'react'
import * as Yup from 'yup'
import { isEmpty, map, set, unset, isNull, forOwn, get } from 'lodash-es'
import { IconName, MultiTypeInputType, getMultiTypeFromValue } from '@harness/uicore'
import { yupToFormErrors, FormikErrors } from 'formik'
import { StepViewType, StepProps, ValidateInputSetProps } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import type { StringsMap } from 'stringTypes'
import { PipelineStep } from '@pipeline/components/PipelineSteps/PipelineStep'
import { getDurationValidationSchema } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import type {
  CreateStackStepInfo,
  CreateStackData,
  CreateStackVariableStepProps
} from '../CloudFormationInterfaces.types'
import { CreateStack } from './CreateStackRef'
import { CreateStackVariableStep } from './VariableView/VariableView'
import CreateStackInputStep from './InputSteps/InputStep'
const CloudFormationCreateStackWithRef = forwardRef(CreateStack)

export class CFCreateStack extends PipelineStep<CreateStackStepInfo> {
  constructor() {
    super()
    this._hasStepVariables = true
    this._hasDelegateSelectionVisible = true
  }

  protected type = StepType.CloudFormationCreateStack
  protected stepIcon: IconName = 'cloud-formation-create'
  protected stepName = 'CloudFormation Create Stack'
  protected stepDescription: keyof StringsMap = 'cd.cloudFormation.createDescription'
  protected stepIconSize = 32
  protected referenceId = 'cloudFormationCreateStep'

  protected defaultValues: CreateStackStepInfo = {
    type: StepType.CloudFormationCreateStack,
    name: '',
    identifier: '',
    timeout: '10m',
    spec: {
      provisionerIdentifier: '',
      configuration: {
        stackName: '',
        connectorRef: '',
        region: '',
        templateFile: {
          type: 'Remote',
          spec: {}
        }
      }
    }
  }
  /* istanbul ignore next */
  validateInputSet({
    data,
    template,
    getString,
    viewType
  }: ValidateInputSetProps<CreateStackStepInfo>): FormikErrors<CreateStackStepInfo> {
    const errors = {} as any
    const isRequired = viewType === StepViewType.DeploymentForm || viewType === StepViewType.TriggerForm

    if (
      getMultiTypeFromValue(template?.spec?.provisionerIdentifier) === MultiTypeInputType.RUNTIME &&
      isRequired &&
      isEmpty(data?.spec?.provisionerIdentifier?.trim())
    ) {
      errors.spec = {
        ...errors.spec,
        provisionerIdentifier: getString?.('common.validation.provisionerIdentifierIsRequired')
      }
    }

    if (
      getMultiTypeFromValue(template?.spec?.configuration?.connectorRef) === MultiTypeInputType.RUNTIME &&
      isRequired &&
      isEmpty(data?.spec?.configuration?.connectorRef)
    ) {
      errors.spec = {
        ...errors.spec,
        configuration: {
          ...errors.spec?.configuration,
          connectorRef: getString?.('pipelineSteps.build.create.connectorRequiredError')
        }
      }
    }

    if (
      getMultiTypeFromValue(template?.spec?.configuration?.region) === MultiTypeInputType.RUNTIME &&
      isRequired &&
      isEmpty(data?.spec?.configuration?.region)
    ) {
      errors.spec = {
        ...errors.spec,
        configuration: {
          ...errors.spec?.configuration,
          region: getString?.('cd.cloudFormation.errors.region')
        }
      }
    }

    if (
      getMultiTypeFromValue(template?.spec?.configuration?.stackName) === MultiTypeInputType.RUNTIME &&
      isRequired &&
      isEmpty(data?.spec?.configuration?.stackName)
    ) {
      errors.spec = {
        ...errors.spec,
        configuration: {
          ...errors.spec?.configuration,
          stackName: getString?.('cd.cloudFormation.errors.stackName')
        }
      }
    }

    if (getMultiTypeFromValue(template?.timeout) === MultiTypeInputType.RUNTIME && isRequired) {
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

    if (isEmpty(errors.spec)) {
      delete errors.spec
    }
    return errors
  }
  /* istanbul ignore next */
  processFormData(data: any): CreateStackStepInfo {
    const awsConnRef = data?.spec?.configuration?.connectorRef?.value || data?.spec?.configuration?.connectorRef
    let templateFile = data.spec.configuration.templateFile

    if (data?.spec?.configuration?.templateFile?.type === 'Remote') {
      const connectorRef =
        data?.spec?.configuration?.templateFile?.spec?.store?.spec?.connectorRef?.value ||
        data?.spec?.configuration?.templateFile?.spec?.store?.spec?.connectorRef
      templateFile = {
        ...data.spec.configuration.templateFile,
        spec: {
          store: {
            ...data.spec.configuration.templateFile?.spec?.store,
            spec: {
              ...data?.spec?.configuration?.templateFile?.spec?.store?.spec,
              connectorRef
            }
          }
        }
      }
    }
    if (!isEmpty(data.spec.configuration?.parameters)) {
      const params = data.spec.configuration.parameters
      set(
        data,
        'spec.configuration.parameters',
        map(params, param => ({
          ...param,
          store: {
            ...param?.store,
            spec: {
              connectorRef: param.store.spec.connectorRef,
              ...(param?.store?.spec?.region
                ? {
                    urls: param?.store?.spec?.paths || param?.store?.spec?.urls,
                    region: param?.store?.spec.region
                  }
                : { paths: param?.store?.spec?.paths, ...param?.store?.spec })
            }
          }
        }))
      )
    }

    if (!isEmpty(data?.spec?.configuration?.skipOnStackStatuses)) {
      let statuses = data?.spec?.configuration?.skipOnStackStatuses
      if (getMultiTypeFromValue(statuses) === MultiTypeInputType.FIXED) {
        statuses = map(statuses, status => status?.value || status)
      }
      set(data, 'spec.configuration.skipOnStackStatuses', statuses)
    }

    if (!isEmpty(data?.spec?.configuration?.capabilities)) {
      let capabilities = data.spec.configuration.capabilities
      if (getMultiTypeFromValue(capabilities) === MultiTypeInputType.FIXED) {
        capabilities = map(capabilities, cap => cap?.value || cap)
      }
      set(data, 'spec.configuration.capabilities', capabilities)
    }

    if (!isEmpty(data.spec.configuration?.parameterOverrides)) {
      set(
        data,
        'spec.configuration.parameterOverrides',
        map(data.spec.configuration?.parameterOverrides, ({ name, value }) => ({ name, value, type: 'String' }))
      )
    }

    if (!isEmpty(data.spec.configuration?.tags)) {
      const tagsType = get(data?.spec?.configuration?.tags?.spec?.store, 'type')
      const tags = get(data?.spec?.configuration?.tags?.spec?.store, 'spec')
      if (tagsType === 'S3' || tagsType === 'S3Url') {
        set(data?.spec?.configuration?.tags?.spec?.store, 'type', 'S3Url')
        set(data?.spec?.configuration?.tags?.spec?.store, 'spec', {
          region: tags?.region,
          connectorRef: tags?.connectorRef,
          urls: tags?.paths || tags?.urls
        })
      }

      if (tags?.connectorRef?.value) {
        set(data?.spec?.configuration?.tags?.spec?.store?.spec, 'connectorRef', tags?.connectorRef?.value)
      }
    }
    return {
      ...data,
      spec: {
        ...data.spec,
        configuration: {
          ...data.spec.configuration,
          connectorRef: awsConnRef,
          templateFile
        }
      }
    }
  }

  /* istanbul ignore next */
  private getInitialValues(data: CreateStackStepInfo): CreateStackData {
    const config = data?.spec?.configuration
    let capabilities, skipOnStackStatuses, parameters
    capabilities = config?.capabilities
    if (!isEmpty(capabilities) && getMultiTypeFromValue(capabilities) === MultiTypeInputType.FIXED) {
      capabilities = map(data?.spec?.configuration?.capabilities, item => ({ label: item, value: item }))
      set(data, 'spec.configuration.capabilities', capabilities)
    }

    skipOnStackStatuses = config?.skipOnStackStatuses
    if (!isEmpty(skipOnStackStatuses) && getMultiTypeFromValue(skipOnStackStatuses) === MultiTypeInputType.FIXED) {
      skipOnStackStatuses = map(config?.skipOnStackStatuses, item => ({ label: item, value: item }))
      set(data, 'spec.configuration.skipOnStackStatuses', skipOnStackStatuses)
    }

    parameters = config?.parameters
    if (!isEmpty(parameters)) {
      parameters = map(config?.parameters, param => ({
        ...param,
        store: {
          ...param?.store,
          spec: {
            ...param?.store?.spec,
            connectorRef: param.store.spec.connectorRef,
            ...(param?.store?.spec?.region ? { urls: param?.store?.spec?.urls } : { paths: param?.store?.spec?.paths })
          }
        }
      }))
      set(data, 'spec.configuration.parameters', parameters)
    }

    if (!isEmpty(data.spec.configuration?.tags)) {
      const tagsType = get(data, 'spec.configuration.tags.spec.store.type')
      if (tagsType === 'S3' || tagsType === 'S3Url') {
        const tags = get(data, 'spec.configuration.tags.spec.store.spec')
        set(data, 'spec.configuration.tags.spec.store.type', 'S3Url')
        set(data, 'spec.configuration.tags.spec.store.spec', {
          region: tags?.region,
          connectorRef: tags?.connectorRef,
          paths: tags?.paths || tags?.urls
        })
      }
    }
    // empty values returned from api removed
    // causes issues with yup having null values for strings/arrays
    forOwn(config, (value, key) => isNull(value) && unset(config, key))

    return {
      ...data,
      spec: {
        ...data?.spec,
        provisionerIdentifier: data?.spec?.provisionerIdentifier || '',
        configuration: {
          ...config,
          connectorRef: config?.connectorRef || '',
          region: config?.region || '',
          stackName: config?.stackName || '',
          templateFile: config?.templateFile || {
            type: 'Remote',
            spec: {}
          }
        }
      }
    }
  }

  renderStep({
    initialValues,
    onUpdate,
    onChange,
    allowableTypes,
    stepViewType,
    formikRef,
    isNewStep,
    readonly,
    inputSetData,
    path,
    customStepProps
  }: StepProps<CreateStackStepInfo>): JSX.Element {
    if (this.isTemplatizedView(stepViewType)) {
      return (
        <CreateStackInputStep
          initialValues={initialValues}
          allowableTypes={allowableTypes}
          allValues={inputSetData?.allValues}
          stepViewType={stepViewType}
          readonly={inputSetData?.readonly}
          inputSetData={inputSetData}
          path={path}
        />
      )
    } else if (stepViewType === StepViewType.InputVariable) {
      return (
        <CreateStackVariableStep {...(customStepProps as CreateStackVariableStepProps)} initialValues={initialValues} />
      )
    }

    return (
      <CloudFormationCreateStackWithRef
        initialValues={this.getInitialValues(initialValues)}
        onUpdate={(data: any) => onUpdate?.(this.processFormData(data))}
        onChange={(data: any) => onChange?.(this.processFormData(data))}
        allowableTypes={allowableTypes}
        isNewStep={isNewStep}
        ref={formikRef}
        readonly={readonly}
        stepViewType={stepViewType}
      />
    )
  }
}
