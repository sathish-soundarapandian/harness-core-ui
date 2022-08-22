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
import useRBACError from '@rbac/utils/useRBACError/useRBACError'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { PageSpinner, useToaster } from '@common/components'
import type { StageElementConfig, StepElementConfig, PipelineInfoConfig } from 'services/pipeline-ng'
import type { NGTemplateInfoConfigWithGitDetails } from 'framework/Templates/TemplateConfigModal/TemplateConfigModal'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import { PipelineInputSetFormInternal, StageForm } from '@pipeline/components/PipelineInputSetForm/PipelineInputSetForm'
import { getTemplateRuntimeInputsCount, TemplateType } from '@templates-library/utils/templatesUtils'
import NoResultsView from '@templates-library/pages/TemplatesPage/views/NoResultsView/NoResultsView'
import { getTemplateNameWithLabel } from '@pipeline/utils/templateUtils'
import { StepForm } from '@pipeline/components/PipelineInputSetForm/StageInputSetForm'
import css from './TemplateInputs.module.scss'

export interface TemplateInputsProps {
  template: TemplateSummaryResponse | NGTemplateInfoConfigWithGitDetails
}

export const TemplateInputs: React.FC<TemplateInputsProps> = ({ template }) => {
  const templateSpec =
    parse((template as TemplateSummaryResponse)?.yaml || '').template.spec ||
    (template as NGTemplateInfoConfigWithGitDetails).spec
  const [inputSetTemplate, setInputSetTemplate] = React.useState<
    StepElementConfig | StageElementConfig | PipelineInfoConfig
  >()
  const [count, setCount] = React.useState<number>(0)
  const { showError } = useToaster()
  const { getRBACErrorMessage } = useRBACError()
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
      repoIdentifier: repo,
      branch: branch,
      getDefaultFromOtherRepo: true
    }
  })

  React.useEffect(() => {
    try {
      const templateInput = parse(templateInputYaml?.data || '')
      setCount(getTemplateRuntimeInputsCount(templateInput))
      setInputSetTemplate(templateInput)
    } catch (error) {
      showError(getRBACErrorMessage(error), undefined, 'template.parse.inputSet.error')
    }
  }, [templateInputYaml?.data])

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
              <Container>
                <Layout.Horizontal flex={{ alignItems: 'center' }} spacing={'xxxlarge'}>
                  <Text font={{ size: 'normal', weight: 'bold' }} color={Color.GREY_800}>
                    {getTemplateNameWithLabel(template)}
                  </Text>
                  <Text className={css.inputsCount} font={{ size: 'small' }}>
                    {getString('templatesLibrary.inputsCount', { count })}
                  </Text>
                </Layout.Horizontal>
              </Container>
              <Formik<{ data: StepElementConfig | StageElementConfig | PipelineInfoConfig }>
                onSubmit={noop}
                initialValues={{ data: templateSpec }}
                formName="templateInputs"
                enableReinitialize={true}
              >
                {formikProps => {
                  return (
                    <>
                      {templateEntityType === TemplateType.Pipeline && (
                        <PipelineInputSetFormInternal
                          template={inputSetTemplate as PipelineInfoConfig}
                          originalPipeline={formikProps.values.data as PipelineInfoConfig}
                          path={'data'}
                          viewType={StepViewType.InputSet}
                          readonly={true}
                          allowableTypes={allowableTypes}
                          viewTypeMetadata={{ isTemplateDetailDrawer: true }}
                        />
                      )}
                      {templateEntityType === TemplateType.Stage && (
                        <StageForm
                          template={{ stage: inputSetTemplate as StageElementConfig }}
                          allValues={{ stage: formikProps.values.data as StageElementConfig }}
                          path={'data'}
                          viewType={StepViewType.InputSet}
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
                            template={{ step: inputSetTemplate as StepElementConfig }}
                            allValues={{ step: formikProps.values.data as StepElementConfig }}
                            path={'data'}
                            viewType={StepViewType.InputSet}
                            readonly={true}
                            allowableTypes={allowableTypes}
                            hideTitle={true}
                            onUpdate={noop}
                          />
                        </Container>
                      )}
                    </>
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
