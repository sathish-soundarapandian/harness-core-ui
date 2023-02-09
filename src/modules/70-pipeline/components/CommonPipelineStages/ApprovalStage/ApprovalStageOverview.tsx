/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useRef } from 'react'
import cx from 'classnames'
import * as Yup from 'yup'
import { Formik } from 'formik'
import { debounce, noop } from 'lodash-es'
import { Accordion, Card, Container, FormikForm, HarnessDocTooltip, Layout, Text } from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import produce from 'immer'
import { NameIdDescriptionTags } from '@common/components/NameIdDescriptionTags/NameIdDescriptionTags'
import { useStrings } from 'framework/strings'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { isDuplicateStageId } from '@pipeline/components/PipelineStudio/StageBuilder/StageBuilderUtil'
import { StepWidget } from '@pipeline/components/AbstractSteps/StepWidget'
import type { CustomVariablesData } from '@pipeline/components/PipelineSteps/Steps/CustomVariables/CustomVariableEditable'
import type { StageElementConfig, StringNGVariable } from 'services/cd-ng'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { usePipelineVariables } from '@pipeline/components/PipelineVariablesContext/PipelineVariablesContext'
import type { AllNGVariables } from '@pipeline/utils/types'
import type { ApprovalStageElementConfig } from '@pipeline/utils/pipelineTypes'
import { getNameAndIdentifierSchema } from '@pipeline/utils/tempates'
import { isContextTypeNotStageTemplate } from '@pipeline/components/PipelineStudio/PipelineUtils'
import type { ApprovalStageOverviewProps } from './types'
import css from './ApprovalStageOverview.module.scss'

export function ApprovalStageOverview(props: ApprovalStageOverviewProps): React.ReactElement {
  const {
    state: {
      pipeline: { stages = [] },
      selectionState: { selectedStageId }
    },
    contextType,
    allowableTypes,
    stepsFactory,
    isReadonly,
    updateStage,
    getStageFromPipeline
  } = usePipelineContext()
  const { variablesPipeline, metadataMap } = usePipelineVariables()
  const { stage } = getStageFromPipeline<ApprovalStageElementConfig>(selectedStageId || '')
  const allNGVariables = (stage?.stage?.variables || []) as AllNGVariables[]
  const { getString } = useStrings()
  const scrollRef = useRef<HTMLDivElement | null>(null)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const updateStageDebounced = useCallback(debounce(updateStage, 300), [updateStage])

  return (
    <div className={cx(css.approvalStageOverviewWrapper, css.stageSection)}>
      <div className={css.content} ref={scrollRef}>
        <Text font={{ variation: FontVariation.H5 }} margin={{ bottom: 'small' }} id="stageOverview">
          {getString('stageOverview')}
        </Text>
        <Container id="stageOverview" className={css.basicOverviewDetails}>
          <Formik
            initialValues={{
              identifier: stage?.stage?.identifier,
              name: stage?.stage?.name,
              description: stage?.stage?.description,
              tags: stage?.stage?.tags || {}
            }}
            validationSchema={Yup.object().shape(getNameAndIdentifierSchema(getString, contextType))}
            validate={values => {
              const errors: { name?: string } = {}
              if (isDuplicateStageId(values.identifier || '', stages, true)) {
                errors.name = getString('validation.identifierDuplicate')
              }
              if (stage?.stage) {
                updateStageDebounced(
                  produce(stage.stage, draft => {
                    draft.name = values?.name || ''
                    draft.identifier = values?.identifier || ''
                    draft.description = values?.description || ''
                    draft.tags = values.tags || {}
                  })
                )
              }
              return errors
            }}
            onSubmit={noop}
          >
            {formikProps => (
              <FormikForm>
                {isContextTypeNotStageTemplate(contextType) && (
                  <Card className={cx(css.sectionCard)}>
                    <NameIdDescriptionTags
                      formikProps={formikProps}
                      descriptionProps={{
                        disabled: isReadonly
                      }}
                      identifierProps={{
                        isIdentifierEditable: false,
                        inputGroupProps: { disabled: isReadonly }
                      }}
                      tagsProps={{
                        disabled: isReadonly
                      }}
                    />
                  </Card>
                )}
              </FormikForm>
            )}
          </Formik>
        </Container>

        <Accordion activeId={allNGVariables.length > 0 ? 'variables' : ''}>
          <Accordion.Panel
            id="variables"
            summary={
              <Text margin={{ left: 'small' }} font={{ variation: FontVariation.H5 }}>
                {getString('advancedTitle')}
              </Text>
            }
            addDomId={true}
            details={
              <Card className={css.sectionCard} id="variables">
                <div className={cx(css.tabSubHeading, 'ng-tooltip-native')} data-tooltip-id="overviewStageVariables">
                  {getString('pipeline.stageVariables')}
                  <HarnessDocTooltip tooltipId="overviewStageVariables" useStandAlone={true} />
                </div>
                <Layout.Horizontal>
                  <StepWidget<CustomVariablesData>
                    factory={stepsFactory}
                    readonly={isReadonly}
                    initialValues={{
                      variables: ((stage?.stage as StageElementConfig)?.variables || []) as AllNGVariables[],
                      canAddVariable: true
                    }}
                    allowableTypes={allowableTypes}
                    type={StepType.CustomVariable}
                    stepViewType={StepViewType.StageVariable}
                    onUpdate={({ variables }: CustomVariablesData) => {
                      if (!stage?.stage) {
                        return
                      }

                      updateStageDebounced(
                        produce(stage.stage, draft => {
                          draft.variables = variables
                        })
                      )
                    }}
                    customStepProps={{
                      yamlProperties:
                        getStageFromPipeline(
                          stage?.stage?.identifier || '',
                          variablesPipeline
                        )?.stage?.stage?.variables?.map?.(
                          variable => metadataMap[(variable as StringNGVariable).value || '']?.yamlProperties || {}
                        ) || []
                    }}
                  />
                </Layout.Horizontal>
              </Card>
            }
          />
        </Accordion>

        {props.children}
      </div>
    </div>
  )
}
