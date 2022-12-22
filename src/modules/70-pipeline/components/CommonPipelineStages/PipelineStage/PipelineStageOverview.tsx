/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useRef, useContext, useEffect } from 'react'
import cx from 'classnames'
import * as Yup from 'yup'
import { Formik, FormikProps } from 'formik'
import { cloneDeep, debounce, noop, get } from 'lodash-es'
import { Accordion, Card, Container, Text, FormikForm, HarnessDocTooltip, Icon } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { Link, useParams } from 'react-router-dom'
import { NameIdDescriptionTags } from '@common/components/NameIdDescriptionTags/NameIdDescriptionTags'
import { useStrings } from 'framework/strings'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { isDuplicateStageId } from '@pipeline/components/PipelineStudio/StageBuilder/StageBuilderUtil'
import type { StageElementConfig, StringNGVariable } from 'services/cd-ng'
import type { PipelineStageElementConfig } from '@pipeline/utils/pipelineTypes'
import { getNameAndIdentifierSchema } from '@pipeline/utils/tempates'
import { isContextTypeNotStageTemplate } from '@pipeline/components/PipelineStudio/PipelineUtils'
import { StageErrorContext } from '@pipeline/context/StageErrorContext'
import ErrorsStripBinded from '@pipeline/components/ErrorsStrip/ErrorsStripBinded'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import type { CustomVariablesData } from '@pipeline/components/PipelineSteps/Steps/CustomVariables/CustomVariableInputSet'
import type { CustomVariableEditableExtraProps } from '@pipeline/components/PipelineSteps/Steps/CustomVariables/CustomVariableEditable'
import { StepWidget } from '@pipeline/components/AbstractSteps/StepWidget'
import { usePipelineVariables } from '@pipeline/components/PipelineVariablesContext/PipelineVariablesContext'
import type { AllNGVariables } from '@pipeline/utils/types'
import type { AccountPathProps, ModulePathParams } from '@common/interfaces/RouteInterfaces'
import routes from '@common/RouteDefinitions'
import { PipelineStageTabs } from './utils'
import css from './PipelineStageOverview.module.scss'

export interface PipelineStageOverviewProps {
  children: React.ReactElement
}

export function PipelineStageOverview(props: PipelineStageOverviewProps): React.ReactElement {
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
  const { accountId, module } = useParams<AccountPathProps & ModulePathParams>()
  const { stage } = getStageFromPipeline<PipelineStageElementConfig>(selectedStageId || '')
  const { variablesPipeline, metadataMap } = usePipelineVariables()
  const cloneOriginalData = cloneDeep(stage)
  const allNGVariables = (cloneOriginalData?.stage?.variables || []) as AllNGVariables[]
  const { getString } = useStrings()
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const formikRef = useRef<FormikProps<unknown> | null>(null)
  const { subscribeForm, unSubscribeForm } = useContext(StageErrorContext)

  const pipelineIdentifier = get(stage?.stage as PipelineStageElementConfig, 'spec.pipeline', '')
  const projectIdentifier = get(stage?.stage as PipelineStageElementConfig, 'spec.project', '')
  const orgIdentifier = get(stage?.stage as PipelineStageElementConfig, 'spec.org', '')

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const updateStageDebounced = useCallback(
    debounce((values: StageElementConfig): void => {
      updateStage({ ...stage?.stage, ...values })
    }, 300),
    [stage?.stage, updateStage]
  )

  useEffect(() => {
    subscribeForm({ tab: PipelineStageTabs.OVERVIEW, form: formikRef })
    return () => unSubscribeForm({ tab: PipelineStageTabs.OVERVIEW, form: formikRef })
  }, [])

  return (
    <div className={css.pipelineStageOverviewWrapper}>
      <ErrorsStripBinded domRef={scrollRef as React.MutableRefObject<HTMLElement | undefined>} />
      <div className={css.content} ref={scrollRef}>
        <Text font={{ variation: FontVariation.H5 }} margin={{ bottom: 'small' }} id="stageOverview">
          {getString('stageOverview')}
        </Text>
        <Container id="stageOverview">
          <Formik
            enableReinitialize
            initialValues={{
              identifier: get(cloneOriginalData, 'stage.identifier'),
              name: get(cloneOriginalData, 'stage.name'),
              description: get(cloneOriginalData, 'stage.description'),
              tags: get(cloneOriginalData, 'stage.tags', {})
            }}
            validationSchema={Yup.object().shape(getNameAndIdentifierSchema(getString, contextType))}
            validate={values => {
              const errors: { name?: string } = {}
              if (isDuplicateStageId(get(values, 'identifier', ''), stages, true)) {
                errors.name = getString('validation.identifierDuplicate')
              }
              if (cloneOriginalData) {
                updateStageDebounced({
                  ...(cloneOriginalData.stage as PipelineStageElementConfig),
                  name: get(values, 'name', ''),
                  identifier: get(values, 'identifier', ''),
                  description: get(values, 'description', ''),
                  tags: get(values, 'tags', {})
                })
              }
              return errors
            }}
            onSubmit={noop}
          >
            {formikProps => {
              window.dispatchEvent(new CustomEvent('UPDATE_ERRORS_STRIP', { detail: PipelineStageTabs.OVERVIEW })) // to remove the error strip when there is no error
              formikRef.current = formikProps as FormikProps<unknown> | null

              return (
                <FormikForm>
                  {isContextTypeNotStageTemplate(contextType) && (
                    <Card className={css.sectionCard}>
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
              )
            }}
          </Formik>
        </Container>
        <Text font={{ variation: FontVariation.H5 }} margin={{ bottom: 'small', top: 'medium', left: 'small' }}>
          {getString('common.pipeline')}
        </Text>
        <Card className={css.sectionCard}>
          <Link
            to={routes.toPipelineStudio({
              orgIdentifier,
              projectIdentifier,
              pipelineIdentifier,
              accountId,
              module
            })}
            target="_blank"
            className={css.childPipelineDetails}
          >
            <Icon name="chained-pipeline" color={Color.PRIMARY_7} size={20} margin={{ right: 'xsmall' }} />
            <Text font={{ variation: FontVariation.LEAD }} color={Color.PRIMARY_7} lineClamp={1}>
              {`${getString('pipeline.pipelineChaining.childPipelineID')}: ${pipelineIdentifier}`}
            </Text>
            <Icon name="launch" color={Color.PRIMARY_7} size={16} margin={{ left: 'small' }} />
          </Link>
        </Card>
        <Accordion activeId={allNGVariables.length > 0 ? 'advanced' : ''} className={css.accordion}>
          <Accordion.Panel
            id="advanced"
            addDomId={true}
            summary={
              <Text margin={{ right: 'small', left: 'small' }} font={{ variation: FontVariation.H5 }}>
                {getString('advancedTitle')}
              </Text>
            }
            details={
              <Card className={css.variableSectionCard} id="variables">
                <div className={cx(css.tabSubHeading, 'ng-tooltip-native')} data-tooltip-id="overviewStageVariables">
                  {getString('pipeline.stageVariables')}
                  <HarnessDocTooltip tooltipId="overviewStageVariables" useStandAlone={true} />
                </div>
                <StepWidget<CustomVariablesData, CustomVariableEditableExtraProps>
                  factory={stepsFactory}
                  initialValues={{
                    variables: allNGVariables,
                    canAddVariable: true
                  }}
                  readonly={isReadonly}
                  type={StepType.CustomVariable}
                  stepViewType={StepViewType.StageVariable}
                  allowableTypes={allowableTypes}
                  onUpdate={({ variables }: CustomVariablesData) => {
                    updateStageDebounced({
                      ...(cloneOriginalData?.stage as PipelineStageElementConfig),
                      variables
                    })
                  }}
                  customStepProps={{
                    tabName: PipelineStageTabs.OVERVIEW,
                    formName: 'addEditStageCustomVariableForm',
                    yamlProperties:
                      getStageFromPipeline(
                        cloneOriginalData?.stage?.identifier || '',
                        variablesPipeline
                      )?.stage?.stage?.variables?.map?.(
                        variable => metadataMap[(variable as StringNGVariable).value || '']?.yamlProperties || {}
                      ) || [],
                    enableValidation: true
                  }}
                />
              </Card>
            }
          />
        </Accordion>
        <Container margin={{ top: 'xxlarge' }} className={css.actionButtons}>
          {props.children}
        </Container>
      </div>
    </div>
  )
}
