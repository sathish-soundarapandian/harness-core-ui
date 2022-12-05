/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useRef, useContext, useEffect } from 'react'
import * as Yup from 'yup'
import { Formik, FormikProps } from 'formik'
import { cloneDeep, debounce, noop, get } from 'lodash-es'
import { Card, Container, FormikForm } from '@harness/uicore'
import { NameIdDescriptionTags } from '@common/components/NameIdDescriptionTags/NameIdDescriptionTags'
import { useStrings } from 'framework/strings'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { isDuplicateStageId } from '@pipeline/components/PipelineStudio/StageBuilder/StageBuilderUtil'
import type { StageElementConfig } from 'services/cd-ng'
import type { ApprovalStageElementConfig } from '@pipeline/utils/pipelineTypes'
import { getNameAndIdentifierSchema } from '@pipeline/utils/tempates'
import { isContextTypeNotStageTemplate } from '@pipeline/components/PipelineStudio/PipelineUtils'
import { StageErrorContext } from '@pipeline/context/StageErrorContext'
import ErrorsStripBinded from '@pipeline/components/ErrorsStrip/ErrorsStripBinded'
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
    isReadonly,
    updateStage,
    getStageFromPipeline
  } = usePipelineContext()
  const { stage } = getStageFromPipeline<ApprovalStageElementConfig>(selectedStageId || '')
  const cloneOriginalData = cloneDeep(stage)
  const { getString } = useStrings()
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const formikRef = useRef<FormikProps<unknown> | null>(null)
  const { subscribeForm, unSubscribeForm } = useContext(StageErrorContext)

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
                  ...(cloneOriginalData.stage as ApprovalStageElementConfig),
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
        <Container margin={{ top: 'xxlarge' }} className={css.actionButtons}>
          {props.children}
        </Container>
      </div>
    </div>
  )
}
