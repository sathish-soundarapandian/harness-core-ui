/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
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
import type { Error, StepElementConfig } from 'services/cd-ng'
import type { ProjectPathProps, GitQueryParams } from '@common/interfaces/RouteInterfaces'
import { getsMergedTemplateInputYamlPromise, useGetTemplate, useGetTemplateInputSetYaml } from 'services/template-ng'
import { PageSpinner } from '@common/components'
import {
  getIdentifierFromValue,
  getScopeBasedProjectPathParams,
  getScopeFromValue
} from '@common/components/EntityReference/EntityReference'
import type { TemplateStepNode } from 'services/pipeline-ng'
import { validateStep } from '@pipeline/components/PipelineStudio/StepUtil'
import { StepForm } from '@pipeline/components/PipelineInputSetForm/StageInputSetForm'
import { getTemplateErrorMessage, replaceDefaultValues, TEMPLATE_INPUT_PATH } from '@pipeline/utils/templateUtils'
import { useQueryParams } from '@common/hooks'
import { parse, stringify } from '@common/utils/YamlHelperMethods'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { getGitQueryParamsWithParentScope } from '@common/utils/gitSyncUtils'
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
  customStepProps: unknown
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
      ...getGitQueryParamsWithParentScope(storeMetadata, queryParams, repoIdentifier, branch)
    }
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
      ...getGitQueryParamsWithParentScope(storeMetadata, queryParams, repoIdentifier, branch)
    }
  })

  const updateFormValues = (newTemplateInputs?: StepElementConfig) => {
    const updateValues = produce(initialValues, draft => {
      set(
        draft,
        'template.templateInputs',
        !isEmpty(newTemplateInputs) ? replaceDefaultValues(newTemplateInputs) : undefined
      )
    })
    setFormValues(updateValues)
    onUpdate?.(updateValues)
  }

  const retainInputsAndUpdateFormValues = (newTemplateInputs?: StepElementConfig) => {
    if (isEmpty(newTemplateInputs)) {
      updateFormValues(newTemplateInputs)
    } else {
      setLoadingMergedTemplateInputs(true)
      try {
        getsMergedTemplateInputYamlPromise({
          body: {
            oldTemplateInputs: stringify(defaultTo(initialValues.template?.templateInputs, '')),
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
  }

  React.useEffect(() => {
    if (stepTemplateInputSetLoading) {
      setTemplateInputs(undefined)
      setAllValues(undefined)
    } else {
      const newTemplateInputs = parse<StepElementConfig>(defaultTo(stepTemplateInputSetYaml?.data, ''))
      setTemplateInputs(newTemplateInputs)
      retainInputsAndUpdateFormValues(newTemplateInputs)
    }
  }, [stepTemplateInputSetLoading])

  const validateForm = (values: TemplateStepNode) => {
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

  const refetch = () => {
    refetchStepTemplate()
    refetchStepTemplateInputSet()
  }

  const isLoading = stepTemplateLoading || stepTemplateInputSetLoading || loadingMergedTemplateInputs

  const error = defaultTo(stepTemplateInputSetError, stepTemplateError)

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
        onSubmit={values => {
          onUpdate?.(values)
        }}
        initialValues={formValues}
        formName="templateStepWidget"
        validationSchema={Yup.object().shape({
          name: NameSchema({ requiredErrorMsg: getString('pipelineSteps.stepNameRequired') }),
          identifier: IdentifierSchema()
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
                    <StepForm
                      template={{ step: templateInputs }}
                      values={{ step: formik.values.template?.templateInputs as StepElementConfig }}
                      allValues={{ step: allValues }}
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
                        stageIdentifier: selectedStage?.identifier
                      }}
                    />
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
