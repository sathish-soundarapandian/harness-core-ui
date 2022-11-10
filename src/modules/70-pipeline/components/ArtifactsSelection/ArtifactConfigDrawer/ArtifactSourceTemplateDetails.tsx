/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import {
  Container,
  Layout,
  AllowedTypes,
  Formik,
  FormikForm,
  FormInput,
  PageError,
  Heading
} from '@wings-software/uicore'
import cx from 'classnames'
import type { FormikProps } from 'formik'
import * as Yup from 'yup'
import { useParams } from 'react-router-dom'
import { produce } from 'immer'
import { defaultTo, isEmpty, noop, set, get } from 'lodash-es'
import { Color } from '@wings-software/design-system'
import { useStrings } from 'framework/strings'
import { parse, stringify } from '@common/utils/YamlHelperMethods'
import type { PipelineStep } from '@pipeline/components/PipelineSteps/PipelineStep'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import type { TemplateStepNode, EntityGitDetails } from 'services/pipeline-ng'
import { TemplateBar } from '@pipeline/components/PipelineStudio/TemplateBar/TemplateBar'
import type { Values } from '@pipeline/components/PipelineStudio/StepCommands/StepCommandTypes'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import type { TemplateSummaryResponse } from 'services/template-ng'
import type { AbstractStepFactory } from '@pipeline/components/AbstractSteps/AbstractStepFactory'
import type { StageElementWrapper } from '@pipeline/utils/pipelineTypes'
import { NameSchema } from '@common/utils/Validation'
import { setFormikRef, StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { PageSpinner } from '@common/components'
import type { Error, StepElementConfig, StageElementConfig, ArtifactConfig } from 'services/cd-ng'
import { getTemplateErrorMessage, replaceDefaultValues } from '@pipeline/utils/templateUtils'
// eslint-disable-next-line no-restricted-imports
import artifactSourceBaseFactory from '@cd/factory/ArtifactSourceFactory/ArtifactSourceBaseFactory'
import { getsMergedTemplateInputYamlPromise, useGetTemplate, useGetTemplateInputSetYaml } from 'services/template-ng'
import { getScopeBasedProjectPathParams, getScopeFromValue } from '@common/components/EntityReference/EntityReference'
import { getGitQueryParamsWithParentScope } from '@common/utils/gitSyncUtils'
import type { GitQueryParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useQueryParams } from '@common/hooks'
import type { StoreMetadata } from '@common/constants/GitSyncTypes'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
import css from './ArtifactConfigDrawer.module.scss'

export type ArtifactSourceTemplateDetailsFormikRef<T = unknown> = {
  isDirty(): FormikProps<T>['dirty'] | undefined
  submitForm: FormikProps<T>['submitForm']
  getErrors(): FormikProps<T>['errors']
  setFieldError(key: string, error: string): void
  getValues(): T
  resetForm: FormikProps<T>['resetForm']
}

export type ArtifactSourceTemplateDetailsRef<T = unknown> =
  | ((instance: ArtifactSourceTemplateDetailsFormikRef<T> | null) => void)
  | React.MutableRefObject<ArtifactSourceTemplateDetailsFormikRef<T> | null>
  | null

interface ArtifactSourceTemplateDetails {
  artifactSourceConfigNode: TemplateStepNode
  onChange?: (step: Partial<Values>) => void
  onUpdate: (step: Partial<Values>) => void
  onUseTemplate?: (selectedTemplate: TemplateSummaryResponse) => void
  onRemoveTemplate?: () => Promise<void>
  stepsFactory: AbstractStepFactory
  isReadonly: boolean
  isNewStep?: boolean
  selectedStage?: StageElementWrapper<StageElementConfig>
  stepViewType?: StepViewType
  className?: string
  allowableTypes: AllowedTypes
  gitDetails?: EntityGitDetails
  storeMetadata?: StoreMetadata
}

const getFormValues = (artifactSourceConfigNode: TemplateStepNode) => {
  const templateInputs = artifactSourceConfigNode?.template?.templateInputs
  return produce(artifactSourceConfigNode, draft => {
    set(draft, 'template.templateInputs', { artifacts: { primary: templateInputs } })
  })
}

export function ArtifactSourceTemplateDetails(
  props: ArtifactSourceTemplateDetails,
  ref: ArtifactSourceTemplateDetailsRef
): React.ReactElement {
  const {
    artifactSourceConfigNode,
    onUpdate,
    onUseTemplate,
    onRemoveTemplate,
    isReadonly,
    stepsFactory,
    isNewStep = true,
    className = '',
    allowableTypes,
    storeMetadata
  } = props
  const formRef = React.useRef<FormikProps<unknown> | null>(null)
  const { setIntermittentLoading } = usePipelineContext()
  const { getString } = useStrings()
  const { projectIdentifier, orgIdentifier, accountId } = useParams<{
    projectIdentifier: string
    orgIdentifier: string
    accountId: string
  }>()
  const artifactSourceTemplate = (artifactSourceConfigNode as TemplateStepNode)?.template || {}
  const { type: artifactSourceType } = artifactSourceTemplate.templateInputs || {}
  const artifactSource = artifactSourceType && artifactSourceBaseFactory.getArtifactSource(artifactSourceType)

  const queryParams = useParams<ProjectPathProps>()
  const { branch, repoIdentifier } = useQueryParams<GitQueryParams>()
  const scope = getScopeFromValue(artifactSourceTemplate?.templateRef)

  const [loadingMergedTemplateInputs, setLoadingMergedTemplateInputs] = React.useState<boolean>(false)
  const [formValues, setFormValues] = React.useState<TemplateStepNode>(getFormValues(artifactSourceConfigNode))
  const [allValues, setAllValues] = React.useState<StepElementConfig>()

  const {
    data: artifactSourceTemplateResponse,
    error: artifactSourceTemplateError,
    refetch: refetchArtifactSourceTemplate,
    loading: artifactSourceTemplateLoading
  } = useGetTemplate({
    templateIdentifier: artifactSourceTemplate.templateRef,
    queryParams: {
      ...getScopeBasedProjectPathParams(queryParams, scope),
      versionLabel: artifactSourceTemplate.versionLabel,
      ...getGitQueryParamsWithParentScope(storeMetadata, queryParams, repoIdentifier, branch)
    }
  })

  React.useEffect(() => {
    setAllValues(
      (parse(defaultTo(artifactSourceTemplateResponse?.data?.yaml, '')) as { template: ArtifactConfig })?.template.spec
    )
  }, [artifactSourceTemplateResponse?.data?.yaml])

  const {
    data: artifactSourceTemplateInputSetYaml,
    error: artifactSourceTemplateInputSetError,
    refetch: refetchArtifactSourceTemplateInputSet,
    loading: artifactSourceTemplateInputSetLoading
  } = useGetTemplateInputSetYaml({
    templateIdentifier: artifactSourceTemplate.templateRef,
    queryParams: {
      ...getScopeBasedProjectPathParams(queryParams, scope),
      versionLabel: artifactSourceTemplate.versionLabel || '',
      ...getGitQueryParamsWithParentScope(storeMetadata, queryParams, repoIdentifier, branch)
    }
  })

  const templateInputs = React.useMemo(
    () => parse(defaultTo(artifactSourceTemplateInputSetYaml?.data, '')) as ArtifactConfig,
    [artifactSourceTemplateInputSetYaml?.data]
  )

  const updateFormValues = (newTemplateInputs?: ArtifactConfig) => {
    const updateValues = getFormValues(
      produce(formValues, draft => {
        set(draft, 'template.templateInputs', replaceDefaultValues(newTemplateInputs))
      })
    )
    setFormValues(updateValues)
    onUpdate?.(updateValues)
  }

  React.useEffect(() => {
    if (!isEmpty(templateInputs)) {
      setLoadingMergedTemplateInputs(true)
      try {
        getsMergedTemplateInputYamlPromise({
          body: {
            oldTemplateInputs: stringify(defaultTo(artifactSourceTemplate?.templateInputs, '')),
            newTemplateInputs: stringify(templateInputs)
          },
          queryParams: {
            accountIdentifier: queryParams.accountId
          }
        }).then(response => {
          if (response && response.status === 'SUCCESS') {
            setLoadingMergedTemplateInputs(false)
            updateFormValues(parse(defaultTo(response.data?.mergedTemplateInputs, '')))
          } else {
            throw response
          }
        })
      } catch (error) {
        setLoadingMergedTemplateInputs(false)
        updateFormValues(templateInputs)
      }
    } else if (!artifactSourceTemplateInputSetLoading) {
      updateFormValues(undefined)
    }
  }, [templateInputs])

  React.useEffect(() => {
    if (artifactSourceTemplateInputSetLoading) {
      setAllValues(undefined)
    }
  }, [artifactSourceTemplateInputSetLoading])

  const refetch = () => {
    refetchArtifactSourceTemplate()
    refetchArtifactSourceTemplateInputSet()
  }

  const isLoading =
    artifactSourceTemplateLoading || artifactSourceTemplateInputSetLoading || loadingMergedTemplateInputs

  const error = defaultTo(artifactSourceTemplateInputSetError, artifactSourceTemplateError)

  React.useEffect(() => {
    setIntermittentLoading(isLoading)

    // cleanup
    return () => {
      setIntermittentLoading(false)
    }
  }, [isLoading, setIntermittentLoading])

  React.useImperativeHandle(ref, () => ({
    setFieldError(fieldName: string, err: string) {
      if (formRef.current) {
        formRef.current.setFieldError(fieldName, err)
      }
    },
    isDirty() {
      if (formRef.current) {
        return formRef.current.dirty
      }
    },
    submitForm() {
      if (formRef.current) {
        return formRef.current.submitForm()
      }
      return Promise.resolve()
    },
    getErrors() {
      return formRef.current ? formRef.current.errors : {}
    },
    getValues() {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const stepObj = stepsFactory.getStep(StepType.Template) as PipelineStep<any>
      return formRef.current ? stepObj.processFormData(formRef.current.values) : {}
    },
    resetForm() {
      if (formRef.current) {
        return formRef.current?.resetForm()
      }
      return noop
    }
  }))

  const artifactConfig = get(formValues, 'template.templateInputs.artifacts.primary')

  return (
    <div className={cx(css.stepCommand, className)}>
      <Layout.Vertical margin={'xlarge'} spacing={'xxlarge'}>
        <TemplateBar
          templateLinkConfig={(artifactSourceConfigNode as TemplateStepNode).template}
          onOpenTemplateSelector={onUseTemplate}
          onRemoveTemplate={onRemoveTemplate}
          isReadonly={isReadonly}
          storeMetadata={storeMetadata}
        />
        <div className={stepCss.stepPanel}>
          <Formik<TemplateStepNode>
            onSubmit={values => {
              onUpdate?.(values)
            }}
            initialValues={formValues}
            formName="artifactSourceTemplateDetails"
            validationSchema={Yup.object().shape({
              name: NameSchema({ requiredErrorMsg: getString('pipelineSteps.stepNameRequired') })
            })}
            enableReinitialize={true}
          >
            {(formik: FormikProps<TemplateStepNode>) => {
              setFormikRef(formRef, formik)
              return (
                <FormikForm>
                  <div className={cx(stepCss.formGroup, stepCss.md)}>
                    <FormInput.InputWithIdentifier
                      isIdentifierEditable={isNewStep && !isReadonly}
                      inputLabel={getString('name')}
                      inputGroupProps={{ disabled: isReadonly }}
                    />
                  </div>
                  <Container className={css.inputsContainer}>
                    {isLoading && <PageSpinner />}
                    {!isLoading && error && (
                      <Container height={isEmpty((error?.data as Error)?.responseMessages) ? 300 : 600}>
                        <PageError
                          message={getTemplateErrorMessage(error, css.errorHandler)}
                          onClick={() => refetch()}
                        />
                      </Container>
                    )}
                    {!isLoading && !error && templateInputs && allValues && (
                      <Layout.Vertical padding={{ top: 'large', bottom: 'large' }} spacing={'large'}>
                        <Heading level={5} color={Color.BLACK} margin={{ bottom: 'large' }}>
                          {getString('pipeline.templateInputs')}
                        </Heading>
                        {artifactSource &&
                          artifactSource.renderContent({
                            template: { artifacts: { primary: artifactConfig } },
                            type: artifactSourceType,
                            stepViewType: StepViewType.TemplateUsage,
                            stageIdentifier: '',
                            artifactSourceBaseFactory: artifactSourceBaseFactory,
                            isArtifactsRuntime: true,
                            isPrimaryArtifactsRuntime: true,
                            isSidecarRuntime: false,
                            projectIdentifier,
                            orgIdentifier,
                            accountId,
                            pipelineIdentifier: '',
                            isSidecar: true,
                            artifact: artifactConfig,
                            readonly: isReadonly,
                            allowableTypes: allowableTypes,
                            initialValues: { artifacts: { primary: artifactConfig } },
                            artifactPath: 'primary',
                            path: 'template.templateInputs',
                            formik: formRef.current
                          })}
                      </Layout.Vertical>
                    )}
                  </Container>
                </FormikForm>
              )
            }}
          </Formik>
        </div>
      </Layout.Vertical>
    </div>
  )
}

export const ArtifactSourceTemplateDetailsWithRef = React.forwardRef(ArtifactSourceTemplateDetails)
