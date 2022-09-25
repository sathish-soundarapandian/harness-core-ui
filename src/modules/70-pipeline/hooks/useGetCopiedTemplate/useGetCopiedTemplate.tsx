/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useModalHook } from '@harness/use-modal'
import { Dialog, Spinner } from '@blueprintjs/core'
import { Container, FormikForm } from '@harness/uicore'
import { Formik, FormikProps } from 'formik'
import { AllowedTypes, Button, ButtonVariation, Layout, MultiTypeInputType, Text } from '@wings-software/uicore'
import { defaultTo, isEmpty, set } from 'lodash-es'
import { Color } from '@wings-software/design-system'
import { useStrings } from 'framework/strings'
import type { NGVariable, TemplateLinkConfig } from 'services/pipeline-ng'
import type {
  CustomVariableInputSetExtraProps,
  CustomVariablesData
} from '@pipeline/components/PipelineSteps/Steps/CustomVariables/CustomVariableInputSet'
import factory from '@pipeline/components/PipelineSteps/PipelineStepFactory'
import type { AbstractStepFactory } from '@pipeline/components/AbstractSteps/AbstractStepFactory'
import type { AllNGVariables } from '@pipeline/utils/types'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { StepWidget } from '@pipeline/components/AbstractSteps/StepWidget'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { parse, stringify } from '@common/utils/YamlHelperMethods'
import { getGitQueryParamsWithParentScope } from '@common/utils/gitSyncUtils'
import type { StoreMetadata } from '@common/constants/GitSyncTypes'
import { useQueryParams } from '@common/hooks'
import type { GitQueryParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import {
  copyTemplateWithVariablesPromise,
  TemplateSummaryResponse,
  useGetTemplateInputSetYaml
} from 'services/template-ng'
import { clearRuntimeInput } from '@pipeline/utils/runPipelineUtils'
import useRBACError from '@rbac/utils/useRBACError/useRBACError'
import { useToaster } from '@common/components'
import { isMultiTypeRuntime } from '@common/utils/utils'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import css from './useGetCopiedTemplate.module.scss'

export interface VariablesInputModalProps {
  template: TemplateSummaryResponse
  storeMetadata?: StoreMetadata
  expressions?: string[]
  onResolve: (yaml: string) => void
  onReject: () => void
}

const getVariablesMap = (variables: AllNGVariables[]) => {
  return variables.reduce(
    (acc, curr) => {
      if (curr.name) {
        acc[curr.name] = curr.value
      }
      return acc
    },
    {} as {
      [key: string]: any
    }
  )
}

function VariablesInputModal(props: VariablesInputModalProps) {
  const { template, onResolve, onReject, storeMetadata, expressions } = props
  const { getRBACErrorMessage } = useRBACError()
  const { getString } = useStrings()
  const { showError } = useToaster()
  const { branch, repoIdentifier, ...params } = useQueryParams<ProjectPathProps & GitQueryParams>()
  const [loadingCopyTemplate, setLoadingCopyTemplate] = React.useState<boolean>()
  const [variablesTemplate, setVariablesTemplate] = React.useState<AllNGVariables[]>()

  const {
    data: templateInputYaml,
    error: inputSetError,
    loading
  } = useGetTemplateInputSetYaml({
    templateIdentifier: defaultTo(template.identifier, ''),
    queryParams: {
      accountIdentifier: defaultTo(template.accountId, ''),
      orgIdentifier: template.orgIdentifier,
      projectIdentifier: template.projectIdentifier,
      versionLabel: defaultTo(template.versionLabel, ''),
      ...getGitQueryParamsWithParentScope(storeMetadata, params, repoIdentifier, branch)
    }
  })

  React.useEffect(() => {
    if (templateInputYaml?.data) {
      const parsedData = parse<TemplateLinkConfig>(templateInputYaml.data)
      if (!isEmpty(parsedData.variables)) {
        setVariablesTemplate(parsedData.variables as AllNGVariables[])
      } else {
        onResolve(defaultTo(template.yaml, ''))
      }
    } else if (!loading) {
      onResolve(defaultTo(template.yaml, ''))
    }
  }, [templateInputYaml?.data])

  React.useEffect(() => {
    if (inputSetError) {
      showError(getRBACErrorMessage(inputSetError), undefined, 'template.get.templateInputs.error')
      onReject()
    }
  }, [inputSetError])

  const onSubmit = async ({ variables: updatedVariables }: { variables: AllNGVariables[] }) => {
    setLoadingCopyTemplate(true)
    try {
      const response = await copyTemplateWithVariablesPromise({
        body: {
          templateYaml: defaultTo(template.yaml, ''),
          variableValues: getVariablesMap(updatedVariables)
        },
        queryParams: {
          accountIdentifier: defaultTo(template.accountId, ''),
          orgIdentifier: template.orgIdentifier,
          projectIdentifier: template.projectIdentifier
        }
      })
      if (response && response.status === 'SUCCESS') {
        onResolve(stringify({ template: parse<TemplateSummaryResponse>(defaultTo(response.data, '')) }))
      } else {
        throw response
      }
    } catch (error) {
      setLoadingCopyTemplate(false)
      showError(getRBACErrorMessage(error), undefined, 'template.copy.variables.error')
    }
  }

  const onValidate = (values: { variables: NGVariable[] }) => {
    const errorsResponse = factory.getStep(StepType.CustomVariable)?.validateInputSet({
      data: values,
      template: { variables: variablesTemplate },
      getString,
      viewType: StepViewType.DeploymentForm
    }) as { variables: NGVariable[] }

    if (!isEmpty(errorsResponse)) {
      return set({}, 'variables', errorsResponse?.variables)
    } else {
      return {}
    }
  }

  if (loading || loadingCopyTemplate || !variablesTemplate) {
    return <Spinner />
  }

  return (
    <Container padding={'xxxlarge'}>
      <Formik<{ variables: AllNGVariables[] }>
        initialValues={{ variables: clearRuntimeInput(variablesTemplate) as AllNGVariables[] }}
        onSubmit={onSubmit}
        validate={onValidate}
        enableReinitialize={true}
      >
        {(formik: FormikProps<{ variables: AllNGVariables[] }>) => {
          return (
            <FormikForm>
              <Container>
                <Layout.Vertical spacing={'large'}>
                  <Text color={Color.GREY_800} font={{ weight: 'bold', size: 'medium' }}>
                    {getString('pipeline.copiedTemplateDialog.title')}
                  </Text>
                  <Text font={{ size: 'small', weight: 'semi-bold' }} color={Color.GREY_600}>
                    {getString('pipeline.copiedTemplateDialog.subTitle')}
                  </Text>
                  <Container>
                    <StepWidget<CustomVariablesData, CustomVariableInputSetExtraProps>
                      factory={factory as unknown as AbstractStepFactory}
                      initialValues={{ variables: formik.values.variables as AllNGVariables[] }}
                      allowableTypes={
                        Object.values(MultiTypeInputType).filter(
                          allowedType => !isMultiTypeRuntime(allowedType)
                        ) as AllowedTypes
                      }
                      type={StepType.CustomVariable}
                      stepViewType={StepViewType.InputSet}
                      customStepProps={{
                        template: { variables: variablesTemplate as AllNGVariables[] },
                        expressions
                      }}
                    />
                  </Container>
                  <Container>
                    <Layout.Horizontal spacing="small" flex={{ alignItems: 'flex-end', justifyContent: 'flex-start' }}>
                      <Button text={getString('continue')} type="submit" variation={ButtonVariation.PRIMARY} />
                      <Button text={getString('cancel')} variation={ButtonVariation.TERTIARY} onClick={onReject} />
                    </Layout.Horizontal>
                  </Container>
                </Layout.Vertical>
              </Container>
            </FormikForm>
          )
        }}
      </Formik>
    </Container>
  )
}

export default function useGetCopiedTemplate(): {
  getCopiedTemplate: (template: TemplateSummaryResponse) => Promise<string>
} {
  const { expressions } = useVariablesExpression()
  const {
    state: { storeMetadata }
  } = usePipelineContext()
  const [modalProps, setModalProps] = React.useState<{
    template: TemplateSummaryResponse
    resolve: (yaml: string) => void
    reject: () => void
  }>()

  const [showModal, hideModal] = useModalHook(() => {
    return (
      <Dialog enforceFocus={false} isOpen={true} className={css.templateVariablesDialog}>
        {modalProps && (
          <VariablesInputModal
            template={modalProps.template}
            onResolve={modalProps.resolve}
            onReject={modalProps.reject}
            storeMetadata={storeMetadata}
            expressions={expressions}
          />
        )}
      </Dialog>
    )
  }, [modalProps, storeMetadata, expressions])

  const getCopiedTemplate = (template: TemplateSummaryResponse): Promise<string> => {
    return new Promise((resolve, reject) => {
      setModalProps({
        template,
        resolve: (yaml: string) => {
          hideModal()
          resolve(yaml)
        },
        reject: () => {
          hideModal()
          reject()
        }
      })
      showModal()
    })
  }
  return { getCopiedTemplate }
}
