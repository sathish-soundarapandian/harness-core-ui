/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
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
  SelectOption,
  FormikForm,
  Accordion,
  ThumbnailSelect
} from '@harness/uicore'
import { FieldArray } from 'formik'
import * as Yup from 'yup'
import { FontVariation } from '@harness/design-system'
import { useParams } from 'react-router-dom'
import { cloneDeep, defaultTo, get, memoize, merge, omit, set } from 'lodash-es'
import cx from 'classnames'
import { Menu } from '@blueprintjs/core'
import { useStrings } from 'framework/strings'
import type {
  ArtifactType,
  ImagePathProps,
  CustomArtifactSource,
  VariableInterface
} from '@pipeline/components/ArtifactsSelection/ArtifactInterface'
import { BuildDetails, ConnectorConfigDTO, useGetJobDetailsForCustom } from 'services/cd-ng'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import {
  customArtifactDefaultSpec,
  formFillingMethod,
  getArtifactFormData,
  isFieldFixedAndNonEmpty,
  helperTextData,
  shellScriptType
} from '@pipeline/components/ArtifactsSelection/ArtifactUtils'
import { FormMultiTypeDurationField } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import MultiTypeFieldSelector from '@common/components/MultiTypeFieldSelector/MultiTypeFieldSelector'
import { ScriptType, ShellScriptMonacoField } from '@common/components/ShellScriptMonaco/ShellScriptMonaco'
import type {
  AccountPathProps,
  GitQueryParams,
  PipelinePathProps,
  PipelineType
} from '@common/interfaces/RouteInterfaces'
import { useGetDelegateSelectorsUpTheHierarchy } from 'services/portal'
import type { DelegateCardInterface } from '@connectors/pages/connectors/utils/ConnectorUtils'
import { getGenuineValue } from '@pipeline/components/PipelineSteps/Steps/JiraApproval/helper'
import { getHelpeTextForTags } from '@pipeline/utils/stageHelpers'
import { EXPRESSION_STRING } from '@pipeline/utils/constants'
import { useMutateAsGet, useQueryParams } from '@common/hooks'
import { ArtifactIdentifierValidation, ModalViewFor } from '../../../ArtifactHelper'
import { ArtifactSourceIdentifier, SideCarArtifactIdentifier } from '../ArtifactIdentifier'
import { NoTagResults } from '../ArtifactImagePathTagView/ArtifactImagePathTagView'
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
  selectedArtifact,
  isMultiArtifactSource,
  formClassName
}: any): React.ReactElement {
  const { getString } = useStrings()
  const isTemplateContext = context === ModalViewFor.Template
  const [delegates, setDelegates] = React.useState<SelectOption[]>([])
  const { accountId, projectIdentifier, orgIdentifier } =
    useParams<PipelineType<PipelinePathProps & AccountPathProps>>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const queryParams = { accountId, orgId: orgIdentifier, projectId: projectIdentifier }
  const commonParams = {
    accountIdentifier: accountId,
    projectIdentifier,
    orgIdentifier,
    repoIdentifier,
    branch
  }
  const {
    data: delegatesData,
    loading,
    refetch
  } = useGetDelegateSelectorsUpTheHierarchy({
    queryParams
  })
  const ValueFillCards: DelegateCardInterface[] = [
    {
      type: formFillingMethod.MANUAL,
      info: getString('pipeline.artifactsSelection.customArtifactManualFill')
    },
    {
      type: formFillingMethod.SCRIPT,
      info: getString('pipeline.artifactsSelection.customArtifactScriptFill')
    }
  ]

  const versionPathValue = getGenuineValue(get(formik, `values.spec.scripts.fetchAllArtifacts.versionPath`))
  const scriptValue = get(formik, `values.spec.scripts.fetchAllArtifacts.spec.source.spec.script`)
  const inputValue = get(formik, `values.spec.inputs`)

  const artifactArrayPathValue = getGenuineValue(
    get(formik, `values.spec.scripts.fetchAllArtifacts.artifactsArrayPath`)
  )

  const {
    data: buildDetails,
    refetch: refetchBuildDetails,
    loading: fetchingBuilds,
    error
  } = useMutateAsGet(useGetJobDetailsForCustom, {
    lazy: true,
    body: {
      script: scriptValue,
      inputs: inputValue
    },
    queryParams: {
      ...commonParams,
      versionPath: versionPathValue || '',
      arrayPath: artifactArrayPathValue || ''
    }
  })

  const selectItems = useMemo(() => {
    return buildDetails?.data?.map((builds: BuildDetails) => ({
      value: defaultTo(builds.number, ''),
      label: defaultTo(builds.number, '')
    }))
  }, [buildDetails?.data])

  const getBuilds = (): { label: string; value: string }[] => {
    if (fetchingBuilds) {
      return [{ label: 'Loading Builds...', value: 'Loading Builds...' }]
    }
    return defaultTo(selectItems, [])
  }

  const itemRenderer = memoize((item: { label: string }, { handleClick }) => (
    <div key={item.label.toString()}>
      <Menu.Item
        text={
          <Layout.Horizontal spacing="small">
            <Text>{item.label}</Text>
          </Layout.Horizontal>
        }
        disabled={fetchingBuilds}
        onClick={handleClick}
      />
    </div>
  ))

  const isAllFieldsAreFixed = (): boolean => {
    return isFieldFixedAndNonEmpty(versionPathValue || '') && isFieldFixedAndNonEmpty(artifactArrayPathValue || '')
  }

  React.useEffect(() => {
    if (delegatesData) {
      setDelegates(
        delegatesData.resource?.map(item => {
          return {
            label: item,
            value: item
          }
        }) as SelectOption[]
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

  const scriptType: ScriptType =
    formik.values?.spec?.scripts?.fetchAllArtifacts?.spec?.shell || (getString('common.bash') as ScriptType)

  return (
    <FormikForm>
      <div className={cx(css.artifactForm, formClassName)}>
        {isMultiArtifactSource && context === ModalViewFor.PRIMARY && <ArtifactSourceIdentifier />}
        {context === ModalViewFor.SIDECAR && <SideCarArtifactIdentifier />}
        <ThumbnailSelect
          items={ValueFillCards.map(card => ({ label: card.info, value: card.type }))}
          name="formType"
          size="large"
          onChange={type => {
            const restSpec = type === formFillingMethod.SCRIPT ? customArtifactDefaultSpec : {}
            formik.setValues({
              ...formik.values,
              formType: type,
              spec: { version: formik.values?.version, ...restSpec }
            })
          }}
        />
        {formik.values?.formType === formFillingMethod.MANUAL ? (
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
        ) : formik.values?.formType === formFillingMethod.SCRIPT ? (
          <>
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
            <div className={css.customArtifactContainer}>
              <FormInput.Select
                name="spec.scripts.fetchAllArtifacts.spec.shell"
                label={getString('common.scriptType')}
                items={shellScriptType}
                disabled
              />
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
                      className={css.expanded}
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
                  className={'expanded'}
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
                  onChange={value =>
                    formik.setFieldValue('spec.scripts.fetchAllArtifacts.spec.source.spec.script', value)
                  }
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
              <FormInput.MultiTypeInput
                selectItems={getBuilds()}
                label={getString('version')}
                name="spec.version"
                placeholder={getString('pipeline.artifactsSelection.versionPlaceholder')}
                useValue
                helperText={
                  getMultiTypeFromValue(formik.values.spec.version) === MultiTypeInputType.FIXED &&
                  getHelpeTextForTags(
                    helperTextData(selectedArtifact as ArtifactType, formik, 'test'),
                    getString,
                    false
                  )
                }
                multiTypeInputProps={{
                  expressions,
                  allowableTypes,
                  selectProps: {
                    noResults: (
                      <NoTagResults
                        tagError={error}
                        isServerlessDeploymentTypeSelected={false}
                        defaultErrorText={getString('pipeline.artifactsSelection.validation.noBuild')}
                      />
                    ),
                    itemRenderer: itemRenderer,
                    items: getBuilds(),
                    allowCreatingNewItems: true
                  },
                  onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
                    if (
                      e?.target?.type !== 'text' ||
                      (e?.target?.type === 'text' && e?.target?.placeholder === EXPRESSION_STRING)
                    ) {
                      return
                    }
                    if (isAllFieldsAreFixed()) {
                      refetchBuildDetails()
                    }
                  }
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
            <Accordion className={stepCss.accordion}>
              <Accordion.Panel
                id="advanced"
                summary={getString('advancedTitle')}
                details={
                  <>
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
                  </>
                }
              />
            </Accordion>
          </>
        ) : null}
      </div>
      {!isTemplateContext && (
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
      )}
    </FormikForm>
  )
}

export function CustomArtifact(
  props: StepProps<ConnectorConfigDTO> & ImagePathProps<CustomArtifactSource>
): React.ReactElement {
  const { context, initialValues, artifactIdentifiers, selectedArtifact, handleSubmit, prevStepData } = props
  const { getString } = useStrings()
  const isIdentifierAllowed = context === ModalViewFor.SIDECAR || !!props.isMultiArtifactSource
  const isTemplateContext = context === ModalViewFor.Template

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
    let currentValue = cloneDeep(initialValues)
    if (prevStepData?.spec) {
      currentValue = { ...prevStepData, type: 'CustomArtifact' }
    }
    if (
      currentValue?.spec &&
      getMultiTypeFromValue(currentValue?.spec?.delegateSelectors) === MultiTypeInputType.FIXED
    ) {
      currentValue.spec.delegateSelectors = (currentValue.spec?.delegateSelectors as string[])?.map(
        item =>
          ({
            label: item,
            value: item
          } as SelectOption)
      ) as SelectOption[]
    }
    if (currentValue?.spec?.scripts) {
      currentValue.formType = formFillingMethod.SCRIPT
    } else if (currentValue?.spec?.version && currentValue.spec?.version?.length > 0) {
      currentValue.formType = formFillingMethod.MANUAL
    }
    return getArtifactFormData(
      currentValue || {},
      selectedArtifact as ArtifactType,
      isIdentifierAllowed
    ) as CustomArtifactSource
  }

  const submitFormData = (formData: CustomArtifactSource): void => {
    const delegateSelectorsStrings =
      getMultiTypeFromValue(formData?.spec?.delegateSelectors) === MultiTypeInputType.FIXED
        ? (formData?.spec?.delegateSelectors as SelectOption[])?.map((item: SelectOption) => item.value)
        : formData?.spec?.delegateSelectors
    set(formData, 'spec.delegateSelectors', delegateSelectorsStrings)
    if (isIdentifierAllowed) {
      merge(formData, { identifier: formData?.identifier })
    }
    let filteredFormData = omit(formData, ['formType'])
    if (formData.formType === formFillingMethod.MANUAL) {
      filteredFormData = { ...filteredFormData, spec: { version: formData.spec?.version || '' } }
    }
    handleSubmit(filteredFormData)
  }

  return (
    <Layout.Vertical spacing="medium" className={css.firstep}>
      {!isTemplateContext && (
        <Text font={{ variation: FontVariation.H3 }} margin={{ bottom: 'medium' }}>
          {getString('pipeline.artifactsSelection.artifactDetails')}
        </Text>
      )}
      <Formik
        initialValues={getInitialValues()}
        formName="imagePath"
        validationSchema={isIdentifierAllowed ? schemaWithIdentifier : primarySchema}
        onSubmit={(formData, formikhelper) => {
          let hasError = false
          if (formData?.formType === formFillingMethod.SCRIPT) {
            if (!formData?.spec?.scripts?.fetchAllArtifacts?.spec?.source?.spec?.script) {
              formikhelper.setFieldError(
                'spec.scripts.fetchAllArtifacts.spec.source.spec.script',
                getString('pipeline.artifactsSelection.validation.script')
              )
              hasError = true
            }
            if (!formData?.spec?.scripts?.fetchAllArtifacts?.artifactsArrayPath) {
              formikhelper.setFieldError(
                'spec.scripts.fetchAllArtifacts.artifactsArrayPath',
                getString('pipeline.artifactsSelection.validation.artifactsArrayPath')
              )
              hasError = true
            }
            if (!formData?.spec?.scripts?.fetchAllArtifacts?.versionPath) {
              formikhelper.setFieldError(
                'spec.scripts.fetchAllArtifacts.versionPath',
                getString('pipeline.artifactsSelection.validation.versionPath')
              )
              hasError = true
            }
          }
          if (!hasError) submitFormData?.({ ...formData })
        }}
      >
        {formik => {
          return <FormContent {...props} formik={formik} />
        }}
      </Formik>
    </Layout.Vertical>
  )
}
