/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Text, Container, Formik, FormikForm, Button, IconName } from '@wings-software/uicore'
import * as Yup from 'yup'
import { get, set } from 'lodash-es'
import type { FormikErrors } from 'formik'
import type { PipelineInfoConfig } from 'services/pipeline-ng'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { useStrings } from 'framework/strings'
import { NameId, NameIdDescriptionTags } from '@common/components/NameIdDescriptionTags/NameIdDescriptionTags'
import { IdentifierSchemaWithoutHook, NameSchemaWithoutHook } from '@common/utils/Validation'
import { isDuplicateStageId } from '@pipeline/components/PipelineStudio/StageBuilder/StageBuilderUtil'
import type { PipelineStageElementConfig, StageElementWrapper } from '@pipeline/utils/pipelineTypes'
import type { TemplateSummaryResponse } from 'services/template-ng'
import { createTemplate } from '@pipeline/utils/templateUtils'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { Category, StageActions } from '@common/constants/TrackingConstants'
import { isContextTypeNotStageTemplate } from '@pipeline/components/PipelineStudio/PipelineUtils'
import css from './PipelineStageMinimalMode.module.scss'

interface EditPipelineStageViewProps {
  data?: StageElementWrapper<PipelineStageElementConfig>
  template?: TemplateSummaryResponse
  onSubmit?: (
    values: StageElementWrapper<PipelineStageElementConfig>,
    identifier: string,
    pipeline?: PipelineInfoConfig
  ) => void
  onChange?: (values: Values) => void
  moduleIcon?: IconName
  orgId: string
  pipelineId: string
  projectId: string
}

interface Values {
  identifier: string
  name: string
  description?: string
  tags?: { [key: string]: string }
  org: string
  pipeline: string
  project: string
}

export function EditPipelineStageView({
  data,
  template,
  onSubmit,
  onChange,
  moduleIcon,
  orgId,
  pipelineId,
  projectId
}: EditPipelineStageViewProps): React.ReactElement {
  const { getString } = useStrings()
  const { trackEvent } = useTelemetry()
  const {
    state: { pipeline },
    contextType,
    isReadonly
  } = usePipelineContext()

  const initialValues: Values = {
    identifier: get(data, 'stage.identifier', ''),
    name: get(data, 'stage.name', ''),
    description: get(data, 'stage.description'),
    tags: get(data, 'stage.tags'),
    org: orgId,
    pipeline: pipelineId,
    project: projectId
  }

  const validationSchema = (): Yup.ObjectSchema => {
    return Yup.object().shape({
      ...(isContextTypeNotStageTemplate(contextType) && {
        name: NameSchemaWithoutHook(getString, {
          requiredErrorMsg: getString('fieldRequired', { field: getString('stageNameLabel') })
        }),
        identifier: IdentifierSchemaWithoutHook(getString)
      })
    })
  }

  const handleValidate = (values: Values): FormikErrors<Values> => {
    const errors: { name?: string } = {}
    if (isDuplicateStageId(values.identifier, pipeline?.stages || [])) {
      errors.name = getString('validation.identifierDuplicate')
    }
    if (data) {
      onChange?.(values)
    }
    return errors
  }

  const handleSubmit = (values: Values): void => {
    if (data?.stage) {
      if (template) {
        onSubmit?.({ stage: createTemplate(values, template) }, values.identifier)
      } else {
        data.stage.identifier = values.identifier
        data.stage.name = values.name
        if (values.description) data.stage.description = values.description
        if (values.tags) data.stage.tags = values.tags
        if (!data.stage.spec) data.stage.spec = {} as any
        set(data, 'stage.spec.org', values.org)
        set(data, 'stage.spec.pipeline', values.pipeline)
        set(data, 'stage.spec.project', values.project)
        onSubmit?.(data, values.identifier)
      }
    }
  }
  React.useEffect(() => {
    trackEvent(StageActions.LoadEditStageView, {
      category: Category.STAGE
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className={css.stageCreate}>
      <Container padding="medium">
        <Formik
          enableReinitialize
          formName="ChainedPipelineEditStage"
          initialValues={initialValues}
          validationSchema={validationSchema()}
          validate={values => handleValidate(values)}
          onSubmit={values => handleSubmit(values)}
        >
          {formikProps => (
            <FormikForm>
              <Text
                font={{ size: 'medium', weight: 'semi-bold' }}
                icon={moduleIcon}
                iconProps={{ size: 24, margin: { right: 'xsmall' } }}
                margin={{ bottom: 'medium' }}
                className={css.addStageHeading}
              >
                {getString('pipelineSteps.build.create.aboutYourStage')}
              </Text>
              {isContextTypeNotStageTemplate(contextType) &&
                (template ? (
                  <NameId
                    identifierProps={{
                      inputLabel: getString('stageNameLabel'),
                      inputGroupProps: {
                        disabled: isReadonly,
                        placeholder: getString('pipeline.aboutYourStage.stageNamePlaceholder')
                      }
                    }}
                  />
                ) : (
                  <NameIdDescriptionTags
                    formikProps={formikProps}
                    identifierProps={{
                      inputLabel: getString('stageNameLabel'),
                      inputGroupProps: {
                        disabled: isReadonly,
                        placeholder: getString('pipeline.aboutYourStage.stageNamePlaceholder')
                      }
                    }}
                    descriptionProps={{ disabled: isReadonly }}
                    tagsProps={{ disabled: isReadonly }}
                  />
                ))}
              <Button
                type="submit"
                intent="primary"
                text={getString('pipelineSteps.build.create.setupStage')}
                margin={{ top: 'small' }}
              />
            </FormikForm>
          )}
        </Formik>
      </Container>
    </div>
  )
}
