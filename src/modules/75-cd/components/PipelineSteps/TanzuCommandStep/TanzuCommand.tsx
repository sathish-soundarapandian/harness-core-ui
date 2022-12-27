/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import {
  IconName,
  Formik,
  FormInput,
  Layout,
  getMultiTypeFromValue,
  MultiTypeInputType,
  AllowedTypes,
  Text
} from '@harness/uicore'
import { Color } from '@harness/design-system'
import * as Yup from 'yup'
import cx from 'classnames'
import { FormikErrors, FormikProps, yupToFormErrors } from 'formik'

import { defaultTo, isArray, isEmpty, set } from 'lodash-es'
import produce from 'immer'
import { StepViewType, StepProps, ValidateInputSetProps, setFormikRef } from '@pipeline/components/AbstractSteps/Step'
import type { StepFormikFowardRef } from '@pipeline/components/AbstractSteps/Step'
import type { StepElementConfig, StoreConfig, TasCommandStepInfo } from 'services/cd-ng'
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
import { isRuntimeInput } from '@pipeline/utils/CIUtils'
import { MultiConfigSelectField } from '@pipeline/components/StartupScriptSelection/MultiConfigSelectField'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
import pipelineVariablesCss from '@pipeline/components/PipelineStudio/PipelineVariables/PipelineVariables.module.scss'

interface TanzuCommandData extends StepElementConfig {
  spec: TasCommandStepInfo
}

export interface TanzuCommandVariableStepProps {
  initialValues: TanzuCommandData
  stageIdentifier: string
  onUpdate?(data: TanzuCommandData): void
  metadataMap: Required<VariableMergeServiceResponse>['metadataMap']
  variablesData: TanzuCommandData
}

interface TanzuCommandProps {
  initialValues: TanzuCommandData
  onUpdate?: (data: TanzuCommandData) => void
  onChange?: (data: TanzuCommandData) => void
  allowableTypes: AllowedTypes
  readonly?: boolean
  stepViewType?: StepViewType
  isNewStep?: boolean
  inputSetData?: {
    template?: TanzuCommandData
    path?: string
    readonly?: boolean
  }
  formikRef?: any
}

function TanzuCommandWidget(
  props: TanzuCommandProps,
  formikRef: StepFormikFowardRef<TanzuCommandData>
): React.ReactElement {
  const { initialValues, onUpdate, isNewStep, readonly, allowableTypes, onChange, stepViewType } = props
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()

  const getInitialValues = (): TanzuCommandData => {
    const updatedValues = produce(initialValues, draft => {
      if (draft.spec.script.store.spec?.files && isArray(draft.spec.script.store.spec?.files)) {
        draft.spec.script.store.spec.files = draft.spec.script.store.spec?.files[0]
      }
    })
    return updatedValues
  }

  return (
    <>
      <Formik<TanzuCommandData>
        onSubmit={(values: TanzuCommandData) => {
          /* istanbul ignore next */
          onUpdate?.(values)
        }}
        formName="TanzuCommandStep"
        initialValues={getInitialValues()}
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
            script: Yup.object().shape({
              store: Yup.object().shape({
                type: Yup.string(),
                spec: Yup.object().shape({
                  files: Yup.lazy(() =>
                    Yup.string().required(
                      getString('common.validation.fieldIsRequired', { name: getString('common.file') })
                    )
                  )
                })
              })
            })
          })
        })}
      >
        {(formik: FormikProps<TanzuCommandData>) => {
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
                  multiTypeDurationProps={{
                    enableConfigureOptions: false,
                    expressions,
                    disabled: readonly,
                    allowableTypes
                  }}
                />
                {getMultiTypeFromValue(values.timeout) === MultiTypeInputType.RUNTIME && (
                  <ConfigureOptions
                    value={values.timeout as string}
                    type="String"
                    variableName="step.timeout"
                    showRequiredField={false}
                    showDefaultField={false}
                    showAdvanced={true}
                    onChange={value => {
                      setFieldValue('timeout', value)
                    }}
                    isReadonly={readonly}
                    allowedValuesType={ALLOWED_VALUES_TYPE.TIME}
                  />
                )}
              </div>

              <div className={cx(stepCss.formGroup, stepCss.md)}>
                <MultiConfigSelectField
                  fileType={'fileStore'}
                  name="spec.script.store.spec.files"
                  formik={formik}
                  expressions={expressions}
                  values={defaultTo(formik.values.spec?.script?.store?.spec?.files, [''])}
                  multiTypeFieldSelectorProps={{
                    disableTypeSelection: false,
                    label: (
                      <Text color={Color.GREY_600} padding={{ bottom: 4 }}>
                        {getString('common.script')}
                      </Text>
                    )
                  }}
                />
              </div>
            </Layout.Vertical>
          )
        }}
      </Formik>
    </>
  )
}

const TanzuCommandInputStep: React.FC<TanzuCommandProps> = ({
  inputSetData,
  allowableTypes,
  stepViewType,
  initialValues
}) => {
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  /* istanbul ignore next */
  const getNameEntity = (fieldName: string): string =>
    `${isEmpty(inputSetData?.path) ? '' : `${inputSetData?.path}.`}${fieldName}`
  const prefix = isEmpty(inputSetData?.path) ? '' : `${inputSetData?.path}.`

  return (
    <>
      {getMultiTypeFromValue(inputSetData?.template?.timeout) === MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.sm)}>
          <TimeoutFieldInputSetView
            name={getNameEntity('timeout')}
            label={getString('pipelineSteps.timeoutLabel')}
            multiTypeDurationProps={{
              configureOptionsProps: {
                isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
              },
              allowableTypes: allowableTypes,
              expressions,
              disabled: inputSetData?.readonly
            }}
            disabled={inputSetData?.readonly}
            fieldPath={'timeout'}
            template={inputSetData?.template}
          />
        </div>
      )}

      {getMultiTypeFromValue(inputSetData?.template?.spec?.script?.store?.spec?.files) ===
      MultiTypeInputType.RUNTIME ? (
        <div className={cx(stepCss.formGroup, stepCss.alignStart, stepCss.md)}>
          <MultiConfigSelectField
            fileType={'fileStore'}
            name={`${prefix}spec.script.store.spec.files`}
            expressions={expressions}
            values={defaultTo(initialValues.spec?.script?.store?.spec?.files, '')}
            multiTypeFieldSelectorProps={{
              disableTypeSelection: false,
              label: (
                <Text color={Color.GREY_600} padding={{ bottom: 4 }}>
                  {getString('common.script')}
                </Text>
              ),
              allowedTypes: allowableTypes
            }}
            configureOptionsProps={{
              isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType)
            }}
          />
        </div>
      ) : null}
    </>
  )
}

const TanzuCommandWidgetWithRef = React.forwardRef(TanzuCommandWidget)
export class TanzuCommandStep extends PipelineStep<TanzuCommandData> {
  constructor() {
    super()
    this._hasStepVariables = true
    this._hasDelegateSelectionVisible = true
  }

  renderStep(props: StepProps<TanzuCommandData>): JSX.Element {
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
        <TanzuCommandInputStep
          allowableTypes={allowableTypes}
          initialValues={initialValues}
          onUpdate={data => onUpdate?.(this.processFormData(data))}
          stepViewType={stepViewType}
          inputSetData={inputSetData}
          formikRef={formikRef}
        />
      )
    } else if (stepViewType === StepViewType.InputVariable) {
      const { variablesData, metadataMap } = customStepProps as TanzuCommandVariableStepProps
      if ((variablesData.spec.script.store as StoreConfig)?.spec.files) {
        variablesData.spec['spec.script.store.spec.files'] = defaultTo(
          (variablesData.spec.script.store as StoreConfig)?.spec.files,

          ''
        )
      }
      return (
        <VariablesListTable
          className={pipelineVariablesCss.variablePaddingL3}
          data={variablesData}
          originalData={initialValues}
          metadataMap={metadataMap}
        />
      )
    }
    return (
      <TanzuCommandWidgetWithRef
        initialValues={initialValues}
        onUpdate={data => onUpdate?.(this.processFormData(data))}
        onChange={data => onChange?.(this.processFormData(data))}
        isNewStep={isNewStep}
        allowableTypes={allowableTypes}
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
  }: ValidateInputSetProps<TanzuCommandData>): FormikErrors<TanzuCommandData> {
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
    if (
      getMultiTypeFromValue(template?.spec?.script?.store?.spec?.files) === MultiTypeInputType.RUNTIME &&
      isRequired &&
      isEmpty(data?.spec?.script?.store?.spec?.files)
    ) {
      set(errors, 'spec.script.store.spec.files', getString?.('fieldRequired', { field: 'File path' }))
    }
    /* istanbul ignore else */
    if (isEmpty(errors.spec)) {
      delete errors.spec
    }
    return errors
  }

  protected type = StepType.TanzuCommand
  protected stepName = 'Tanzu Command'
  protected stepIcon: IconName = 'tanzuCommand'
  protected referenceId = 'TanzuCommandStep'
  protected stepDescription: keyof StringsMap = 'pipeline.stepDescription.TanzuCommandScript'

  processFormData(values: TanzuCommandData): TanzuCommandData {
    const fileFormData = values.spec.script.store.spec?.files
    return {
      ...values,
      spec: {
        ...values.spec,
        script: {
          ...values.spec.script,
          store: {
            ...values.spec.script.store,
            spec: {
              files: isRuntimeInput(fileFormData) ? fileFormData : [fileFormData]
            }
          }
        }
      }
    }
  }
  protected defaultValues: TanzuCommandData = {
    identifier: '',
    name: '',
    type: StepType.TanzuCommand,
    timeout: '10m',
    spec: {
      script: {
        store: {
          type: 'Harness',
          spec: {}
        }
      }
    }
  }
}
