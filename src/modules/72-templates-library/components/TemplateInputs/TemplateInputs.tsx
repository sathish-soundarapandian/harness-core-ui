/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import {
  Container,
  MultiTypeInputType,
  Text,
  Layout,
  Formik,
  PageError,
  AllowedTypesWithRunTime
} from '@wings-software/uicore'
import { parse } from 'yaml'
import { Color } from '@harness/design-system'
import { defaultTo, noop } from 'lodash-es'
import { useParams } from 'react-router-dom'
import { TemplateSummaryResponse, useGetTemplateInputSetYaml } from 'services/template-ng'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { PageSpinner } from '@common/components'
import {
  SecretManagerTemplateInputSet,
  ScriptVariablesRuntimeInput
} from '@secrets/components/ScriptVariableRuntimeInput/ScriptVariablesRuntimeInput'
import type {
  StageElementConfig,
  StepElementConfig,
  PipelineInfoConfig,
  TemplateLinkConfig
} from 'services/pipeline-ng'
import type { NGTemplateInfoConfigWithGitDetails } from 'framework/Templates/TemplateConfigModal/TemplateConfigModal'
import type { AccountPathProps, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import { DeploymentConfigRuntimeInputs } from '@pipeline/components/DeploymentConfigRuntimeInputs/DeploymentConfigRuntimeInputs'
import {
  ArtifactSourceConfigDetails,
  ArtifactSourceConfigRuntimeInputs
} from '@pipeline/components/ArtifactSourceConfigRuntimeInputs/ArtifactSourceConfigRuntimeInputs'
import { PipelineInputSetFormInternal, StageForm } from '@pipeline/components/PipelineInputSetForm/PipelineInputSetForm'
import type { DeploymentConfig } from '@pipeline/components/PipelineStudio/PipelineVariables/types'
import { TemplateType } from '@templates-library/utils/templatesUtils'
import NoResultsView from '@templates-library/pages/TemplatesPage/views/NoResultsView/NoResultsView'
import { getTemplateNameWithLabel, TEMPLATE_INPUT_PATH } from '@pipeline/utils/templateUtils'
import { StepForm } from '@pipeline/components/PipelineInputSetForm/StageInputSetForm'
import type { StoreMetadata } from '@common/constants/GitSyncTypes'
import { getGitQueryParamsWithParentScope } from '@common/utils/gitSyncUtils'
import css from './TemplateInputs.module.scss'

export interface TemplateInputsProps {
  template: TemplateSummaryResponse | NGTemplateInfoConfigWithGitDetails
  storeMetadata?: StoreMetadata
}

export const TemplateInputs: React.FC<TemplateInputsProps> = ({ template, storeMetadata = {} }) => {
  const templateSpec =
    parse((template as TemplateSummaryResponse).yaml || '')?.template?.spec ||
    (template as NGTemplateInfoConfigWithGitDetails).spec
  const templateVariables =
    parse((template as TemplateSummaryResponse).yaml || '')?.template?.variables ||
    (template as NGTemplateInfoConfigWithGitDetails).variables
  const params = useParams<ProjectPathProps>()
  const { getString } = useStrings()
  const { accountId } = useParams<AccountPathProps>()
  const allowableTypes = [
    MultiTypeInputType.FIXED,
    MultiTypeInputType.EXPRESSION,
    MultiTypeInputType.RUNTIME
  ] as AllowedTypesWithRunTime[]
  const templateEntityType =
    (template as TemplateSummaryResponse).templateEntityType || (template as NGTemplateInfoConfigWithGitDetails).type
  const repo =
    (template as TemplateSummaryResponse).gitDetails?.repoIdentifier ||
    (template as NGTemplateInfoConfigWithGitDetails).repo
  const branch =
    (template as TemplateSummaryResponse).gitDetails?.branch || (template as NGTemplateInfoConfigWithGitDetails).branch
  const [inputSetTemplate, setInputSetTemplate] =
    React.useState<{ template: Omit<TemplateLinkConfig, 'templateRef'> }>()

  const {
    data: templateInputYaml,
    error: inputSetError,
    refetch,
    loading
  } = useGetTemplateInputSetYaml({
    templateIdentifier: defaultTo(template.identifier, ''),
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier: template.orgIdentifier,
      projectIdentifier: template.projectIdentifier,
      versionLabel: defaultTo(template.versionLabel, ''),
      ...getGitQueryParamsWithParentScope(storeMetadata, params, repo, branch)
    }
  })

  React.useEffect(() => {
    if (templateInputYaml?.data) {
      setInputSetTemplate({ template: parse(templateInputYaml.data) })
    }
  }, [templateInputYaml?.data])

  React.useEffect(() => {
    if (loading) {
      setInputSetTemplate(undefined)
    }
  }, [loading])

  return (
    <Container
      style={{ overflow: 'auto' }}
      padding={{ top: 'xlarge', left: 'xxlarge', right: 'xxlarge' }}
      className={css.container}
    >
      <Layout.Vertical>
        {loading && <PageSpinner />}
        {!loading && inputSetError && (
          <Container height={300}>
            <PageError
              message={defaultTo((inputSetError.data as Error)?.message, inputSetError.message)}
              onClick={() => refetch()}
            />
          </Container>
        )}
        {!loading && !inputSetError && !inputSetTemplate && (
          <Container flex height={300}>
            <NoResultsView minimal={true} text={getString('templatesLibrary.noInputsRequired')} />
          </Container>
        )}
        {!loading && !inputSetError && inputSetTemplate && (
          <Container className={css.inputsContainer}>
            <Layout.Vertical spacing={'xlarge'}>
              <Text font={{ size: 'normal', weight: 'bold' }} color={Color.GREY_800}>
                {getTemplateNameWithLabel(template)}
              </Text>
              <Formik<{
                template: Omit<TemplateLinkConfig, 'templateRef'>
              }>
                onSubmit={noop}
                initialValues={{ template: { templateInputs: templateSpec, variables: templateVariables } }}
                formName="templateInputs"
                enableReinitialize={true}
              >
                {formikProps => {
                  return (
                    <Layout.Vertical spacing={'large'}>
                      {templateEntityType === TemplateType.Pipeline && (
                        <PipelineInputSetFormInternal
                          template={inputSetTemplate as PipelineInfoConfig}
                          originalPipeline={formikProps.values.template.templateInputs as PipelineInfoConfig}
                          path={TEMPLATE_INPUT_PATH}
                          viewType={StepViewType.TemplateUsage}
                          readonly={true}
                          allowableTypes={allowableTypes}
                          viewTypeMetadata={{ isTemplateDetailDrawer: true }}
                        />
                      )}
                      {templateEntityType === TemplateType.Stage && (
                        <StageForm
                          template={{ stage: inputSetTemplate as StageElementConfig }}
                          allValues={{ stage: formikProps.values.template.templateInputs as StageElementConfig }}
                          path={''}
                          viewType={StepViewType.TemplateUsage}
                          readonly={true}
                          allowableTypes={allowableTypes}
                          hideTitle={true}
                          stageClassName={css.stageCard}
                        />
                      )}
                      {templateEntityType === TemplateType.Step && (
                        <Container
                          className={css.inputsCard}
                          background={Color.WHITE}
                          padding={'large'}
                          margin={{ bottom: 'xxlarge' }}
                        >
                          <StepForm
                            template={{ step: inputSetTemplate as unknown as StepElementConfig }}
                            allValues={{ step: formikProps.values.template.templateInputs as StepElementConfig }}
                            path={''}
                            viewType={StepViewType.TemplateUsage}
                            readonly={true}
                            allowableTypes={allowableTypes}
                            hideTitle={true}
                            onUpdate={noop}
                          />
                        </Container>
                      )}
                      {templateEntityType === TemplateType.SecretManager && (
                        <ScriptVariablesRuntimeInput
                          template={
                            inputSetTemplate.template.templateInputs as SecretManagerTemplateInputSet['templateInputs']
                          }
                          allowableTypes={[]}
                          readonly
                          enabledExecutionDetails
                          path={TEMPLATE_INPUT_PATH}
                        />
                      )}
                      {templateEntityType === TemplateType.CustomDeployment && (
                        <Container
                          className={css.inputsCard}
                          background={Color.WHITE}
                          padding={'large'}
                          margin={{ bottom: 'xxlarge' }}
                        >
                          <DeploymentConfigRuntimeInputs
                            template={inputSetTemplate.template.templateInputs as DeploymentConfig}
                            allowableTypes={allowableTypes}
                            readonly
                            path={TEMPLATE_INPUT_PATH}
                          />
                        </Container>
                      )}
                      {templateEntityType === TemplateType.ArtifactSource && (
                        <Container
                          className={css.inputsCard}
                          background={Color.WHITE}
                          padding={'large'}
                          margin={{ bottom: 'xxlarge' }}
                        >
                          <ArtifactSourceConfigRuntimeInputs
                            template={inputSetTemplate.template.templateInputs as ArtifactSourceConfigDetails}
                            allowableTypes={allowableTypes}
                            readonly
                            path={'data'}
                          />
                        </Container>
                      )}
                    </Layout.Vertical>
                  )
                }}
              </Formik>
            </Layout.Vertical>
          </Container>
        )}
      </Layout.Vertical>
    </Container>
  )
}
