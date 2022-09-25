/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import {
  Container,
  Formik,
  FormikForm,
  FormInput,
  Layout,
  AllowedTypes,
  Heading,
  PageError
} from '@wings-software/uicore'
import * as Yup from 'yup'
import { Color } from '@harness/design-system'
import cx from 'classnames'
import type { FormikProps } from 'formik'
import { useParams } from 'react-router-dom'
import { defaultTo, get, isEmpty, noop, omit, set } from 'lodash-es'
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
import type { TemplateLinkConfig, TemplateStepNode } from 'services/pipeline-ng'
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
}

function TemplateStepWidget(
  props: TemplateStepWidgetProps,
  formikRef: StepFormikFowardRef<TemplateStepNode>
): React.ReactElement {
  const {
    state: { storeMetadata },
    setIntermittentLoading
  } = usePipelineContext()
  const { initialValues, onUpdate, isNewStep, readonly, allowableTypes } = props
  const { getString } = useStrings()
  const queryParams = useParams<ProjectPathProps>()
  const { branch, repoIdentifier } = useQueryParams<GitQueryParams>()
  const stepTemplateRef = getIdentifierFromValue(initialValues.template.templateRef)
  const stepTemplateVersionLabel = defaultTo(initialValues.template.versionLabel, '')
  const scope = getScopeFromValue(initialValues.template.templateRef)
  const [loadingMergedTemplateInputs, setLoadingMergedTemplateInputs] = React.useState<boolean>(false)
  const [formValues, setFormValues] = React.useState<TemplateStepNode>({
    name: initialValues.name,
    identifier: initialValues.identifier
  } as TemplateStepNode)
  const [allValues, setAllValues] = React.useState<StepElementConfig>()
  const [allTemplateInputs, setAllTemplateInputs] =
    React.useState<{ template: Omit<TemplateLinkConfig, 'templateRef'> }>()

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

  const updateFormValues = (newTemplateInputs?: Omit<TemplateLinkConfig, 'templateRef'>) => {
    const updateValues = produce(initialValues, draft => {
      set(
        draft,
        'template.templateInputs',
        !isEmpty(newTemplateInputs?.templateInputs)
          ? replaceDefaultValues(newTemplateInputs?.templateInputs)
          : undefined
      )
      set(
        draft,
        'template.variables',
        !isEmpty(newTemplateInputs?.variables) ? replaceDefaultValues(newTemplateInputs?.variables) : undefined
      )
    })
    setFormValues(updateValues)
    onUpdate?.(updateValues)
  }

  const retainInputsAndUpdateFormValues = (newAllTemplateInputs?: {
    template: Omit<TemplateLinkConfig, 'templateRef'>
  }) => {
    if (isEmpty(newAllTemplateInputs?.template)) {
      updateFormValues(newAllTemplateInputs?.template)
    } else {
      setLoadingMergedTemplateInputs(true)
      try {
        getsMergedTemplateInputYamlPromise({
          body: {
            oldTemplateInputs: stringify(omit(initialValues.template, 'templateRef', 'versionLabel')),
            newTemplateInputs: stringify(newAllTemplateInputs?.template)
          },
          queryParams: {
            accountIdentifier: queryParams.accountId
          }
        }).then(response => {
          if (response && response.status === 'SUCCESS') {
            setLoadingMergedTemplateInputs(false)
            updateFormValues(
              parse<Omit<TemplateLinkConfig, 'templateRef'>>(defaultTo(response.data?.mergedTemplateInputs, ''))
            )
          } else {
            throw response
          }
        })
      } catch (error) {
        setLoadingMergedTemplateInputs(false)
        updateFormValues(newAllTemplateInputs?.template)
      }
    }
  }

  React.useEffect(() => {
    if (stepTemplateInputSetLoading) {
      setAllTemplateInputs(undefined)
      setAllValues(undefined)
    } else {
      const newAllTemplateInputs = {
        template: parse<Omit<TemplateLinkConfig, 'templateRef'>>(defaultTo(stepTemplateInputSetYaml?.data, ''))
      }
      setAllTemplateInputs(newAllTemplateInputs)
      retainInputsAndUpdateFormValues(newAllTemplateInputs)
    }
  }, [stepTemplateInputSetLoading])

  const validateForm = (values: TemplateStepNode) => {
    const errorsResponse = validateStep({
      step: values.template?.templateInputs as StepElementConfig,
      template: allTemplateInputs?.template.templateInputs as StepElementConfig,
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
        initialValues={defaultTo(formValues, { name: '', identifier: '' } as TemplateStepNode)}
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
                {!isLoading && !error && allTemplateInputs && allValues && formik.values.template && (
                  <Layout.Vertical padding={{ top: 'large', bottom: 'large' }} spacing={'large'}>
                    <Heading level={5} color={Color.BLACK}>
                      {getString('pipeline.templateInputs')}
                    </Heading>
                    <StepForm
                      template={{ step: allTemplateInputs as unknown as StepElementConfig }}
                      values={{ step: formik.values as unknown as StepElementConfig }}
                      allValues={{ step: allValues as unknown as StepElementConfig }}
                      readonly={readonly}
                      viewType={StepViewType.TemplateUsage}
                      path={''}
                      allowableTypes={allowableTypes}
                      onUpdate={noop}
                      hideTitle={true}
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
