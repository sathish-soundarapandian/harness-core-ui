/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import {
  Formik,
  Layout,
  Button,
  StepProps,
  Text,
  ButtonVariation,
  FormInput,
  getMultiTypeFromValue,
  MultiTypeInputType,
  MultiSelectOption,
  SelectOption,
  FormikForm
} from '@harness/uicore'
import { FieldArray, Form, FormikProps } from 'formik'
import * as Yup from 'yup'
import { FontVariation } from '@harness/design-system'
import { useParams } from 'react-router-dom'
import { cloneDeep, get, merge, set } from 'lodash-es'
import cx from 'classnames'
import { useStrings } from 'framework/strings'
import type {
  ArtifactType,
  ImagePathProps,
  CustomArtifactSource,
  VariableInterface
} from '@pipeline/components/ArtifactsSelection/ArtifactInterface'
import type { ConnectorConfigDTO } from 'services/cd-ng'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import { getArtifactFormData, shellScriptType } from '@pipeline/components/ArtifactsSelection/ArtifactUtils'
import { FormMultiTypeDurationField } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import MultiTypeFieldSelector from '@common/components/MultiTypeFieldSelector/MultiTypeFieldSelector'
import { ScriptType, ShellScriptMonacoField } from '@common/components/ShellScriptMonaco/ShellScriptMonaco'
import type { AccountPathProps, PipelinePathProps, PipelineType } from '@common/interfaces/RouteInterfaces'
import { useGetDelegateSelectorsUpTheHierarchy } from 'services/portal'
import { ArtifactIdentifierValidation, ModalViewFor } from '../../../ArtifactHelper'
import { ArtifactSourceIdentifier, SideCarArtifactIdentifier } from '../ArtifactIdentifier'
import css from '../../ArtifactConnector.module.scss'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

const DELEGATE_POLLING_INTERVAL_IN_MS = 5000

const scriptInputType: SelectOption[] = [
  { label: 'String', value: 'String' },
  { label: 'Number', value: 'Number' }
]

function FormContent({
  context,
  expressions,
  allowableTypes,
  prevStepData,
  previousStep,
  isReadonly = false,
  formik,
  isMultiArtifactSource
}: any): React.ReactElement {
  const { getString } = useStrings()

  const scriptType: ScriptType =
    formik.values?.spec?.scripts?.fetchAllArtifacts?.spec?.shell || (getString('common.bash') as ScriptType)
  return (
    <FormikForm>
      <div className={css.artifactForm}>
        {isMultiArtifactSource && context === ModalViewFor.PRIMARY && <ArtifactSourceIdentifier />}
        {context === ModalViewFor.SIDECAR && <SideCarArtifactIdentifier />}
        <div className={css.customArtifactContainer}>
          <FormInput.Select
            name="spec.scripts.fetchAllArtifacts.spec.shell"
            label={getString('common.scriptType')}
            items={shellScriptType}
            disabled
          />
        </div>
        <div className={css.customArtifactContainer}>
          <FormMultiTypeDurationField
            name="spec.timeout"
            label={getString('pipelineSteps.timeoutLabel')}
            disabled={isReadonly}
            multiTypeDurationProps={{
              expressions,
              enableConfigureOptions: false,
              allowableTypes
            }}
          />
          {getMultiTypeFromValue(formik.values?.spec?.timeout) === MultiTypeInputType.RUNTIME && (
            <ConfigureOptions
              value={formik.values?.spec?.timeout || ''}
              type="String"
              style={{ marginTop: 22 }}
              variableName="timeout"
              showRequiredField={false}
              showDefaultField={false}
              showAdvanced={true}
              onChange={value => formik.setFieldValue('spec.timeout', value)}
              isReadonly={isReadonly}
            />
          )}
        </div>
        <div className={cx(css.customArtifactContainer)}>
          <MultiTypeFieldSelector
            name="spec.scripts.fetchAllArtifacts.spec.source.spec.script"
            label={getString('common.script')}
            defaultValueToReset=""
            disabled={isReadonly}
            allowedTypes={allowableTypes}
            disableTypeSelection={isReadonly}
            skipRenderValueInExpressionLabel
            expressionRender={() => {
              return (
                <ShellScriptMonacoField
                  name="spec.scripts.fetchAllArtifacts.spec.source.spec.script"
                  scriptType={scriptType}
                  disabled={isReadonly}
                  expressions={expressions}
                />
              )
            }}
          >
            <ShellScriptMonacoField
              name="spec.scripts.fetchAllArtifacts.spec.source.spec.script"
              scriptType={scriptType}
              disabled={isReadonly}
              expressions={expressions}
            />
          </MultiTypeFieldSelector>
          {getMultiTypeFromValue(formik.values?.spec?.scripts?.fetchAllArtifacts?.spec?.source?.spec?.script) ===
            MultiTypeInputType.RUNTIME && (
            <ConfigureOptions
              value={formik.values?.spec?.scripts?.fetchAllArtifacts?.spec?.source?.spec?.script as string}
              type="String"
              style={{ marginTop: 27 }}
              variableName="spec.scripts.fetchAllArtifacts.spec.source.spec.script"
              showRequiredField={false}
              showDefaultField={false}
              showAdvanced={true}
              onChange={value => formik.setFieldValue('spec.scripts.fetchAllArtifacts.spec.source.spec.script', value)}
              isReadonly
            />
          )}
        </div>

        <div className={css.customArtifactContainer}>
          <FormInput.MultiTextInput
            name="spec.scripts.fetchAllArtifacts.artifactsArrayPath"
            label={getString('pipeline.artifactsSelection.artifactsArrayPath')}
            placeholder={getString('pipeline.artifactsSelection.artifactPathPlaceholder')}
            disabled={isReadonly}
            multiTextInputProps={{
              expressions,
              allowableTypes
            }}
          />
          {getMultiTypeFromValue(formik.values?.spec?.scripts?.fetchAllArtifacts?.artifactsArrayPath) ===
            MultiTypeInputType.RUNTIME && (
            <ConfigureOptions
              style={{ marginTop: 22 }}
              value={formik.values?.spec?.scripts?.fetchAllArtifacts?.artifactsArrayPath || ''}
              type="String"
              variableName="artifactsArrayPath"
              showRequiredField={false}
              showDefaultField={false}
              showAdvanced={true}
              onChange={value => formik.setFieldValue('spec.scripts.fetchAllArtifacts.artifactsArrayPath', value)}
              isReadonly={isReadonly}
            />
          )}
        </div>

        <div className={css.customArtifactContainer}>
          <FormInput.MultiTextInput
            name="spec.scripts.fetchAllArtifacts.versionPath"
            label={getString('pipeline.artifactsSelection.versionPath')}
            placeholder={getString('pipeline.artifactsSelection.versionPathPlaceholder')}
            disabled={isReadonly}
            multiTextInputProps={{
              expressions,
              allowableTypes
            }}
          />
          {getMultiTypeFromValue(formik.values?.spec?.scripts?.fetchAllArtifacts?.versionPath) ===
            MultiTypeInputType.RUNTIME && (
            <ConfigureOptions
              style={{ marginTop: 22 }}
              value={formik.values?.spec?.scripts?.fetchAllArtifacts?.versionPath || ''}
              type="String"
              variableName="versionPath"
              showRequiredField={false}
              showDefaultField={false}
              showAdvanced={true}
              onChange={value => formik.setFieldValue('spec.scripts.fetchAllArtifacts.versionPath', value)}
              isReadonly={isReadonly}
            />
          )}
        </div>

        <div className={css.customArtifactContainer}>
          <FormInput.MultiTextInput
            label={getString('version')}
            name="spec.version"
            placeholder={getString('pipeline.artifactsSelection.versionPlaceholder')}
            multiTextInputProps={{
              expressions,
              allowableTypes
            }}
          />

          {getMultiTypeFromValue(formik?.values?.spec?.version) === MultiTypeInputType.RUNTIME && (
            <div className={css.configureOptions}>
              <ConfigureOptions
                style={{ alignSelf: 'center' }}
                value={formik.values?.spec?.version as string}
                type={getString('string')}
                variableName="version"
                showRequiredField={false}
                showDefaultField={false}
                showAdvanced={true}
                onChange={value => {
                  formik.setFieldValue('spec.version', value)
                }}
                isReadonly={isReadonly}
              />
            </div>
          )}
        </div>
      </div>
      <Layout.Horizontal spacing="medium">
        <Button
          variation={ButtonVariation.SECONDARY}
          text={getString('back')}
          icon="chevron-left"
          onClick={() => previousStep?.(prevStepData)}
        />
        <Button variation={ButtonVariation.PRIMARY} type="submit" text={getString('next')} rightIcon="chevron-right" />
      </Layout.Horizontal>
    </FormikForm>
  )
}

export function CustomArtifact(
  props: StepProps<ConnectorConfigDTO> & ImagePathProps<CustomArtifactSource>
): React.ReactElement {
  const { context, initialValues, artifactIdentifiers, selectedArtifact, nextStep, prevStepData } = props
  const { getString } = useStrings()
  const isIdentifierAllowed = context === ModalViewFor.SIDECAR || !!props.isMultiArtifactSource

  const schemaObject = {
    spec: Yup.object().shape({
      version: Yup.string().trim().required(getString('validation.nexusVersion'))
    })
  }

  const primarySchema = Yup.object().shape(schemaObject)
  const schemaWithIdentifier = Yup.object().shape({
    ...schemaObject,
    ...ArtifactIdentifierValidation(
      artifactIdentifiers,
      initialValues?.identifier,
      getString('pipeline.uniqueIdentifier')
    )
  })
  const getInitialValues = (): CustomArtifactSource => {
    let currentValue = initialValues
    if (prevStepData?.spec) {
      currentValue = { ...prevStepData, type: 'CustomArtifact' }
    }
    return getArtifactFormData(
      currentValue || {},
      selectedArtifact as ArtifactType,
      isIdentifierAllowed
    ) as CustomArtifactSource
  }
  return (
    <Layout.Vertical spacing="medium" className={css.firstep}>
      <Text font={{ variation: FontVariation.H3 }} margin={{ bottom: 'medium' }}>
        {getString('pipeline.artifactsSelection.artifactDetails')}
      </Text>
      <Formik
        initialValues={getInitialValues()}
        formName="imagePath"
        validationSchema={isIdentifierAllowed ? schemaWithIdentifier : primarySchema}
        onSubmit={formData => {
          nextStep?.({ ...formData })
        }}
      >
        {formik => <FormContent {...props} formik={formik} />}
      </Formik>
    </Layout.Vertical>
  )
}

export function CustomArtifactOptionalConfiguration(
  props: StepProps<CustomArtifactSource> & ImagePathProps<CustomArtifactSource>
): React.ReactElement {
  const { context, handleSubmit, prevStepData, initialValues, selectedArtifact } = props
  const isIdentifierAllowed = context === ModalViewFor.SIDECAR || !!props.isMultiArtifactSource
  const { getString } = useStrings()

  const submitFormData = (formData: CustomArtifactSource): void => {
    const artifactObj: CustomArtifactSource = cloneDeep(prevStepData) || {}
    set(artifactObj, 'spec.inputs', formData?.spec?.inputs)
    set(
      artifactObj,
      'spec.scripts.fetchAllArtifacts.attributes',
      formData?.spec?.scripts?.fetchAllArtifacts?.attributes
    )
    const delegateSelectorsStrings =
      getMultiTypeFromValue(formData?.spec?.delegateSelectors) === MultiTypeInputType.FIXED
        ? (formData?.spec?.delegateSelectors as unknown as MultiSelectOption[])?.map(
            (item: MultiSelectOption) => item.value
          )
        : formData?.spec?.delegateSelectors
    set(artifactObj, 'spec.delegateSelectors', delegateSelectorsStrings)
    if (isIdentifierAllowed) {
      merge(artifactObj, { identifier: formData?.identifier })
    }
    handleSubmit(artifactObj)
  }

  const getInitialValues = (): CustomArtifactSource => {
    const initialValuesWithDelegates: CustomArtifactSource = cloneDeep(initialValues)
    if (getMultiTypeFromValue(get(initialValuesWithDelegates, `spec.delegateSelectors`)) === MultiTypeInputType.FIXED) {
      set(
        initialValuesWithDelegates,
        `spec.delegateSelectors`,
        get(initialValuesWithDelegates, `spec.delegateSelectors`)?.map((item: string) => {
          return {
            label: item,
            value: item
          }
        })
      )
    }
    return getArtifactFormData(
      initialValuesWithDelegates,
      selectedArtifact as ArtifactType,
      isIdentifierAllowed
    ) as CustomArtifactSource
  }

  return (
    <Layout.Vertical spacing="medium" className={css.firstep}>
      <Text font={{ variation: FontVariation.H3 }} margin={{ bottom: 'medium' }}>
        {getString('common.optionalConfig')}
      </Text>
      <Formik
        initialValues={getInitialValues()}
        formName="optionalConfiguration"
        onSubmit={formData => {
          submitFormData?.({ ...formData })
        }}
      >
        {formik => <OptionalConfigurationFormContent {...props} formik={formik} />}
      </Formik>
    </Layout.Vertical>
  )
}

function OptionalConfigurationFormContent(
  props: StepProps<ConnectorConfigDTO> &
    ImagePathProps<CustomArtifactSource> & { formik: FormikProps<CustomArtifactSource> }
): React.ReactElement {
  const { formik, allowableTypes, isReadonly, expressions, previousStep, prevStepData } = props
  const { accountId, projectIdentifier, orgIdentifier } =
    useParams<PipelineType<PipelinePathProps & AccountPathProps>>()
  const [delegates, setDelegates] = React.useState<MultiSelectOption[]>([])
  const queryParams = { accountId, orgId: orgIdentifier, projectId: projectIdentifier }
  const {
    data: delegatesData,
    loading,
    refetch
  } = useGetDelegateSelectorsUpTheHierarchy({
    queryParams
  })

  React.useEffect(() => {
    if (delegatesData) {
      setDelegates(
        delegatesData.resource?.map(item => {
          return {
            label: item,
            value: item
          }
        }) as any
      )
    }
  }, [delegatesData])

  // polling logic
  React.useEffect(() => {
    let id: number | null
    if (!loading) {
      id = window.setTimeout(() => refetch(), DELEGATE_POLLING_INTERVAL_IN_MS)
    }
    return () => {
      if (id) {
        window.clearTimeout(id)
      }
    }
  }, [delegatesData, loading, refetch])

  const { getString } = useStrings()

  return (
    <Form>
      <div className={css.artifactForm}>
        <div className={stepCss.formGroup}>
          <MultiTypeFieldSelector
            name="spec.inputs"
            label={getString('pipeline.scriptInputVariables')}
            isOptional
            allowedTypes={allowableTypes}
            optionalLabel={getString('common.optionalLabel')}
            defaultValueToReset={[]}
            disableTypeSelection={true}
          >
            <FieldArray
              name="spec.inputs"
              render={({ push, remove }) => {
                return (
                  <div className={css.panel}>
                    <div className={css.variables}>
                      <span className={css.label}>Name</span>
                      <span className={css.label}>Type</span>
                      <span className={css.label}>Value</span>
                    </div>
                    {formik.values?.spec?.inputs?.map(({ id }: VariableInterface, i: number) => {
                      return (
                        <div className={css.variables} key={id}>
                          <FormInput.Text
                            name={`spec.inputs.[${i}].name`}
                            placeholder={getString('name')}
                            disabled={isReadonly}
                          />
                          <FormInput.Select
                            items={scriptInputType}
                            name={`spec.inputs.[${i}].type`}
                            placeholder={getString('typeLabel')}
                            disabled={isReadonly}
                          />
                          <FormInput.MultiTextInput
                            name={`spec.inputs.[${i}].value`}
                            placeholder={getString('valueLabel')}
                            multiTextInputProps={{
                              allowableTypes,
                              expressions,
                              disabled: isReadonly
                            }}
                            label=""
                            disabled={isReadonly}
                          />
                          <Button
                            variation={ButtonVariation.ICON}
                            icon="main-trash"
                            data-testid={`remove-environmentVar-${i}`}
                            onClick={() => remove(i)}
                            disabled={isReadonly}
                          />
                        </div>
                      )
                    })}
                    <Button
                      icon="plus"
                      variation={ButtonVariation.LINK}
                      data-testid="add-environmentVar"
                      disabled={isReadonly}
                      onClick={() => push({ name: '', type: 'String', value: '' })}
                      // className={css.addButton}
                    >
                      {getString('addInputVar')}
                    </Button>
                  </div>
                )
              }}
            />
          </MultiTypeFieldSelector>
        </div>
        <div className={stepCss.formGroup}>
          <MultiTypeFieldSelector
            name="spec.scripts.fetchAllArtifacts.attributes"
            label={getString('common.additionalAttributes')}
            isOptional
            allowedTypes={allowableTypes}
            optionalLabel={getString('common.optionalLabel')}
            defaultValueToReset={[]}
            disableTypeSelection={true}
          >
            <FieldArray
              name="spec.scripts.fetchAllArtifacts.attributes"
              render={({ push, remove }) => {
                return (
                  <div className={css.panel}>
                    <div className={css.variables}>
                      <span className={css.label}>Name</span>
                      <span className={css.label}>Type</span>
                      <span className={css.label}>Value</span>
                    </div>
                    {formik.values?.spec?.scripts?.fetchAllArtifacts?.attributes?.map(
                      ({ id }: VariableInterface, i: number) => {
                        return (
                          <div className={css.variables} key={id}>
                            <FormInput.Text
                              name={`spec.scripts.fetchAllArtifacts.attributes.[${i}].name`}
                              placeholder={getString('name')}
                              disabled={isReadonly}
                            />
                            <FormInput.Select
                              items={scriptInputType}
                              name={`spec.scripts.fetchAllArtifacts.attributes.[${i}].type`}
                              placeholder={getString('typeLabel')}
                              disabled={isReadonly}
                            />
                            <FormInput.MultiTextInput
                              name={`spec.scripts.fetchAllArtifacts.attributes.[${i}].value`}
                              placeholder={getString('valueLabel')}
                              multiTextInputProps={{
                                allowableTypes,
                                expressions,
                                disabled: isReadonly
                              }}
                              label=""
                              disabled={isReadonly}
                            />
                            <Button
                              variation={ButtonVariation.ICON}
                              icon="main-trash"
                              data-testid={`remove-environmentVar-${i}`}
                              onClick={() => remove(i)}
                              disabled={isReadonly}
                            />
                          </div>
                        )
                      }
                    )}
                    <Button
                      icon="plus"
                      variation={ButtonVariation.LINK}
                      data-testid="add-environmentVar"
                      disabled={isReadonly}
                      onClick={() => push({ name: '', type: 'String', value: '' })}
                      // className={css.addButton}
                    >
                      {getString('common.addAttribute')}
                    </Button>
                  </div>
                )
              }}
            />
          </MultiTypeFieldSelector>
        </div>
        <div className={css.customArtifactContainer}>
          <FormInput.MultiSelectTypeInput
            selectItems={delegates || []}
            name="spec.delegateSelectors"
            label={getString('common.defineDelegateSelector')}
            placeholder={getString('pipeline.artifactsSelection.delegateselectionPlaceholder')}
            key="delegateSelectors"
            multiSelectTypeInputProps={{
              allowableTypes,
              expressions,
              multiSelectProps: {
                usePortal: true,
                items: delegates || [],
                allowCreatingNewItems: false
              }
            }}
          />
          {getMultiTypeFromValue(formik.values?.spec?.delegateSelectors) === MultiTypeInputType.RUNTIME && (
            <div className={css.configureOptions}>
              <ConfigureOptions
                style={{ alignSelf: 'center' }}
                value={formik.values?.spec?.delegateSelectors as string}
                type={getString('string')}
                variableName="delegateSelectors"
                showRequiredField={false}
                showDefaultField={false}
                showAdvanced={true}
                onChange={value => {
                  formik.setFieldValue('spec.delegateSelectors', value)
                }}
                isReadonly={isReadonly}
              />
            </div>
          )}
        </div>
      </div>
      <Layout.Horizontal spacing="medium">
        <Button
          variation={ButtonVariation.SECONDARY}
          text={getString('back')}
          icon="chevron-left"
          onClick={() => previousStep?.(prevStepData)}
        />
        <Button
          variation={ButtonVariation.PRIMARY}
          type="submit"
          text={getString('submit')}
          rightIcon="chevron-right"
        />
      </Layout.Horizontal>
    </Form>
  )
}
