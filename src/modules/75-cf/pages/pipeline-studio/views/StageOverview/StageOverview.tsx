/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
import * as Yup from 'yup'
import { Formik } from 'formik'
import { debounce } from 'lodash-es'
import { Heading, Container, FormikForm } from '@harness/uicore'
import { Color } from '@harness/design-system'
import produce from 'immer'
import { NameIdDescription } from '@common/components/NameIdDescriptionTags/NameIdDescriptionTags'
import { useStrings } from 'framework/strings'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { isDuplicateStageId } from '@pipeline/components/PipelineStudio/StageBuilder/StageBuilderUtil'
import { getNameAndIdentifierSchema } from '@cf/utils/stageValidationSchema'

export default function StageOverview(_props: React.PropsWithChildren<unknown>): JSX.Element {
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
  const { stage } = getStageFromPipeline(selectedStageId || '')
  const { getString } = useStrings()
  const updateStageDebounced = useMemo(() => debounce(updateStage, 300), [updateStage])

  return (
    <Container padding="huge">
      <Heading color={Color.BLACK} level={3} style={{ fontWeight: 600, fontSize: '16px', lineHeight: '24px' }}>
        {getString('stageOverview')}
      </Heading>
      <Container data-testid="stageOverview" id="stageOverview">
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
            if (values.identifier && isDuplicateStageId(values.identifier, stages, true)) {
              errors.name = getString('validation.identifierDuplicate')
            }
            if (stage?.stage) {
              updateStageDebounced(
                produce(stage.stage, draft => {
                  draft.name = values?.name || ''
                  draft.identifier = values?.identifier || ''
                  draft.description = values?.description || ''
                })
              )
            }
            return errors
          }}
          onSubmit={values => {
            if (stage?.stage) {
              updateStageDebounced(
                produce(stage.stage, draft => {
                  draft.name = values?.name || ''
                  draft.identifier = values?.identifier || ''
                  draft.description = values?.description || ''
                })
              )
            }
          }}
        >
          {formikProps => (
            <FormikForm>
              <Container
                data-testid="stageOverviewPanel"
                margin={{ top: 'large' }}
                padding="large"
                style={{
                  borderRadius: '4px',
                  width: 400,
                  filter: 'drop-shadow(0px 0px 1px rgba(40, 41, 61, 0.16))'
                }}
                background={Color.WHITE}
              >
                <NameIdDescription
                  formikProps={formikProps}
                  descriptionProps={{
                    disabled: isReadonly
                  }}
                  identifierProps={{
                    isIdentifierEditable: false,
                    inputGroupProps: { disabled: isReadonly }
                  }}
                />
              </Container>
            </FormikForm>
          )}
        </Formik>
      </Container>
      {_props.children}
    </Container>
  )
}
