/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Formik, FormikForm, Container, FormInput, Layout, Button, useToggleOpen, Accordion } from '@harness/uicore'
import { Drawer, FormGroup, Label } from '@blueprintjs/core'
import { useHistory, useParams } from 'react-router-dom'
import { StepFormikFowardRef, StepViewType, setFormikRef } from '@pipeline/components/AbstractSteps/Step'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { useStrings } from 'framework/strings'
import {
  getInitialValuesInCorrectFormat,
  getFormValuesInCorrectFormat
} from '@pipeline/components/PipelineSteps/Steps/StepsTransformValuesUtils'
import { validate } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import type { BuildStageElementConfig } from '@pipeline/utils/pipelineTypes'
import ChildAppMounter from 'microfrontends/ChildAppMounter'
import type {
  PipelineExperimentSelectProps,
  ChaosExperiment,
  ExperimentPreviewProps
} from '@chaos/interfaces/Chaos.types'
import routes from '@common/RouteDefinitions'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { NameIdDescription } from '@common/components/NameIdDescriptionTags/NameIdDescriptionTags'
import { transformValuesFieldsConfig, editViewValidateFieldsConfig } from './ChaosExperimentStepFunctionConfigs'
import type {
  ChaosExperimentStepProps,
  ChaosExperimentStepData,
  ChaosExperimentStepDataUI
} from './ChaosExperimentStep'
import OptionalConfiguration from './OptionalConfiguration'
import drawerCss from '@pipeline/components/PipelineStudio/RightDrawer/RightDrawer.module.scss'
import css from './ChaosExperimentStep.module.scss'

// eslint-disable-next-line import/no-unresolved
const PipelineExperimentSelect = React.lazy(() => import('chaos/PipelineExperimentSelect'))
// eslint-disable-next-line import/no-unresolved
const ExperimentPreview = React.lazy(() => import('chaos/ExperimentPreview'))

export const ChaosExperimentStepBase = (
  { initialValues, onUpdate, isNewStep = true, readonly, stepViewType, onChange }: ChaosExperimentStepProps,
  formikRef: StepFormikFowardRef<ChaosExperimentStepData>
): JSX.Element => {
  const history = useHistory()
  const { orgIdentifier, projectIdentifier, accountId } = useParams<ProjectPathProps>()
  const {
    state: {
      selectionState: { selectedStageId }
    }
  } = usePipelineContext()

  const { getString } = useStrings()
  const {
    open: openExperimentDrawer,
    isOpen: isExperimentDrawerOpen,
    close: closeExperimentDrawer
  } = useToggleOpen(false)

  const { getStageFromPipeline } = usePipelineContext()
  const { stage: currentStage } = getStageFromPipeline<BuildStageElementConfig>(selectedStageId || '')

  return (
    <Formik<ChaosExperimentStepData>
      initialValues={getInitialValuesInCorrectFormat<ChaosExperimentStepData, ChaosExperimentStepDataUI>(
        initialValues,
        transformValuesFieldsConfig
      )}
      formName="ChaosExperimentStep"
      validate={valuesToValidate => {
        const schemaValues = getFormValuesInCorrectFormat<ChaosExperimentStepDataUI, ChaosExperimentStepData>(
          valuesToValidate,
          transformValuesFieldsConfig
        )
        onChange?.(schemaValues)
        return validate(
          valuesToValidate,
          editViewValidateFieldsConfig,
          {
            initialValues,
            steps: currentStage?.stage?.spec?.execution?.steps || {},
            serviceDependencies: currentStage?.stage?.spec?.serviceDependencies || {},
            getString
          },
          stepViewType
        )
      }}
      onSubmit={(_values: ChaosExperimentStepDataUI) => {
        const schemaValues = getFormValuesInCorrectFormat<ChaosExperimentStepDataUI, ChaosExperimentStepData>(
          _values,
          transformValuesFieldsConfig
        )
        onUpdate?.(schemaValues)
      }}
    >
      {formikProps => {
        // This is required
        setFormikRef?.(formikRef, formikProps)

        return (
          <FormikForm className={css.chaosExperimentStep}>
            <Layout.Vertical spacing="medium" width="75%">
              {stepViewType !== StepViewType.Template && (
                <NameIdDescription
                  className={css.nameIdDescriptionField}
                  formikProps={formikProps}
                  identifierProps={{
                    isIdentifierEditable: isNewStep && !readonly
                  }}
                  inputGroupProps={{
                    placeholder: getString('pipeline.stepNamePlaceholder'),
                    disabled: readonly
                  }}
                  descriptionProps={{
                    placeholder: getString('chaos.pipelineStep.description')
                  }}
                />
              )}
              <FormGroup>
                <FormGroup>
                  <Label>{getString('chaos.selectChaosExperiment')}</Label>
                  <Button
                    minimal
                    onClick={openExperimentDrawer}
                    id={css.chaosExperimentReferenceField}
                    rightIcon="chevron-down"
                    iconProps={{ size: 12 }}
                  >
                    {formikProps.values.spec.experimentRef || getString('chaos.selectChaosExperiment')}
                  </Button>
                </FormGroup>
                <FormInput.Text
                  label={getString('chaos.pipelineStep.expectedResilienceScoreLabel')}
                  name="spec.expectedResilienceScore"
                  placeholder={getString('chaos.pipelineStep.expectedResilienceScorePlaceholder')}
                  inputGroup={{ type: 'number' }}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  onChange={(e: any) =>
                    formikProps.setFieldValue('spec.expectedResilienceScore', parseInt(e.target.value))
                  }
                />
                <Accordion activeId="step-1">
                  <Accordion.Panel
                    id="optional-config"
                    summary={getString('common.optionalConfig')}
                    details={<OptionalConfiguration formik={formikProps} />}
                  />
                </Accordion>
              </FormGroup>
            </Layout.Vertical>

            <ChildAppMounter<ExperimentPreviewProps>
              ChildApp={ExperimentPreview}
              experimentID={formikProps.values.spec.experimentRef}
            />
            <Drawer isOpen={isExperimentDrawerOpen} enforceFocus={true} size="75%">
              <Button
                minimal
                className={drawerCss.almostFullScreenCloseBtn}
                icon="cross"
                withoutBoxShadow
                onClick={closeExperimentDrawer}
              />
              <Container>
                <ChildAppMounter<PipelineExperimentSelectProps>
                  ChildApp={PipelineExperimentSelect}
                  onSelect={(experiment: ChaosExperiment) => {
                    formikProps.setFieldValue('spec.experimentRef', experiment.id)
                    closeExperimentDrawer()
                  }}
                  goToNewExperiment={() =>
                    history.push(
                      routes.toNewChaosExperiment({
                        accountId: accountId,
                        orgIdentifier: orgIdentifier,
                        projectIdentifier: projectIdentifier
                      })
                    )
                  }
                />
              </Container>
            </Drawer>
          </FormikForm>
        )
      }}
    </Formik>
  )
}

export const ChaosExperimentStepBaseWithRef = React.forwardRef(ChaosExperimentStepBase)
