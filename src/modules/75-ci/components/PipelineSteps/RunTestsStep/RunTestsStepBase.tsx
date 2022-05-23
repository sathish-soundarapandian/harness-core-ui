/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FormEvent } from 'react'
import {
  Text,
  Formik,
  getMultiTypeFromValue,
  MultiTypeInputType,
  FormikForm,
  Accordion,
  RadioButtonGroup,
  CodeBlock,
  Container,
  Layout,
  SelectOption
} from '@wings-software/uicore'
import { Color } from '@harness/design-system'
import type { FormikProps } from 'formik'
import get from 'lodash/get'
import cx from 'classnames'
import { StepFormikFowardRef, setFormikRef } from '@pipeline/components/AbstractSteps/Step'
import MultiTypeFieldSelector from '@common/components/MultiTypeFieldSelector/MultiTypeFieldSelector'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import { ShellScriptMonacoField } from '@common/components/ShellScriptMonaco/ShellScriptMonaco'
import { MultiTypeSelectField } from '@common/components/MultiTypeSelect/MultiTypeSelect'
import { FormMultiTypeCheckboxField } from '@common/components'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { useStrings } from 'framework/strings'
import type { StringsMap } from 'stringTypes'
import { MultiTypeTextField } from '@common/components/MultiTypeText/MultiTypeText'
import StepCommonFields, {
  GetImagePullPolicyOptions,
  GetShellOptions /*,{ /*usePullOptions }*/
} from '@ci/components/PipelineSteps/StepCommonFields/StepCommonFields'
import { validate } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import {
  getInitialValuesInCorrectFormat,
  getFormValuesInCorrectFormat
} from '@pipeline/components/PipelineSteps/Steps/StepsTransformValuesUtils'
import type { RunTestsStepProps, RunTestsStepData, RunTestsStepDataUI } from './RunTestsStep'
import { transformValuesFieldsConfig, getEditViewValidateFieldsConfig } from './RunTestsStepFunctionConfigs'
import { CIStepOptionalConfig, getOptionalSubLabel } from '../CIStep/CIStepOptionalConfig'
import {
  AllMultiTypeInputTypesForStep,
  useGetPropagatedStageById,
  validateConnectorRefAndImageDepdendency
} from '../CIStep/StepUtils'
import { CIStep } from '../CIStep/CIStep'
import { ConnectorRefWithImage } from '../CIStep/ConnectorRefWithImage'
import { CIBuildInfrastructureType } from '../../../constants/Constants'
import css from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

interface FieldRenderProps {
  name: string
  fieldLabelKey: keyof StringsMap
  tooltipId: string
  allowableTypes: MultiTypeInputType[]
  renderOptionalSublabel?: boolean
  selectFieldOptions?: SelectOption[]
  onSelectChange?: (SelectOption: any) => void
}

const javaBuildToolOptions = [
  { label: 'Bazel', value: 'Bazel' },
  { label: 'Maven', value: 'Maven' },
  { label: 'Gradle', value: 'Gradle' }
]

const cSharpBuildToolOptions = [
  { label: 'Dotnet', value: 'Dotnet' },
  { label: 'Nunit Console', value: 'Nunitconsole' }
]

const enum Language {
  Java = 'Java',
  Csharp = 'Csharp'
}

const getBuildToolOptions = (language?: string): SelectOption[] | undefined => {
  if (language === Language.Java) {
    return javaBuildToolOptions
  } else if (language === Language.Csharp) {
    return cSharpBuildToolOptions
  }
  return undefined
}

export const RunTestsStepBase = (
  { initialValues, onUpdate, isNewStep = true, readonly, stepViewType, onChange }: RunTestsStepProps,
  formikRef: StepFormikFowardRef<RunTestsStepData>
): JSX.Element => {
  const {
    state: {
      selectionState: { selectedStageId }
    }
  } = usePipelineContext()

  const [mavenSetupQuestionAnswer, setMavenSetupQuestionAnswer] = React.useState('yes')
  const currentStage = useGetPropagatedStageById(selectedStageId || '')
  const buildInfrastructureType: CIBuildInfrastructureType = get(currentStage, 'stage.spec.infrastructure.type')
  const [languageOptions, setLanguageOptions] = React.useState<SelectOption[]>([
    { label: 'Csharp', value: Language.Csharp },
    { label: 'Java', value: Language.Java }
  ])

  React.useEffect(() => {
    if (buildInfrastructureType !== CIBuildInfrastructureType.VM) {
      setLanguageOptions([{ label: 'Java', value: Language.Java }])
    }
  }, [buildInfrastructureType])

  const [buildToolOptions, setBuildToolOptions] = React.useState<SelectOption[]>(
    getBuildToolOptions(initialValues?.spec?.language) || []
  )

  const { getString } = useStrings()

  const { expressions } = useVariablesExpression()

  // TODO: Right now we do not support Image Pull Policy but will do in the future
  // const pullOptions = usePullOptions()

  // TODO: Right now we do not support Image Pull Policy but will do in the future
  // const values = getInitialValuesInCorrectFormat<RunTestsStepData, RunTestsStepDataUI>(initialValues, transformValuesFieldsConfig, {
  //   pullOptions
  // })

  const renderMultiTypeTextField = React.useCallback(
    ({ name, fieldLabelKey, tooltipId, allowableTypes, renderOptionalSublabel = false }: FieldRenderProps) => {
      return (
        <MultiTypeTextField
          name={name}
          label={
            <Layout.Horizontal flex={{ justifyContent: 'flex-start', alignItems: 'baseline' }}>
              <Text
                className={css.inpLabel}
                color={Color.GREY_600}
                font={{ size: 'small', weight: 'semi-bold' }}
                tooltipProps={renderOptionalSublabel ? {} : { dataTooltipId: tooltipId }}
              >
                {getString(fieldLabelKey)}
              </Text>
              {renderOptionalSublabel ? (
                <>
                  &nbsp;
                  {getOptionalSubLabel(getString, tooltipId)}
                </>
              ) : null}
            </Layout.Horizontal>
          }
          multiTextInputProps={{
            multiTextInputProps: { expressions, allowableTypes },
            disabled: readonly
          }}
          style={{ marginBottom: 'var(--spacing-small)' }}
        />
      )
    },
    []
  )

  const renderMultiTypeSelectField = React.useCallback(
    ({ name, fieldLabelKey, tooltipId, selectFieldOptions = [], onSelectChange, allowableTypes }: FieldRenderProps) => {
      return (
        <MultiTypeSelectField
          name={name}
          label={
            <Text
              className={css.inpLabel}
              color={Color.GREY_600}
              font={{ size: 'small', weight: 'semi-bold' }}
              tooltipProps={{ dataTooltipId: tooltipId }}
            >
              {getString(fieldLabelKey)}
            </Text>
          }
          multiTypeInputProps={{
            selectItems: selectFieldOptions,
            multiTypeInputProps: {
              onChange: option => onSelectChange?.(option),
              allowableTypes: allowableTypes,
              expressions
            },
            disabled: readonly
          }}
          disabled={readonly}
        />
      )
    },
    []
  )

  const renderMultiTypeFieldSelector = React.useCallback(
    ({ name, fieldLabelKey, tooltipId, allowableTypes }: FieldRenderProps) => {
      return (
        <MultiTypeFieldSelector
          name={name}
          label={
            <Layout.Horizontal flex={{ justifyContent: 'flex-start', alignItems: 'baseline' }}>
              <Text
                className={css.inpLabel}
                color={Color.GREY_600}
                font={{ size: 'small', weight: 'semi-bold' }}
                style={{ display: 'flex', alignItems: 'center' }}
              >
                {getString(fieldLabelKey)}
              </Text>
              &nbsp;
              {getOptionalSubLabel(getString, tooltipId)}
            </Layout.Horizontal>
          }
          defaultValueToReset=""
          allowedTypes={allowableTypes}
          expressionRender={() => {
            return (
              <ShellScriptMonacoField name={name} scriptType="Bash" disabled={readonly} expressions={expressions} />
            )
          }}
          style={{ flexGrow: 1, marginBottom: 0 }}
          disableTypeSelection={readonly}
        >
          <ShellScriptMonacoField name={name} scriptType="Bash" disabled={readonly} />
        </MultiTypeFieldSelector>
      )
    },
    []
  )

  return (
    <Formik
      initialValues={getInitialValuesInCorrectFormat<RunTestsStepData, RunTestsStepDataUI>(
        initialValues,
        transformValuesFieldsConfig,
        {
          buildToolOptions,
          languageOptions,
          imagePullPolicyOptions: GetImagePullPolicyOptions(),
          shellOptions: GetShellOptions(getString)
        }
      )}
      formName="ciRunTests"
      validate={valuesToValidate => {
        if (buildInfrastructureType === CIBuildInfrastructureType.VM) {
          return validateConnectorRefAndImageDepdendency(
            get(valuesToValidate, 'spec.connectorRef', ''),
            get(valuesToValidate, 'spec.image', ''),
            getString
          )
        }
        const schemaValues = getFormValuesInCorrectFormat<RunTestsStepDataUI, RunTestsStepData>(
          valuesToValidate,
          transformValuesFieldsConfig
        )
        onChange?.(schemaValues)
        return validate(
          valuesToValidate,
          getEditViewValidateFieldsConfig(buildInfrastructureType),
          {
            initialValues,
            steps: currentStage?.stage?.spec?.execution?.steps || {},
            serviceDependencies: currentStage?.stage?.spec?.serviceDependencies || {},
            getString
          },
          stepViewType
        )
      }}
      onSubmit={(_values: RunTestsStepDataUI) => {
        const schemaValues = getFormValuesInCorrectFormat<RunTestsStepDataUI, RunTestsStepData>(
          _values,
          transformValuesFieldsConfig
        )
        onUpdate?.(schemaValues)
      }}
    >
      {(formik: FormikProps<RunTestsStepData>) => {
        // This is required
        setFormikRef?.(formikRef, formik)

        return (
          <FormikForm>
            <CIStep
              isNewStep={isNewStep}
              readonly={readonly}
              stepViewType={stepViewType}
              formik={formik}
              enableFields={{
                name: {},
                description: {}
              }}
            />
            {buildInfrastructureType !== CIBuildInfrastructureType.VM ? (
              <ConnectorRefWithImage showOptionalSublabel={false} readonly={readonly} stepViewType={stepViewType} />
            ) : null}
            <Container className={cx(css.formGroup, css.lg, css.bottomMargin5)}>
              {renderMultiTypeSelectField({
                name: 'spec.language',
                fieldLabelKey: 'languageLabel',
                tooltipId: 'runTestsLanguage',
                selectFieldOptions: languageOptions,
                onSelectChange: (option?: SelectOption) => {
                  const newBuildToolOptions = getBuildToolOptions(option?.value as string)
                  if (newBuildToolOptions) {
                    setBuildToolOptions(newBuildToolOptions)
                    formik.setFieldValue('spec.buildTool', '')
                  }
                },
                allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION]
              })}
            </Container>
            <Container className={cx(css.formGroup, css.lg, css.bottomMargin5)}>
              {renderMultiTypeSelectField({
                name: 'spec.buildTool',
                fieldLabelKey: 'buildToolLabel',
                tooltipId: 'runTestsBuildTool',
                selectFieldOptions: buildToolOptions,
                allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION]
              })}
            </Container>
            {(formik.values?.spec?.language as any)?.value === Language.Java &&
              (formik.values?.spec?.buildTool as any)?.value === 'Maven' && (
                <>
                  <Text margin={{ top: 'small', bottom: 'small' }} color="grey800">
                    {getString('ci.runTestsMavenSetupTitle')}
                  </Text>
                  <Text font={{ size: 'small' }}>{getString('ci.runTestsMavenSetupText1')}</Text>
                  <RadioButtonGroup
                    name="run-tests-maven-setup"
                    inline={true}
                    selectedValue={mavenSetupQuestionAnswer}
                    onChange={(e: FormEvent<HTMLInputElement>) => {
                      setMavenSetupQuestionAnswer(e.currentTarget.value)
                    }}
                    options={[
                      { label: 'Yes', value: 'yes' },
                      { label: 'No', value: 'no' }
                    ]}
                    margin={{ bottom: 'small' }}
                  />
                  {mavenSetupQuestionAnswer === 'yes' && (
                    <Container className={cx(css.bottomMargin5)}>
                      <Text
                        font={{ size: 'small' }}
                        margin={{ bottom: 'xsmall' }}
                        tooltipProps={{ dataTooltipId: 'runTestsMavenSetupText2' }}
                      >
                        {getString('ci.runTestsMavenSetupText2')}
                      </Text>
                      <CodeBlock format="pre" snippet={getString('ci.runTestsMavenSetupSample')} />
                    </Container>
                  )}
                </>
              )}
            {(formik.values?.spec?.language as any)?.value === Language.Java &&
              (formik.values?.spec?.buildTool as any)?.value === 'Gradle' && (
                <>
                  <Text margin={{ top: 'small', bottom: 'small' }} color="grey800">
                    {getString('ci.gradleNotesTitle')}
                  </Text>
                  <CodeBlock
                    allowCopy
                    codeToCopy={`tasks.withType(Test) {
  if(System.getProperty("HARNESS_JAVA_AGENT")) {
    jvmArgs += [System.getProperty("HARNESS_JAVA_AGENT")]
  }
}

gradle.projectsEvaluated {
        tasks.withType(Test) {
            filter {
                setFailOnNoMatchingTests(false)
            }
        }
}`}
                    format="pre"
                    snippet={getString('ci.gradleNote1')}
                  />
                  <Text margin={{ top: 'small' }} color="grey800">
                    {getString('ci.gradleNote2')}
                  </Text>
                </>
              )}
            <Container className={cx(css.formGroup, css.lg, css.bottomMargin5)}>
              {renderMultiTypeTextField({
                name: 'spec.args',
                fieldLabelKey: 'argsLabel',
                tooltipId: 'runTestsArgs',
                allowableTypes: AllMultiTypeInputTypesForStep
              })}
            </Container>
            <Container className={cx(css.formGroup, css.lg)}>
              {renderMultiTypeTextField({
                name: 'spec.packages',
                fieldLabelKey: 'packagesLabel',
                tooltipId: 'runTestsPackages',
                allowableTypes: AllMultiTypeInputTypesForStep
              })}
            </Container>
            <Accordion className={css.accordion}>
              <Accordion.Panel
                id="optional-config"
                summary={getString('common.optionalConfig')}
                details={
                  <Container margin={{ top: 'medium' }}>
                    {buildInfrastructureType === CIBuildInfrastructureType.VM ? (
                      <ConnectorRefWithImage
                        showOptionalSublabel={true}
                        readonly={readonly}
                        stepViewType={stepViewType}
                      />
                    ) : null}
                    <Container className={cx(css.formGroup, css.sm, css.bottomMargin5)}>
                      <FormMultiTypeCheckboxField
                        name="spec.runOnlySelectedTests"
                        label={getString('runOnlySelectedTestsLabel')}
                        multiTypeTextbox={{
                          expressions,
                          disabled: readonly,
                          allowableTypes: AllMultiTypeInputTypesForStep
                        }}
                        style={{ marginBottom: 'var(--spacing-small)' }}
                        disabled={readonly}
                      />
                    </Container>
                    <Container className={cx(css.formGroup, css.sm, css.bottomMargin5)}>
                      {renderMultiTypeTextField({
                        name: 'spec.testAnnotations',
                        fieldLabelKey: 'testAnnotationsLabel',
                        tooltipId: '',
                        renderOptionalSublabel: true,
                        allowableTypes: AllMultiTypeInputTypesForStep
                      })}
                    </Container>
                    <Container className={css.bottomMargin5}>
                      <div
                        className={cx(css.fieldsGroup, css.withoutSpacing)}
                        style={{ marginBottom: 'var(--spacing-small)' }}
                      >
                        {renderMultiTypeFieldSelector({
                          name: 'spec.preCommand',
                          fieldLabelKey: 'ci.preCommandLabel',
                          tooltipId: '',
                          allowableTypes: AllMultiTypeInputTypesForStep
                        })}
                        {getMultiTypeFromValue(formik?.values?.spec?.preCommand) === MultiTypeInputType.RUNTIME && (
                          <ConfigureOptions
                            style={{ marginTop: 17 }}
                            value={formik?.values?.spec?.preCommand as string}
                            type={getString('string')}
                            variableName="spec.preCommand"
                            showRequiredField={false}
                            showDefaultField={false}
                            showAdvanced={true}
                            onChange={value => formik?.setFieldValue('spec.preCommand', value)}
                            isReadonly={readonly}
                          />
                        )}
                      </div>
                    </Container>
                    <Container className={css.bottomMargin5}>
                      <div
                        className={cx(css.fieldsGroup, css.withoutSpacing)}
                        style={{ marginBottom: 'var(--spacing-small)' }}
                      >
                        {renderMultiTypeFieldSelector({
                          name: 'spec.postCommand',
                          fieldLabelKey: 'ci.postCommandLabel',
                          tooltipId: '',
                          allowableTypes: AllMultiTypeInputTypesForStep
                        })}
                        {getMultiTypeFromValue(formik?.values?.spec?.postCommand) === MultiTypeInputType.RUNTIME && (
                          <ConfigureOptions
                            style={{ marginTop: 17 }}
                            value={formik?.values?.spec?.postCommand as string}
                            type={getString('string')}
                            variableName="spec.postCommand"
                            showRequiredField={false}
                            showDefaultField={false}
                            showAdvanced={true}
                            onChange={value => formik?.setFieldValue('spec.postCommand', value)}
                            isReadonly={readonly}
                          />
                        )}
                      </div>
                    </Container>
                    <CIStepOptionalConfig
                      stepViewType={stepViewType}
                      readonly={readonly}
                      enableFields={{
                        'spec.reportPaths': {},
                        'spec.envVariables': { tooltipId: 'environmentVariables' },
                        'spec.outputVariables': {}
                      }}
                    />
                    <StepCommonFields
                      enableFields={['spec.shell', 'spec.imagePullPolicy']}
                      disabled={readonly}
                      buildInfrastructureType={buildInfrastructureType}
                    />
                  </Container>
                }
              />
            </Accordion>
          </FormikForm>
        )
      }}
    </Formik>
  )
}

export const RunTestsStepBaseWithRef = React.forwardRef(RunTestsStepBase)
