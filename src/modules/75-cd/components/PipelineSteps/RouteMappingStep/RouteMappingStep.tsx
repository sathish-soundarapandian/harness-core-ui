/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FormEvent } from 'react'
import {
  IconName,
  Formik,
  FormInput,
  Layout,
  getMultiTypeFromValue,
  MultiTypeInputType,
  AllowedTypes
} from '@harness/uicore'
import * as Yup from 'yup'
import cx from 'classnames'
import { FormikErrors, FormikProps, yupToFormErrors } from 'formik'

import { defaultTo, isEmpty, set } from 'lodash-es'
import { StepViewType, StepProps, ValidateInputSetProps, setFormikRef } from '@pipeline/components/AbstractSteps/Step'
import type { StepFormikFowardRef } from '@pipeline/components/AbstractSteps/Step'
import type { StepElementConfig, TasRouteMappingStepInfo } from 'services/cd-ng'
import type { VariableMergeServiceResponse } from 'services/pipeline-ng'
import { VariablesListTable } from '@pipeline/components/VariablesListTable/VariablesListTable'
import { ALLOWED_VALUES_TYPE, ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'

import { useStrings } from 'framework/strings'
import {
  FormMultiTypeDurationField,
  getDurationValidationSchema
} from '@common/components/MultiTypeDuration/MultiTypeDuration'

import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { PipelineStep } from '@pipeline/components/PipelineSteps/PipelineStep'
import { TimeoutFieldInputSetView } from '@pipeline/components/InputSetView/TimeoutFieldInputSetView/TimeoutFieldInputSetView'
import type { StringsMap } from 'stringTypes'
import { getNameAndIdentifierSchema } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import { isExecutionTimeFieldDisabled } from '@pipeline/utils/runPipelineUtils'
import { FormMultiTypeKVTagInput } from '@common/components/MutliTypeKVTagInput/MultiTypeKVTagInput'
import { TextFieldInputSetView } from '@pipeline/components/InputSetView/TextFieldInputSetView/TextFieldInputSetView'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
import pipelineVariablesCss from '@pipeline/components/PipelineStudio/PipelineVariables/PipelineVariables.module.scss'

export interface RouteMappingStepData extends StepElementConfig {
  spec: TasRouteMappingStepInfo
  identifier: string
}
export enum RouteType {
  Map = 'Map',
  UnMap = 'UnMap'
}

export interface RouteMappingStepVariableStepProps {
  initialValues: RouteMappingStepData
  stageIdentifier: string
  onUpdate?(data: RouteMappingStepData): void
  metadataMap: Required<VariableMergeServiceResponse>['metadataMap']
  variablesData: RouteMappingStepData
}

interface RouteMappingStepProps {
  initialValues: RouteMappingStepData
  onUpdate?: (data: RouteMappingStepData) => void
  onChange?: (data: RouteMappingStepData) => void
  allowableTypes: AllowedTypes
  stepViewType?: StepViewType
  isNewStep?: boolean

  template?: RouteMappingStepData
  path?: string
  readonly?: boolean
}

function RouteMappingStepWidget(
  props: RouteMappingStepProps,
  formikRef: StepFormikFowardRef<RouteMappingStepData>
): React.ReactElement {
  const { initialValues, onUpdate, isNewStep, readonly, allowableTypes, onChange, stepViewType } = props
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  return (
    <>
      <Formik<RouteMappingStepData>
        onSubmit={(values: RouteMappingStepData) => {
          /* istanbul ignore next */
          onUpdate?.(values)
        }}
        formName="routeMappingStep"
        initialValues={initialValues}
        validate={data => {
          /* istanbul ignore next */
          onChange?.(data)
        }}
        validationSchema={Yup.object().shape({
          ...getNameAndIdentifierSchema(getString, stepViewType),
          timeout: getDurationValidationSchema({ minimum: '10s' }).required(
            getString('validation.timeout10SecMinimum')
          ),
          spec: Yup.object().shape({
            appName: Yup.string().required(
              getString('common.validation.fieldIsRequired', { name: getString('cd.ElastigroupStep.appName') })
            ),
            routes: Yup.lazy((value): Yup.Schema<unknown> => {
              /* istanbul ignore else */
              if (getMultiTypeFromValue(value as any) === MultiTypeInputType.FIXED) {
                return Yup.array().min(1, getString('cd.steps.tas.routeMandatory'))
              }
              return Yup.string().required(getString('cd.steps.tas.routeMandatory'))
            })
          })
        })}
      >
        {(formik: FormikProps<RouteMappingStepData>) => {
          const { values, setFieldValue } = formik
          setFormikRef(formikRef, formik)

          return (
            <Layout.Vertical padding={{ left: 'xsmall', right: 'xsmall' }}>
              {stepViewType !== StepViewType.Template && (
                <div className={cx(stepCss.formGroup, stepCss.lg)}>
                  <FormInput.InputWithIdentifier
                    inputLabel={getString('name')}
                    isIdentifierEditable={isNewStep}
                    inputGroupProps={{
                      placeholder: getString('pipeline.stepNamePlaceholder'),
                      disabled: readonly
                    }}
                  />
                </div>
              )}

              <div className={cx(stepCss.formGroup, stepCss.sm)}>
                <FormMultiTypeDurationField
                  name="timeout"
                  disabled={readonly}
                  label={getString('pipelineSteps.timeoutLabel')}
                  className={stepCss.duration}
                  multiTypeDurationProps={{
                    expressions,
                    enableConfigureOptions: true,
                    disabled: readonly,
                    allowableTypes
                  }}
                />
              </div>
              <div className={stepCss.divider} />
              <div className={stepCss.stepSubSectionHeading}>{getString('cd.steps.tas.mappingType')}</div>
              <FormInput.RadioGroup
                name="spec.routeType"
                items={[
                  {
                    label: getString('cd.steps.tas.mapRoute'),
                    value: RouteType.Map
                  },
                  {
                    label: getString('cd.steps.tas.unMapRoute'),
                    value: RouteType.UnMap
                  }
                ]}
                radioGroup={{ inline: true }}
                onChange={(e: FormEvent<HTMLInputElement>) => {
                  setFieldValue('spec.routeType', e.currentTarget.value as RouteType)
                }}
              />

              <div className={cx(stepCss.formGroup, stepCss.lg)}>
                <FormInput.MultiTextInput
                  name="spec.appName"
                  placeholder={getString('cd.ElastigroupStep.appName')}
                  label={getString('cd.ElastigroupStep.appName')}
                  disabled={readonly}
                  multiTextInputProps={{ expressions, disabled: readonly, allowableTypes }}
                />
                {getMultiTypeFromValue(values.spec.appName) === MultiTypeInputType.RUNTIME && (
                  <ConfigureOptions
                    value={values.spec.appName}
                    type="String"
                    variableName="spec.appName"
                    showRequiredField={false}
                    showDefaultField={false}
                    onChange={/* istanbul ignore next */ value => setFieldValue('spec.appName', value)}
                    isReadonly={readonly}
                    allowedValuesType={ALLOWED_VALUES_TYPE.TEXT}
                  />
                )}
              </div>

              <div className={cx(stepCss.formGroup, stepCss.lg)}>
                <FormMultiTypeKVTagInput
                  name="spec.routes"
                  tagsProps={{ placeholder: getString('cd.steps.tas.typeAndEnterForRouteAdd') }}
                  multiTypeProps={{
                    expressions,
                    allowableTypes
                  }}
                  label={getString('cd.steps.tas.routes')}
                  enableConfigureOptions
                  isArray={true}
                />
              </div>
            </Layout.Vertical>
          )
        }}
      </Formik>
    </>
  )
}

const RouteMappingStepInputStep: React.FC<RouteMappingStepProps> = ({
  template,
  path,
  readonly,
  allowableTypes,
  stepViewType
}) => {
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  /* istanbul ignore next */
  const getNameEntity = (fieldName: string): string => `${isEmpty(path) ? '' : `${path}.`}${fieldName}`

  return (
    <>
      {getMultiTypeFromValue(template?.timeout) === MultiTypeInputType.RUNTIME && (
        <TimeoutFieldInputSetView
          name={getNameEntity('timeout')}
          label={getString('pipelineSteps.timeoutLabel')}
          multiTypeDurationProps={{
            configureOptionsProps: {
              isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
            },
            allowableTypes: allowableTypes,
            expressions,
            disabled: readonly
          }}
          disabled={readonly}
          fieldPath={'timeout'}
          template={template}
          className={cx(stepCss.formGroup, stepCss.md)}
        />
      )}
      {getMultiTypeFromValue(template?.spec.appName) === MultiTypeInputType.RUNTIME && (
        <TextFieldInputSetView
          name={`${path}.spec.appName`}
          disabled={readonly}
          placeholder={getString('cd.ElastigroupStep.appName')}
          label={getString('cd.ElastigroupStep.appName')}
          multiTextInputProps={{
            expressions,
            allowableTypes
          }}
          template={template}
          fieldPath={'spec.appName'}
          className={cx(stepCss.formGroup, stepCss.md)}
        />
      )}
      {getMultiTypeFromValue((template?.spec as any)?.routes) === MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <FormMultiTypeKVTagInput
            name={`${path}.spec.routes`}
            tagsProps={{ placeholder: getString('cd.steps.tas.typeAndEnterForRouteAdd') }}
            multiTypeProps={{
              expressions,
              allowableTypes
            }}
            label={getString('cd.steps.tas.routes')}
            enableConfigureOptions
            isArray={true}
          />
        </div>
      )}
    </>
  )
}

const RouteMappingStepWidgetWithRef = React.forwardRef(RouteMappingStepWidget)
export class RouteMappingStep extends PipelineStep<RouteMappingStepData> {
  constructor() {
    super()
    this._hasStepVariables = true
    this._hasDelegateSelectionVisible = true
  }

  renderStep(props: StepProps<RouteMappingStepData>): JSX.Element {
    const {
      initialValues,
      onUpdate,
      stepViewType,
      inputSetData,
      formikRef,
      customStepProps,
      isNewStep,
      readonly,
      onChange,
      allowableTypes
    } = props
    if (this.isTemplatizedView(stepViewType)) {
      return (
        <RouteMappingStepInputStep
          allowableTypes={allowableTypes}
          initialValues={initialValues}
          onUpdate={onUpdate}
          stepViewType={stepViewType}
          readonly={!!inputSetData?.readonly}
          template={inputSetData?.template}
          path={inputSetData?.path || ''}
        />
      )
    } else if (stepViewType === StepViewType.InputVariable) {
      const { variablesData, metadataMap } = customStepProps as RouteMappingStepVariableStepProps

      return (
        <VariablesListTable
          className={pipelineVariablesCss.variablePaddingL3}
          data={variablesData.spec}
          originalData={initialValues.spec}
          metadataMap={metadataMap}
        />
      )
    }
    return (
      <RouteMappingStepWidgetWithRef
        initialValues={initialValues}
        onUpdate={onUpdate}
        isNewStep={isNewStep}
        allowableTypes={allowableTypes}
        onChange={onChange}
        stepViewType={defaultTo(stepViewType, StepViewType.Edit)}
        readonly={readonly}
        ref={formikRef}
      />
    )
  }

  validateInputSet({
    data,
    template,
    getString,
    viewType
  }: ValidateInputSetProps<RouteMappingStepData>): FormikErrors<RouteMappingStepData> {
    /* istanbul ignore next */
    const isRequired = viewType === StepViewType.DeploymentForm || viewType === StepViewType.TriggerForm
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const errors = { spec: {} } as any
    if (getMultiTypeFromValue(template?.timeout) === MultiTypeInputType.RUNTIME) {
      let timeoutSchema = getDurationValidationSchema({ minimum: '10s' })
      if (isRequired) {
        /* istanbul ignore next */
        timeoutSchema = timeoutSchema.required(getString?.('validation.timeout10SecMinimum'))
      }
      const timeout = Yup.object().shape({
        timeout: timeoutSchema
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
    /* istanbul ignore else */
    if (
      getMultiTypeFromValue(template?.spec?.routes) === MultiTypeInputType.RUNTIME &&
      isRequired &&
      isEmpty(data?.spec?.routes)
    ) {
      set(errors, 'spec.routes', getString?.('fieldRequired', { field: 'Route' }))
    }

    /* istanbul ignore else */
    if (isEmpty(errors.spec)) {
      delete errors.spec
    }
    return errors
  }

  protected type = StepType.RouteMapping
  protected stepName = 'Route Mapping'
  protected stepIcon: IconName = 'tasMapRoute'
  protected referenceId = 'RouteMappingStep'
  protected stepDescription: keyof StringsMap = 'pipeline.stepDescription.RouteMapping'

  protected defaultValues: RouteMappingStepData = {
    identifier: '',
    name: '',
    type: StepType.RouteMapping,
    timeout: '10m',
    spec: {
      appName: '',
      routeType: RouteType.Map,
      routes: []
    }
  }
}
