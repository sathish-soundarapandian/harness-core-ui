/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useEffect, useRef } from 'react'
import { Container, Formik, FormikForm, FormInput, Layout, AllowedTypes, Heading, PageError } from '@harness/uicore'
import * as Yup from 'yup'
import { Color } from '@harness/design-system'
import cx from 'classnames'
import type { FormikProps } from 'formik'
import { useParams } from 'react-router-dom'
import { defaultTo, get, isEmpty, noop, set } from 'lodash-es'
import { produce } from 'immer'
import { IdentifierSchema, NameSchema } from '@common/utils/Validation'
import { setFormikRef, StepViewType, StepFormikFowardRef } from '@pipeline/components/AbstractSteps/Step'
import { useStrings } from 'framework/strings'
import type { AbstractStepFactory } from '@pipeline/components/AbstractSteps/AbstractStepFactory'
import type { Error, ExecutionWrapperConfig, StepElementConfig, StepGroupElementConfig } from 'services/cd-ng'
import type { ProjectPathProps, GitQueryParams } from '@common/interfaces/RouteInterfaces'
import { getsMergedTemplateInputYamlPromise, useGetTemplate, useGetTemplateInputSetYaml } from 'services/template-ng'
import { PageSpinner } from '@common/components'
import {
  getIdentifierFromValue,
  getScopeBasedProjectPathParams,
  getScopeFromValue
} from '@common/components/EntityReference/EntityReference'
import MultiTypeDelegateSelector from '@common/components/MultiTypeDelegateSelector/MultiTypeDelegateSelector'
import type { StageElementConfig, TemplateStepNode } from 'services/pipeline-ng'
import { validateStep, validateSteps } from '@pipeline/components/PipelineStudio/StepUtil'
import { getTemplateErrorMessage, TEMPLATE_INPUT_PATH } from '@pipeline/utils/templateUtils'
import { useQueryParams } from '@common/hooks'
import { parse, stringify } from '@common/utils/YamlHelperMethods'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { getGitQueryParamsWithParentScope } from '@common/utils/gitSyncUtils'
import { StepForm } from '@pipeline/components/PipelineInputSetForm/StepInputSetForm'
import { ExecutionWrapperInputSetForm } from '@pipeline/components/PipelineInputSetForm/ExecutionWrapperInputSetForm'
import type { StageType } from '@pipeline/utils/stageHelpers'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
import css from './TemplateStepWidget.module.scss'

export interface TemplateStepWidgetProps {
  initialValues: TemplateStepNode
  isNewStep?: boolean
  isDisabled?: boolean
  onUpdate?: (data: TemplateStepNode) => void
  stepViewType?: StepViewType
  readonly?: boolean
  factory: AbstractStepFactory
  allowableTypes: AllowedTypes
  customStepProps?: {
    stageIdentifier: string
    stageType?: StageType
    selectedStage?: StageElementConfig
  }
}

function TemplateStepWidget(
  props: TemplateStepWidgetProps,
  formikRef: StepFormikFowardRef<TemplateStepNode>
): React.ReactElement {
  const {
    state: { storeMetadata },
    setIntermittentLoading
  } = usePipelineContext()
  const { initialValues, onUpdate, isNewStep, readonly, allowableTypes, customStepProps } = props
  const { getString } = useStrings()
  const queryParams = useParams<ProjectPathProps>()
  const { branch, repoIdentifier } = useQueryParams<GitQueryParams>()
  const stepTemplateRef = getIdentifierFromValue(initialValues.template.templateRef)
  const stepTemplateVersionLabel = defaultTo(initialValues.template.versionLabel, '')
  const scope = getScopeFromValue(initialValues.template.templateRef)
  const [loadingMergedTemplateInputs, setLoadingMergedTemplateInputs] = React.useState<boolean>(false)
  const [formValues, setFormValues] = React.useState<TemplateStepNode>(initialValues)
  const [allValues, setAllValues] = React.useState<StepElementConfig>()
  const [templateInputs, setTemplateInputs] = React.useState<StepElementConfig>()
  const selectedStage = (customStepProps as any)?.selectedStage

  const { orgIdentifier, projectIdentifier } = queryParams

  const {
    data: stepTemplateResponse,
    error: stepTemplateError,
    refetch: refetchStepTemplate,
    loading: stepTemplateLoading
  } = useGetTemplate({
    templateIdentifier: stepTemplateRef,
    queryParams: {
      ...getScopeBasedProjectPathParams(queryParams, scope),
      versionLabel: stepTemplateVersionLabel,
      ...getGitQueryParamsWithParentScope({ storeMetadata, params: queryParams, repoIdentifier, branch })
    },
    requestOptions: { headers: { 'Load-From-Cache': 'true' } }
  })

  React.useEffect(() => {
    setAllValues(
      parse<{ template: { spec: StepElementConfig } }>(defaultTo(stepTemplateResponse?.data?.yaml, ''))?.template.spec
    )
  }, [stepTemplateResponse?.data?.yaml])

  const {
    data: stepTemplateInputSetYaml,
    error: stepTemplateInputSetError,
    refetch: refetchStepTemplateInputSet,
    loading: stepTemplateInputSetLoading
  } = useGetTemplateInputSetYaml({
    templateIdentifier: stepTemplateRef,
    queryParams: {
      ...getScopeBasedProjectPathParams(queryParams, scope),
      versionLabel: stepTemplateVersionLabel,
      ...getGitQueryParamsWithParentScope({ storeMetadata, params: queryParams, repoIdentifier, branch })
    },
    requestOptions: { headers: { 'Load-From-Cache': 'true' } }
  })

  const onUpdateRef = useRef(onUpdate)
  useEffect(() => {
    onUpdateRef.current = onUpdate
  }, [onUpdate])

  const initialValuesRef = useRef(initialValues)
  useEffect(() => {
    initialValuesRef.current = initialValues
  }, [initialValues])

  const updateFormValues = useCallback((newTemplateInputs?: StepElementConfig): void => {
    const updateValues = produce(initialValuesRef.current, draft => {
      set(draft, 'template.templateInputs', !isEmpty(newTemplateInputs) ? newTemplateInputs : undefined)
    })
    setFormValues(updateValues)
    onUpdateRef.current?.(updateValues)
  }, [])

  const retainInputsAndUpdateFormValues = useCallback(
    (newTemplateInputs?: StepElementConfig): void => {
      if (isEmpty(newTemplateInputs)) {
        updateFormValues(newTemplateInputs)
      } else {
        setLoadingMergedTemplateInputs(true)
        try {
          getsMergedTemplateInputYamlPromise({
            body: {
              oldTemplateInputs: stringify(defaultTo(initialValuesRef.current.template?.templateInputs, '')),
              newTemplateInputs: stringify(newTemplateInputs)
            },
            queryParams: {
              accountIdentifier: queryParams.accountId
            }
          }).then(response => {
            if (response && response.status === 'SUCCESS') {
              setLoadingMergedTemplateInputs(false)
              updateFormValues(parse<StepElementConfig>(defaultTo(response.data?.mergedTemplateInputs, '')))
            } else {
              throw response
            }
          })
        } catch (error) {
          setLoadingMergedTemplateInputs(false)
          updateFormValues(newTemplateInputs)
        }
      }
    },
    [queryParams.accountId, updateFormValues]
  )

  React.useEffect(() => {
    if (stepTemplateInputSetLoading) {
      setTemplateInputs(undefined)
      setAllValues(undefined)
    } else {
      const newTemplateInputs = parse<StepElementConfig>(defaultTo(stepTemplateInputSetYaml?.data, ''))
      setTemplateInputs(newTemplateInputs)
      retainInputsAndUpdateFormValues(newTemplateInputs)
    }
  }, [retainInputsAndUpdateFormValues, stepTemplateInputSetLoading, stepTemplateInputSetYaml?.data])

  const validateForm = (values: TemplateStepNode) => {
    if (!isEmpty((templateInputs as StepGroupElementConfig)?.steps)) {
      const errorsResponse = validateSteps({
        steps: values.template?.templateInputs?.steps as ExecutionWrapperConfig[],
        template: (templateInputs as StepGroupElementConfig)?.steps as ExecutionWrapperConfig[],
        originalSteps: initialValues?.template?.templateInputs?.steps as ExecutionWrapperConfig[],
        getString,
        viewType: StepViewType.DeploymentForm
      })
      if (!isEmpty(errorsResponse)) {
        return set({}, `${TEMPLATE_INPUT_PATH}.steps`, get(errorsResponse, 'steps'))
      } else {
        return errorsResponse
      }
    } else {
      const errorsResponse = validateStep({
        step: values.template?.templateInputs as StepElementConfig,
        template: templateInputs,
        originalStep: { step: initialValues?.template?.templateInputs as StepElementConfig },
        getString,
        viewType: StepViewType.DeploymentForm
      })
      if (!isEmpty(errorsResponse)) {
        return set({}, TEMPLATE_INPUT_PATH, get(errorsResponse, 'step'))
      } else {
        return errorsResponse
      }
    }
  }

  const refetch = (): void => {
    refetchStepTemplate()
    refetchStepTemplateInputSet()
  }

  const isLoading = stepTemplateLoading || stepTemplateInputSetLoading || loadingMergedTemplateInputs

  // When both errors are present, error occurred during template fetch should be given higher priority.
  const error = defaultTo(stepTemplateError, stepTemplateInputSetError)

  /**
   * This effect disables/enables "Apply Changes" button on Pipeline and Template Studio
   */
  React.useEffect(() => {
    setIntermittentLoading(isLoading)

    // cleanup
    return () => {
      setIntermittentLoading(false)
    }
  }, [isLoading, setIntermittentLoading])

  return (
    <div className={stepCss.stepPanel}>
      <Formik<TemplateStepNode>
        onSubmit={noop}
        initialValues={formValues}
        formName="templateStepWidget"
        validationSchema={Yup.object().shape({
          name: NameSchema(getString, { requiredErrorMsg: getString('pipelineSteps.stepNameRequired') }),
          identifier: IdentifierSchema(getString)
        })}
        validate={validateForm}
        enableReinitialize={true}
      >
        {(formik: FormikProps<TemplateStepNode>) => {
          setFormikRef(formikRef, formik)
          return (
            <FormikForm>
              <div className={cx(stepCss.formGroup, stepCss.md)}>
                <FormInput.InputWithIdentifier
                  isIdentifierEditable={isNewStep && !readonly}
                  inputLabel={getString('name')}
                  inputGroupProps={{ disabled: readonly }}
                />
              </div>
              <Container className={css.inputsContainer}>
                {isLoading && <PageSpinner />}
                {!isLoading && error && (
                  <Container height={isEmpty((error?.data as Error)?.responseMessages) ? 300 : 600}>
                    <PageError message={getTemplateErrorMessage(error, css.errorHandler)} onClick={() => refetch()} />
                  </Container>
                )}
                {!isLoading && !error && templateInputs && allValues && (
                  <Layout.Vertical padding={{ top: 'large', bottom: 'large' }} spacing={'large'}>
                    <Heading level={5} color={Color.BLACK}>
                      {getString('pipeline.templateInputs')}
                    </Heading>
                    {!isEmpty((templateInputs as StepGroupElementConfig)?.delegateSelectors) ? (
                      <MultiTypeDelegateSelector
                        name={`${TEMPLATE_INPUT_PATH}.delegateSelectors`}
                        inputProps={{ readonly, orgIdentifier, projectIdentifier }}
                        allowableTypes={allowableTypes}
                      />
                    ) : null}
                    {!isEmpty((templateInputs as StepGroupElementConfig)?.steps) ? (
                      <>
                        <ExecutionWrapperInputSetForm
                          stepsTemplate={(templateInputs as StepGroupElementConfig)?.steps as ExecutionWrapperConfig[]}
                          formik={formik}
                          path={`${TEMPLATE_INPUT_PATH}.steps`}
                          allowableTypes={allowableTypes}
                          values={formik.values.template?.templateInputs?.steps}
                          allValues={formik.values.template?.templateInputs?.steps}
                          viewType={StepViewType.TemplateUsage}
                          customStepProps={{
                            stageType: customStepProps?.stageType,
                            stageIdentifier: selectedStage?.identifier
                          }}
                        />
                      </>
                    ) : (
                      <StepForm
                        template={{ step: templateInputs as StepElementConfig }}
                        values={{ step: formik.values.template?.templateInputs as StepElementConfig }}
                        allValues={{ step: allValues as StepElementConfig }}
                        readonly={readonly}
                        viewType={StepViewType.TemplateUsage}
                        path={TEMPLATE_INPUT_PATH}
                        allowableTypes={allowableTypes}
                        onUpdate={noop}
                        hideTitle={true}
                        customStepProps={{
                          // This is done because when StepForm used in normal steps, data structure is different
                          // While here data structure is diff
                          // This data is required in ECSBlueGreenCreateServiceStepInputSet component
                          // where we need to find out Cluster/Region or envRef/infraRef
                          selectedStage: selectedStage?.stage?.spec,
                          stageType: customStepProps?.stageType,
                          stageIdentifier: selectedStage?.identifier
                        }}
                      />
                    )}
                  </Layout.Vertical>
                )}
              </Container>
            </FormikForm>
          )
        }}
      </Formik>
    </div>
  )
}

export const TemplateStepWidgetWithRef = React.forwardRef(TemplateStepWidget)
