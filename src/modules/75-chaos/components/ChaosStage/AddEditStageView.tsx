import React, { ReactElement } from 'react'
import * as Yup from 'yup'
import { Button, Color, Container, Formik, FormikForm, Icon, Text, useToggleOpen } from '@harness/uicore'
import type { FormikConfig, FormikErrors } from 'formik'
import { Drawer } from '@blueprintjs/core'
import type { StageElementWrapper } from '@pipeline/utils/pipelineTypes'
import { useStrings } from 'framework/strings'
import { NameIdDescription } from '@common/components/NameIdDescriptionTags/NameIdDescriptionTags'
import {
  PipelineContextType,
  usePipelineContext
} from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import type { TemplateSummaryResponse } from 'services/template-ng'
import { createTemplate, getTemplateNameWithLabel } from '@pipeline/utils/templateUtils'
import { illegalIdentifiers, regexIdentifier } from '@common/utils/StringUtils'
import { isDuplicateStageId } from '@pipeline/components/PipelineStudio/StageBuilder/StageBuilderUtil'
import css from './AddEditStageView.module.scss'

interface Values {
  identifier: string
  name: string
  description?: string
}

interface AddEditStageViewProps {
  data?: StageElementWrapper
  template?: TemplateSummaryResponse
  onSubmit?: (values: StageElementWrapper, identifier: string) => void
  onChange?: (values: Values) => void
}

const AddEditStageView = (props: AddEditStageViewProps): ReactElement => {
  const { data, template, onSubmit, onChange } = props
  const { getString } = useStrings()
  const {
    state: { pipeline },
    contextType
  } = usePipelineContext()
  const {
    isOpen: isExperimentDrawerOpen,
    open: openExperimentDrawer,
    close: closeExperimentDrawer
  } = useToggleOpen(false)

  const isTemplate = contextType === PipelineContextType.StageTemplate

  const initialValues: Values = {
    identifier: data?.stage?.identifier || '',
    name: data?.stage?.name || '',
    description: data?.stage?.description
  }

  const validationSchema = () =>
    Yup.lazy((_values: Values): any =>
      Yup.object().shape({
        name: Yup.string()
          .trim()
          .required(getString('fieldRequired', { field: getString('stageNameLabel') })),
        identifier: Yup.string().when('name', {
          is: val => val?.length,
          then: Yup.string()
            .required(getString('validation.identifierRequired'))
            .matches(regexIdentifier, getString('validation.validIdRegex'))
            .notOneOf(illegalIdentifiers)
        })
      })
    )

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
        if (!data.stage.spec) data.stage.spec = {}

        onSubmit?.(data, values.identifier)
      }
    }
  }

  const validation: Partial<FormikConfig<Values>> = {}

  if (!isTemplate) {
    validation.validate = handleValidate
    validation.validationSchema = validationSchema
  }

  return (
    <Container padding="medium" width={430} className={css.addEditStageView}>
      <Formik
        enableReinitialize
        formName="chaosAddStage"
        initialValues={initialValues}
        onSubmit={openExperimentDrawer}
        {...validation}
      >
        {formikProps => (
          <FormikForm>
            <Text font={{ weight: 'bold' }} icon="chaos-main" iconProps={{ size: 16 }} margin={{ bottom: 'medium' }}>
              {getString('pipelineSteps.build.create.aboutYourStage')}
            </Text>
            {!isTemplate && (
              <NameIdDescription
                formikProps={formikProps}
                identifierProps={{
                  inputLabel: getString('stageNameLabel')
                }}
              />
            )}
            {template && (
              <Text
                icon={'template-library'}
                margin={{ top: 'medium', bottom: 'medium' }}
                font={{ size: 'small' }}
                iconProps={{ size: 12, margin: { right: 'xsmall' } }}
                color={Color.BLACK}
              >
                {`Using Template: ${getTemplateNameWithLabel(template)}`}
              </Text>
            )}
            <Button
              type="submit"
              intent="primary"
              text={getString('pipelineSteps.build.create.setupStage')}
              margin={{ top: 'small' }}
            />
          </FormikForm>
        )}
      </Formik>
      <Drawer isOpen={isExperimentDrawerOpen} className={css.addExperimentDrawer}>
        <Button intent="primary" icon="cross" onClick={closeExperimentDrawer} className={css.closeButton} />
        Placeholder for drawer content from Chaos Microfrontend
      </Drawer>
    </Container>
  )
}

export default AddEditStageView
