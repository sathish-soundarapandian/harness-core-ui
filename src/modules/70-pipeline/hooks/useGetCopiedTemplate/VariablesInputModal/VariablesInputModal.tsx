/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { defaultTo, isEmpty, set } from 'lodash-es'
import { Spinner } from '@blueprintjs/core'
import {
  AllowedTypes,
  Button,
  ButtonVariation,
  Container,
  FormikForm,
  Layout,
  MultiTypeInputType,
  Text
} from '@wings-software/uicore'
import { Formik, FormikProps } from 'formik'
import { Color } from '@wings-software/design-system'
import { useToaster } from '@common/components'
import { useQueryParams } from '@common/hooks'
import type { GitQueryParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import type { AllNGVariables } from '@pipeline/utils/types'
import {
  copyTemplateWithVariablesPromise,
  TemplateSummaryResponse,
  useGetTemplateInputSetYaml
} from 'services/template-ng'
import { getGitQueryParamsWithParentScope } from '@common/utils/gitSyncUtils'
import { parse, stringify } from '@common/utils/YamlHelperMethods'
import type { NGVariable, TemplateLinkConfig } from 'services/pipeline-ng'
import factory from '@pipeline/components/PipelineSteps/PipelineStepFactory'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { clearRuntimeInput } from '@pipeline/utils/runPipelineUtils'
import useRBACError from '@rbac/utils/useRBACError/useRBACError'
import { StepWidget } from '@pipeline/components/AbstractSteps/StepWidget'
import type {
  CustomVariableInputSetExtraProps,
  CustomVariablesData
} from '@pipeline/components/PipelineSteps/Steps/CustomVariables/CustomVariableInputSet'
import type { AbstractStepFactory } from '@pipeline/components/AbstractSteps/AbstractStepFactory'
import { isMultiTypeRuntime } from '@common/utils/utils'
import type { VariablesInputModalProps } from '@pipeline/hooks/useGetCopiedTemplate/useGetCopiedTemplate'
import { useStrings } from 'framework/strings'

export function VariablesInputModal({
  template,
  onResolve,
  onReject,
  storeMetadata,
  expressions
}: VariablesInputModalProps) {
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

  const onSubmit = async ({ variables }: { variables: AllNGVariables[] }) => {
    setLoadingCopyTemplate(true)
    try {
      const response = await copyTemplateWithVariablesPromise({
        body: {
          templateYaml: defaultTo(template.yaml, ''),
          variables
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
