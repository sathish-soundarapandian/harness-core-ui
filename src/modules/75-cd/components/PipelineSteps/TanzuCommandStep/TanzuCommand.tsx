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
  Container,
  Label
} from '@harness/uicore'
import * as Yup from 'yup'
import cx from 'classnames'
import { FormikErrors, FormikProps, useFormikContext, yupToFormErrors } from 'formik'

import { defaultTo, isEmpty, set } from 'lodash-es'
import { StepViewType, StepProps, ValidateInputSetProps, setFormikRef } from '@pipeline/components/AbstractSteps/Step'
import type { StepFormikFowardRef } from '@pipeline/components/AbstractSteps/Step'
import type { StepElementConfig, StoreConfig, TasCommandStepInfo } from 'services/cd-ng'
import type { VariableMergeServiceResponse } from 'services/pipeline-ng'
import { VariablesListTable } from '@pipeline/components/VariablesListTable/VariablesListTable'
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
import MultiConfigSelectField from '@pipeline/components/ConfigFilesSelection/ConfigFilesWizard/ConfigFilesSteps/MultiConfigSelectField/MultiConfigSelectField'
import { InstanceScriptTypes } from '@cd/components/TemplateStudio/DeploymentTemplateCanvas/DeploymentTemplateForm/DeploymentInfraWrapper/DeploymentInfraUtils'
import { FileSelectList } from '@filestore/components/FileStoreList/FileStoreList'
import MultiTypeFieldSelector from '@common/components/MultiTypeFieldSelector/MultiTypeFieldSelector'
import { ScriptType, ShellScriptMonacoField } from '@common/components/ShellScriptMonaco/ShellScriptMonaco'
import { FILE_TYPE_VALUES } from '@pipeline/components/ConfigFilesSelection/ConfigFilesHelper'
import { FileUsage } from '@filestore/interfaces/FileStore'
import { SELECT_FILES_TYPE } from '@filestore/utils/constants'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
import pipelineVariablesCss from '@pipeline/components/PipelineStudio/PipelineVariables/PipelineVariables.module.scss'
import css from './TanzuCommand.module.scss'

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
const scriptType: ScriptType = 'Bash'

function TanzuCommandWidget(
  props: TanzuCommandProps,
  formikRef: StepFormikFowardRef<TanzuCommandData>
): React.ReactElement {
  const { initialValues, onUpdate, isNewStep, readonly, allowableTypes, onChange, stepViewType } = props
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()

  const scriptWidgetTitle = React.useMemo(
    (): JSX.Element => (
      <Layout.Vertical>
        <Label>{getString('common.script')}</Label>
      </Layout.Vertical>
    ),
    [getString]
  )

  /* istanbul ignore next */
  const onSelectChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
    values: TanzuCommandData,
    setFieldValue: (field: string, value: any) => void
  ): void => {
    const fieldName = 'spec.script.store'
    if (e.target.value === InstanceScriptTypes.Inline) {
      setFieldValue(fieldName, {
        type: InstanceScriptTypes.Inline,
        spec: {
          content: values?.spec?.script?.store?.spec?.content || ''
        }
      })
    } else {
      setFieldValue(fieldName, {
        type: InstanceScriptTypes.FileStore,
        spec: {
          files: !isEmpty(values?.spec?.script?.store?.spec?.files) ? values?.spec?.script?.store?.spec?.files : ['']
        }
      })
    }
  }

  return (
    <Formik<TanzuCommandData>
      onSubmit={(values: TanzuCommandData) => {
        /* istanbul ignore next */
        onUpdate?.(values)
      }}
      formName="TanzuCommandStep"
      initialValues={initialValues}
      validate={data => {
        /* istanbul ignore next */
        onChange?.(data)
      }}
      validationSchema={Yup.object().shape({
        ...getNameAndIdentifierSchema(getString, stepViewType),
        timeout: getDurationValidationSchema({ minimum: '10s' }).required(getString('validation.timeout10SecMinimum')),
        spec: Yup.object().shape({
          script: Yup.object().shape({
            store: Yup.object().shape({
              type: Yup.string(),
              spec: Yup.object()
                .when('type', {
                  is: value => value === InstanceScriptTypes.Inline,
                  then: Yup.object().shape({
                    content: Yup.string()
                      .trim()
                      .required(getString('common.validation.fieldIsRequired', { name: getString('common.script') }))
                  })
                })
                .when('type', {
                  is: value => value === InstanceScriptTypes.FileStore,
                  /* istanbul ignore next */
                  then: Yup.object().shape({
                    /* istanbul ignore next */
                    files: Yup.lazy((value): Yup.Schema<unknown> => {
                      /* istanbul ignore next */
                      if (getMultiTypeFromValue(value as string[]) === MultiTypeInputType.FIXED) {
                        return Yup.array().of(
                          Yup.string().required(
                            getString('common.validation.fieldIsRequired', { name: getString('common.file') })
                          )
                        )
                      }
                      /* istanbul ignore next */
                      return Yup.string().required(
                        getString('common.validation.fieldIsRequired', { name: getString('common.file') })
                      )
                    })
                  })
                })
            })
          })
        })
      })}
    >
      {(formik: FormikProps<TanzuCommandData>) => {
        const { values, setFieldValue } = formik
        const templateFileType = values?.spec?.script?.store?.type
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
                  enableConfigureOptions: true,
                  expressions,
                  disabled: readonly,
                  allowableTypes
                }}
              />
            </div>

            <Layout.Horizontal flex={{ alignItems: 'flex-start' }}>
              <Container className={css.typeSelect}>
                <select
                  className={css.selectDropdown}
                  name="spec.script.store.type"
                  disabled={readonly}
                  value={templateFileType}
                  onChange={
                    /* istanbul ignore next */ e => {
                      onSelectChange(e, values, setFieldValue)
                    }
                  }
                  data-testid="templateOptions"
                >
                  <option value={InstanceScriptTypes.FileStore}>{getString('resourcePage.fileStore')}</option>
                  <option value={InstanceScriptTypes.Inline}>{getString('inline')}</option>
                </select>
              </Container>
            </Layout.Horizontal>

            {templateFileType === InstanceScriptTypes.FileStore && (
              <div className={cx(stepCss.formGroup, stepCss.md)}>
                <MultiConfigSelectField
                  name="spec.script.store.spec.files"
                  allowableTypes={allowableTypes}
                  fileType={FILE_TYPE_VALUES.FILE_STORE}
                  formik={formik}
                  expressions={expressions}
                  fileUsage={FileUsage.SCRIPT}
                  values={defaultTo(formik.values.spec?.script?.store?.spec?.files, [''])}
                  multiTypeFieldSelectorProps={{
                    disableTypeSelection: false,
                    disabled: readonly,
                    label: scriptWidgetTitle
                  }}
                  restrictToSingleEntry={true}
                />
              </div>
            )}

            {templateFileType === InstanceScriptTypes.Inline && (
              <div>
                <MultiTypeFieldSelector
                  name="spec.script.store.spec.content"
                  label={scriptWidgetTitle}
                  defaultValueToReset=""
                  disabled={readonly}
                  allowedTypes={allowableTypes}
                  disableTypeSelection={readonly}
                  skipRenderValueInExpressionLabel
                  expressionRender={
                    /* istanbul ignore next */ () => {
                      return (
                        <ShellScriptMonacoField
                          name="spec.script.store.spec.content"
                          scriptType={scriptType}
                          disabled={readonly}
                          expressions={expressions}
                        />
                      )
                    }
                  }
                >
                  <ShellScriptMonacoField
                    name="spec.script.store.spec.content"
                    scriptType={scriptType}
                    disabled={readonly}
                    expressions={expressions}
                  />
                </MultiTypeFieldSelector>
              </div>
            )}
          </Layout.Vertical>
        )
      }}
    </Formik>
  )
}

const TanzuCommandInputStep: React.FC<TanzuCommandProps> = props => {
  const { inputSetData, allowableTypes, stepViewType } = props
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  /* istanbul ignore next */
  const getNameEntity = (fieldName: string): string =>
    `${isEmpty(inputSetData?.path) ? '' : `${inputSetData?.path}.`}${fieldName}`
  const prefix = isEmpty(inputSetData?.path) ? '' : `${inputSetData?.path}.`
  const formik = useFormikContext()
  return (
    <>
      {getMultiTypeFromValue(inputSetData?.template?.timeout) === MultiTypeInputType.RUNTIME && (
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
          className={cx(stepCss.formGroup, stepCss.sm)}
        />
      )}

      {getMultiTypeFromValue(inputSetData?.template?.spec?.script?.store?.spec?.files) ===
      MultiTypeInputType.RUNTIME ? (
        <div className={cx(stepCss.formGroup, stepCss.alignStart, stepCss.md)}>
          <FileSelectList
            label={
              <Layout.Vertical>
                <Label>{getString('common.script')}</Label>
              </Layout.Vertical>
            }
            name={`${prefix}spec.script.store.spec.files`}
            disabled={inputSetData?.readonly}
            style={{ marginBottom: 'var(--spacing-small)' }}
            expressions={expressions}
            isNameOfArrayType
            type={SELECT_FILES_TYPE.FILE_STORE}
            formik={formik}
            allowOnlyOne
          />
        </div>
      ) : null}

      {getMultiTypeFromValue(inputSetData?.template?.spec?.script?.store?.spec?.content) ===
      MultiTypeInputType.RUNTIME ? (
        <div className={cx(stepCss.formGroup, stepCss.alignStart, stepCss.md)}>
          <MultiTypeFieldSelector
            name={`${prefix}spec.script.store.spec.content`}
            label={
              <Layout.Vertical>
                <Label>{getString('common.script')}</Label>
              </Layout.Vertical>
            }
            defaultValueToReset=""
            allowedTypes={allowableTypes}
            skipRenderValueInExpressionLabel
            disabled={inputSetData?.readonly}
            expressionRender={
              /* istanbul ignore next */ () => (
                <ShellScriptMonacoField
                  name={`${prefix}spec.script.store.spec.content`}
                  scriptType={scriptType}
                  disabled={inputSetData?.readonly}
                  expressions={expressions}
                />
              )
            }
          >
            <ShellScriptMonacoField
              name={`${prefix}spec.script.store.spec.content`}
              scriptType={scriptType}
              disabled={inputSetData?.readonly}
              expressions={expressions}
            />
          </MultiTypeFieldSelector>
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
          onUpdate={/* istanbul ignore next */ data => onUpdate?.(this.processFormData(data))}
          stepViewType={stepViewType}
          inputSetData={inputSetData}
          formikRef={formikRef}
        />
      )
    } else if (stepViewType === StepViewType.InputVariable) {
      const { variablesData, metadataMap } = customStepProps as TanzuCommandVariableStepProps
      /* istanbul ignore else */
      if ((variablesData.spec.script.store as StoreConfig)?.spec.files) {
        variablesData.spec['spec.script.store.spec.files'] = defaultTo(
          (variablesData.spec.script.store as StoreConfig)?.spec.files,

          ''
        )
      }
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
    /* istanbul ignore else */
    if (getMultiTypeFromValue(template?.timeout) === MultiTypeInputType.RUNTIME) {
      let timeoutSchema = getDurationValidationSchema({ minimum: '10s' })
      /* istanbul ignore else */
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
      getMultiTypeFromValue(template?.spec?.script?.store?.spec?.files) === MultiTypeInputType.RUNTIME &&
      isRequired &&
      isEmpty(data?.spec?.script?.store?.spec?.files)
    ) {
      set(errors, 'spec.script.store.spec.files', getString?.('fieldRequired', { field: 'File path' }))
    }
    /* istanbul ignore else */
    if (
      getMultiTypeFromValue(template?.spec?.script?.store?.spec?.content) === MultiTypeInputType.RUNTIME &&
      isRequired &&
      isEmpty(data?.spec?.script?.store?.spec?.content)
    ) {
      set(errors, 'spec.script.store.spec.content', getString?.('fieldRequired', { field: 'Script' }))
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
    const templateFile = values.spec.script.store.type
    return {
      ...values,
      spec: {
        ...values.spec,
        script: {
          ...values.spec.script,
          store: {
            ...values.spec.script.store,
            type: templateFile,
            spec:
              templateFile === InstanceScriptTypes.Inline
                ? {
                    content: values.spec.script.store?.spec?.content
                  }
                : {
                    files: fileFormData
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
    timeout: '',
    spec: {
      script: {
        store: {
          type: 'Harness',
          spec: {
            files: ['']
          }
        }
      }
    }
  }
}
